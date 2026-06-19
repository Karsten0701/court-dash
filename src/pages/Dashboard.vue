<script setup>
import { computed, onMounted, ref, watch } from "vue";
import authService from "@/services/authService.js";
import orgService from "@/services/orgService.js";
import playersService from "@/services/playersService.js";
import gamesService from "@/services/gamesService.js";
import statusService from "@/services/statusService.js";
import AdminDashboard from "@/pages/AdminDashboard.vue";
import { useApiRequest } from "@/composables/useApiRequest.js";
import { useAnimatedNumber } from "@/composables/useAnimatedNumber.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormInput from "@/components/FormInput.vue";
import { t } from "@/i18n";

const accentColorPresets = [
  "#1E88E5",
  "#36B054",
  "#43A047",
  "#FB8C00",
  "#6A1B9A",
  "#E53935",
];

const orgForm = ref({
  name: "",
  accentColor: "#1E88E5",
});
const orgMessage = ref("");
const orgError = ref("");

const {
  data: players,
  loading: loadingPlayers,
  error: playersError,
  refresh: refreshPlayers,
} = useApiRequest(() => playersService.listLeaderboard(), {
  immediate: false,
  maxRetries: 1,
});

const {
  data: games,
  loading: loadingGames,
  error: gamesError,
  refresh: refreshGames,
} = useApiRequest(() => gamesService.listPlannedGames(), {
  immediate: false,
  maxRetries: 1,
});

const {
  data: health,
  loading: loadingHealth,
  error: healthError,
  lastDurationMs,
  refresh: refreshHealth,
} = useApiRequest(() => statusService.getApiHealth(), {
  immediate: false,
  maxRetries: 1,
});

const isPlatformAdmin = computed(() => authService.isAdmin());
const managerOrg = computed(() => orgService.org.value);
const loadingOrg = computed(() => orgService.loading.value);
const updatingOrg = computed(() => orgService.updating.value);
const orgReadOnly = computed(() => orgService.isInactive.value);
const totalPlayers = computed(() => players.value?.length || 0);
const totalGames = computed(() => games.value?.length || 0);
const activeGames = computed(() =>
  (games.value || []).filter((g) =>
    ["planned", "started"].includes(g.status || "planned"),
  ).length,
);

const animatedTotalPlayers = useAnimatedNumber(totalPlayers);
const animatedTotalGames = useAnimatedNumber(totalGames);
const animatedActiveGames = useAnimatedNumber(activeGames);

const apiOnline = computed(() => !!health.value?.ok);
const apiStatusLabel = computed(() => {
  if (loadingHealth.value) return t("status.checking");
  if (healthError.value) return t("status.error");
  return apiOnline.value ? t("status.online") : t("status.offline");
});

const syncOrgForm = (org) => {
  orgForm.value = {
    name: org?.name || "",
    accentColor: org?.accentColor || "#1E88E5",
  };
};

const saveOrg = async () => {
  if (orgReadOnly.value) {
    orgError.value = "Organization is inactive. Complete payment to reactivate before editing.";
    return;
  }

  orgMessage.value = "";
  orgError.value = "";

  try {
    await orgService.updateMyOrg({
      name: orgForm.value.name,
      accentColor: orgForm.value.accentColor,
    });
    orgMessage.value = "Organization updated";
  } catch (err) {
    orgError.value = err.message || "Failed to update organization";
  }
};

watch(managerOrg, syncOrgForm, { immediate: true });

onMounted(() => {
  if (!isPlatformAdmin.value) {
    orgService.loadMyOrg().catch((err) => {
      orgError.value = err.message || "Failed to load organization";
    });
    refreshPlayers();
    refreshGames();
    refreshHealth();
  }
});
</script>

