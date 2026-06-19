<script setup>
import { computed } from "vue";
import playersService from "@/services/playersService.js";
import gamesService from "@/services/gamesService.js";
import statusService from "@/services/statusService.js";
import { useApiRequest } from "@/composables/useApiRequest.js";
import { useAnimatedNumber } from "@/composables/useAnimatedNumber.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import { t } from "@/i18n";

const {
  data: players,
  loading: loadingPlayers,
  error: playersError,
  refresh: refreshPlayers,
} = useApiRequest(() => playersService.listLeaderboard(), {
  immediate: true,
  maxRetries: 1,
});

const {
  data: games,
  loading: loadingGames,
  error: gamesError,
  refresh: refreshGames,
} = useApiRequest(() => gamesService.listPlannedGames(), {
  immediate: true,
  maxRetries: 1,
});

const {
  data: health,
  loading: loadingHealth,
  error: healthError,
  lastDurationMs,
  refresh: refreshHealth,
} = useApiRequest(() => statusService.getApiHealth(), {
  immediate: true,
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
  if (loadingHealth.value) return t("status.checking");
  if (healthError.value) return t("status.error");
  return apiOnline.value ? t("status.online") : t("status.offline");
});
</script>

<template>
  <section class="space-y-5">
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
