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

const accentColorPresets = [
  "#7c5cfc",
  "#1E88E5",
  "#34d399",
  "#fbbf24",
  "#fb7185",
  "#a855f7",
];

const orgForm = ref({
  name: "",
  accentColor: "#7c5cfc",
});
const orgMessage = ref("");
const orgError = ref("");

const isPlatformAdmin = computed(() => authService.isAdmin());
const managerOrg = computed(() => orgService.org.value);
const loadingOrg = computed(() => orgService.loading.value);
const updatingOrg = computed(() => orgService.updating.value);
const orgReadOnly = computed(() => orgService.isInactive.value);

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
  if (loadingHealth.value) return "Checking…";
  if (healthError.value) return "Error";
  return apiOnline.value ? "Online" : "Offline";
});

const syncOrgForm = (org) => {
  orgForm.value = {
    name: org?.name || "",
    accentColor: org?.accentColor || "#7c5cfc",
  };
};

const saveOrg = async () => {
  if (orgReadOnly.value) {
    orgError.value =
      "Organization is inactive. Complete payment to reactivate before editing.";
    return;
  }

  orgMessage.value = "";
  orgError.value = "";

  try {
    await orgService.updateMyOrg({
      name: orgForm.value.name,
      accentColor: orgForm.value.accentColor,
    });
    orgMessage.value = "Organization updated.";
  } catch (err) {
    orgError.value = err.message || "Failed to update organization.";
  }
};

watch(managerOrg, syncOrgForm, { immediate: true });