<template>
  <AdminDashboard v-if="isPlatformAdmin" />

  <section v-else class="space-y-5">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2
          class="bg-gradient-to-r from-snow to-snow-dim bg-clip-text text-2xl font-extrabold tracking-tight text-transparent"
        >
          {{ $t("dashboard.title") }}
        </h2>
        <p class="text-sm text-snow-dim">{{ $t("dashboard.subtitle") }}</p>
      </div>
      <button
        type="button"
        class="btn-glass text-xs"
        @click="() => { refreshPlayers(); refreshGames(); refreshHealth(); }"
      >
        <font-awesome-icon icon="arrow-rotate-right" />
        {{ $t("common.refresh") }}
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="glass-card p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-snow-dim">{{ $t("nav.players") }}</p>
          <font-awesome-icon icon="users" class="text-asphalt-muted" />
        </div>
        <div class="h-9">
          <div
            v-if="loadingPlayers"
            class="h-7 w-20 rounded bg-asphalt-light animate-pulse"
          />
          <p v-else class="text-3xl font-semibold tabular-nums">
            {{ animatedTotalPlayers }}
          </p>
        </div>
        <p class="mt-1 text-xs text-asphalt-muted">
          {{ $t("dashboard.playersHint") }}
        </p>
      </div>

      <div class="glass-card p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-snow-dim">{{ $t("nav.games") }}</p>
          <font-awesome-icon icon="calendar-days" class="text-asphalt-muted" />
        </div>
        <div class="h-9">
          <div
            v-if="loadingGames"
            class="h-7 w-20 rounded bg-asphalt-light animate-pulse"
          />
          <p v-else class="text-3xl font-semibold tabular-nums">
            {{ animatedTotalGames }}
          </p>
        </div>
        <p class="mt-1 text-xs text-asphalt-muted">
          {{ $t("dashboard.gamesHint") }}
        </p>
      </div>

      <div class="glass-card p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-snow-dim">{{ $t("dashboard.active") }}</p>
          <font-awesome-icon icon="bolt" class="text-asphalt-muted" />
        </div>
        <div class="h-9">
          <div
            v-if="loadingGames"
            class="h-7 w-16 rounded bg-asphalt-light animate-pulse"
          />
          <p v-else class="text-3xl font-semibold tabular-nums">
            {{ animatedActiveGames }}
          </p>
        </div>
        <p class="mt-1 text-xs text-asphalt-muted">
          {{ $t("dashboard.activeHint") }}
        </p>
      </div>
    </div>

    <div class="glass-card p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-sm font-medium text-snow">Organization settings</p>
          <p class="mt-1 text-sm text-snow-dim">
            Manage your own org branding and see the managers connected to this tenant.
          </p>
        </div>
        <span
          v-if="managerOrg?.status"
          class="inline-flex w-fit rounded-md px-3 py-1 text-xs font-semibold"
          :class="managerOrg.status === 'active'
            ? 'bg-turf/20 text-turf'
            : 'bg-ball/20 text-ball'"
        >
          {{ managerOrg.status }}
        </span>
      </div>

      <div v-if="loadingOrg && !managerOrg" class="mt-5 flex items-center gap-3 text-sm text-snow-dim">
        <LoadingSpinner size="4" />
        Loading organization...
      </div>

      <div v-else class="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <form class="space-y-4" @submit.prevent="saveOrg">
          <FormInput
            id="manager-org-name"
            v-model="orgForm.name"
            label="Organization name"
            :required="true"
            :disabled="updatingOrg || orgReadOnly"
          />

          <div>
            <label
              for="manager-org-color-text"
              class="block text-xs font-semibold uppercase tracking-wide text-snow-dim"
            >
              Accent color <span class="text-danger">*</span>
            </label>
            <div class="mt-2 flex min-h-[3.25rem] items-center gap-2 rounded-xl border border-white/10 bg-asphalt/60 px-2 py-2 focus-within:border-racket focus-within:ring-2 focus-within:ring-racket/30">
              <input
                id="manager-org-color"
                v-model="orgForm.accentColor"
                type="color"
                :disabled="updatingOrg || orgReadOnly"
                class="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-white/10 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Choose accent color"
              />
              <input
                id="manager-org-color-text"
                v-model="orgForm.accentColor"
                type="text"
                required
                pattern="#[0-9A-Fa-f]{6}"
                placeholder="#1E88E5"
                :disabled="updatingOrg || orgReadOnly"
                class="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm text-snow placeholder:text-asphalt-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="color in accentColorPresets"
                :key="color"
                type="button"
                class="h-6 w-6 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-racket/30 disabled:cursor-not-allowed disabled:opacity-50"
                :class="orgForm.accentColor?.toLowerCase() === color.toLowerCase()
                  ? 'border-snow ring-2 ring-racket/30'
                  : 'border-asphalt-light'"
                :style="{ backgroundColor: color }"
                :aria-label="`Use ${color}`"
                :disabled="updatingOrg || orgReadOnly"
                @click="orgForm.accentColor = color"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-h-5 text-sm">
              <p v-if="orgMessage" class="text-turf">{{ orgMessage }}</p>
              <p v-if="orgError" class="text-danger">{{ orgError }}</p>
              <p v-if="orgReadOnly" class="text-ball">
                This org is read-only until payment reactivation.
              </p>
            </div>
            <button
              type="submit"
              class="btn-violet"
              :disabled="updatingOrg || orgReadOnly"
            >
              <LoadingSpinner v-if="updatingOrg" size="4" />
              <font-awesome-icon v-else icon="save" />
              Save organization
            </button>
          </div>
        </form>

        <div class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-wide text-asphalt-muted">Members</p>
              <p class="mt-1 text-2xl font-semibold tabular-nums text-snow">
                {{ managerOrg?.memberCount ?? totalPlayers }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-asphalt-muted">Games</p>
              <p class="mt-1 text-2xl font-semibold tabular-nums text-snow">
                {{ managerOrg?.gameCount ?? totalGames }}
              </p>
            </div>
          </div>

          <div class="mt-5">
            <div class="mb-2 flex items-center justify-between">
              <p class="text-sm font-semibold text-snow">Managers</p>
              <span class="text-xs text-asphalt-muted">
                {{ managerOrg?.managers?.length || 0 }} total
              </span>
            </div>
            <div v-if="managerOrg?.managers?.length" class="space-y-2">
              <div
                v-for="manager in managerOrg.managers"
                :key="manager.id"
                class="rounded-md border border-asphalt-light bg-charcoal px-3 py-2"
              >
                <p class="text-sm font-medium text-snow">{{ manager.name }}</p>
                <p class="text-xs text-snow-dim">{{ manager.email }}</p>
              </div>
            </div>
            <p v-else class="text-sm text-snow-dim">
              No manager list available.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="glass-card p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-snow">{{ $t("dashboard.api") }}</p>
            <p class="text-xs text-asphalt-muted">{{ $t("dashboard.healthDatabase") }}</p>
          </div>
          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
            :class="apiOnline ? 'bg-turf/20 text-turf' : 'bg-danger-surface text-danger'"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="apiOnline ? 'bg-turf animate-pulse' : 'bg-danger'"
            />
            {{ apiStatusLabel }}
          </span>
        </div>

        <div v-if="loadingHealth" class="flex items-center gap-3 text-sm text-snow-dim">
          <LoadingSpinner size="4" />
          <span>{{ $t("dashboard.checkingApi") }}</span>
        </div>

        <div v-else-if="health" class="space-y-2 text-xs text-snow-dim">
          <p>
            <span class="text-asphalt-muted">{{ $t("dashboard.status") }}</span>
            <span class="ml-1 font-mono">
              {{ health.payload?.status || $t("common.unknown") }}
            </span>
          </p>
          <p v-if="lastDurationMs != null">
            <span class="text-asphalt-muted">{{ $t("dashboard.lastResponse") }}</span>
            <span class="ml-1 font-mono">
              ~{{ Math.round(lastDurationMs) }}ms
            </span>
          </p>
          <p v-if="health.payload?.database">
            <span class="text-asphalt-muted">{{ $t("dashboard.database") }}</span>
            <span class="ml-1 font-mono">
              {{ health.payload.database }}
            </span>
          </p>
        </div>

        <ErrorMessage
          v-else-if="healthError"
          class="mt-2"
          :title="$t('dashboard.apiCheckFailed')"
          :message="healthError.message"
          :hint="$t('dashboard.apiCheckHint')"
          :retry-label="$t('dashboard.retryHealth')"
          @retry="refreshHealth"
        />

      </div>

      <div class="glass-card p-5 lg:col-span-2">
        <p class="text-sm font-medium text-snow">{{ $t("dashboard.nextActions") }}</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <router-link
            to="/games"
            class="rounded-lg border border-white/5 bg-white/5 p-4 hover:bg-white/10"
          >
            <p class="font-medium text-snow">{{ $t("dashboard.runGames") }}</p>
            <p class="mt-1 text-sm text-snow-dim">
              {{ $t("dashboard.runGamesText") }}
            </p>
          </router-link>
          <router-link
            to="/players"
            class="rounded-lg border border-white/5 bg-white/5 p-4 hover:bg-white/10"
          >
            <p class="font-medium text-snow">{{ $t("dashboard.managePlayers") }}</p>
            <p class="mt-1 text-sm text-snow-dim">
              {{ $t("dashboard.managePlayersText") }}
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>