onMounted(() => {
  if (!isPlatformAdmin.value) {
    orgService.loadMyOrg().catch((err) => {
      orgError.value = err.message || "Failed to load organization.";
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
          Overview
        </h2>
        <p class="text-sm text-snow-dim">Manage your court from one place.</p>
      </div>
      <button
        type="button"
        class="btn-glass text-xs"
        @click="() => { refreshPlayers(); refreshGames(); refreshHealth(); }"
      >
        <font-awesome-icon icon="arrow-rotate-right" />
        Refresh
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="glass-card p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-snow-dim">Players</p>
          <font-awesome-icon icon="users" class="text-asphalt-muted" />
        </div>
        <div class="h-9">
          <div
            v-if="loadingPlayers"
            class="h-7 w-20 animate-pulse rounded bg-asphalt-light"
          />
          <p v-else class="text-3xl font-semibold tabular-nums">
            {{ animatedTotalPlayers }}
          </p>
        </div>
        <p class="mt-1 text-xs text-asphalt-muted">Top 50 in your org.</p>
      </div>

      <div class="glass-card p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-snow-dim">Games</p>
          <font-awesome-icon icon="calendar-days" class="text-asphalt-muted" />
        </div>
        <div class="h-9">
          <div
            v-if="loadingGames"
            class="h-7 w-20 animate-pulse rounded bg-asphalt-light"
          />
          <p v-else class="text-3xl font-semibold tabular-nums">
            {{ animatedTotalGames }}
          </p>
        </div>
        <p class="mt-1 text-xs text-asphalt-muted">Planned sessions.</p>
      </div>

      <div class="glass-card p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-snow-dim">Active</p>
          <font-awesome-icon icon="bolt" class="text-asphalt-muted" />
        </div>
        <div class="h-9">
          <div
            v-if="loadingGames"
            class="h-7 w-16 animate-pulse rounded bg-asphalt-light"
          />
          <p v-else class="text-3xl font-semibold tabular-nums">
            {{ animatedActiveGames }}
          </p>
        </div>
        <p class="mt-1 text-xs text-asphalt-muted">Planned or started.</p>
      </div>
    </div>

    <div class="glass-card p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-sm font-medium text-snow">Organization settings</p>
          <p class="mt-1 text-sm text-snow-dim">
            Branding for your org. Managers can update name and accent color.
          </p>
        </div>
        <span
          v-if="managerOrg?.status"
          class="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold"
          :class="managerOrg.status === 'active'
            ? 'bg-turf/20 text-turf'
            : 'bg-ball/20 text-ball'"
        >
          {{ managerOrg.status }}
        </span>
      </div>

      <div
        v-if="loadingOrg && !managerOrg"
        class="mt-5 flex items-center gap-3 text-sm text-snow-dim"
      >
        <LoadingSpinner size="4" />
        Loading organization...
      </div>

      <form v-else class="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]" @submit.prevent="saveOrg">
        <div class="space-y-4">
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
            <div
              class="mt-2 flex min-h-[3.25rem] items-center gap-2 rounded-xl border border-white/10 bg-asphalt/60 px-2 py-2 focus-within:border-racket focus-within:ring-2 focus-within:ring-racket/30"
            >
              <input
                id="manager-org-color"
                v-model="orgForm.accentColor"
                type="color"
                :disabled="updatingOrg || orgReadOnly"
                class="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-white/10 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <input
                id="manager-org-color-text"
                v-model="orgForm.accentColor"
                type="text"
                required
                pattern="#[0-9A-Fa-f]{6}"
                :disabled="updatingOrg || orgReadOnly"
                class="min-w-0 flex-1 bg-transparent px-2 text-sm text-snow outline-none disabled:opacity-50"
              />
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="color in accentColorPresets"
                :key="color"
                type="button"
                class="h-7 w-7 rounded-full border border-white/20"
                :style="{ backgroundColor: color }"
                :disabled="updatingOrg || orgReadOnly"
                @click="orgForm.accentColor = color"
              />
            </div>
          </div>

          <p v-if="orgMessage" class="text-sm font-medium text-turf">{{ orgMessage }}</p>
          <p v-if="orgError" class="text-sm font-medium text-danger">{{ orgError }}</p>

          <button
            type="submit"
            class="btn-violet"
            :disabled="updatingOrg || orgReadOnly"
          >
            <LoadingSpinner v-if="updatingOrg" class="text-white" />
            <font-awesome-icon v-else icon="save" />
            Save organization
          </button>
        </div>

        <div class="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-snow-dim">
          <p class="font-medium text-snow">Your org</p>
          <p class="mt-2">ID: {{ managerOrg?.id ?? "—" }}</p>
          <p class="mt-1">Status: {{ managerOrg?.status ?? "—" }}</p>
          <p class="mt-4 leading-relaxed">
            After signup, your org starts as
            <span class="text-snow">pending_payment</span>, becomes
            <span class="text-snow">active</span> after simulated payment, and can be set to
            <span class="text-snow">inactive</span> by a platform admin.
          </p>
        </div>
      </form>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="glass-card p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-snow">API</p>
            <p class="text-xs text-asphalt-muted">Health and database</p>
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
          <span>Checking API...</span>
        </div>

        <div v-else-if="health" class="space-y-2 text-xs text-snow-dim">
          <p>
            <span class="text-asphalt-muted">Status:</span>
            <span class="ml-1 font-mono">{{ health.payload?.status || "unknown" }}</span>
          </p>
          <p v-if="lastDurationMs != null">
            <span class="text-asphalt-muted">Last response:</span>
            <span class="ml-1 font-mono">~{{ Math.round(lastDurationMs) }}ms</span>
          </p>
        </div>

        <ErrorMessage
          v-else-if="healthError"
          class="mt-2"
          title="API check failed"
          :message="healthError.message"
          hint="Live data may be unavailable."
          retry-label="Retry"
          @retry="refreshHealth"
        />
      </div>

      <div class="glass-card p-5 lg:col-span-2">
        <p class="text-sm font-medium text-snow">Next actions</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <router-link
            to="/games"
            class="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <p class="font-medium text-snow">Run games</p>
            <p class="mt-1 text-sm text-snow-dim">
              Create sessions, manage signups, and process scores.
            </p>
          </router-link>
          <router-link
            to="/players"
            class="rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <p class="font-medium text-snow">Manage players</p>
            <p class="mt-1 text-sm text-snow-dim">
              View and update player accounts in your org.
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>
