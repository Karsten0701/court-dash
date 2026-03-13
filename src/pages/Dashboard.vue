<script setup>
import { computed } from "vue";
import playersService from "@/services/playersService.js";
import gamesService from "@/services/gamesService.js";
import statusService from "@/services/statusService.js";
import { useApiRequest } from "@/composables/useApiRequest.js";
import { useAnimatedNumber } from "@/composables/useAnimatedNumber.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

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
  if (loadingHealth.value) return "Checking…";
  if (healthError.value) return "Error";
  return apiOnline.value ? "Online" : "Offline";
});
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-wide text-asphalt-muted">
          Overview
        </p>
        <p class="text-sm text-snow-dim">
          High-level snapshot of players, games, and API health.
        </p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <!-- Total players -->
      <div class="bg-charcoal rounded-xl border border-asphalt-light p-4 sm:p-5">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs font-medium uppercase tracking-wide text-asphalt-muted">
            Total Players
          </p>
          <font-awesome-icon icon="users" class="text-asphalt-muted" />
        </div>
        <div class="h-9 flex items-end">
          <div
            v-if="loadingPlayers"
            class="h-7 w-20 rounded bg-asphalt-light animate-pulse"
          />
          <p v-else class="text-3xl font-semibold tabular-nums">
            {{ animatedTotalPlayers }}
          </p>
        </div>
        <p class="mt-1 text-xs text-asphalt-muted">
          Based on the current leaderboard.
        </p>
      </div>

      <!-- Total games -->
      <div class="bg-charcoal rounded-xl border border-asphalt-light p-4 sm:p-5">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs font-medium uppercase tracking-wide text-asphalt-muted">
            Total Planned Games
          </p>
          <font-awesome-icon icon="calendar-days" class="text-asphalt-muted" />
        </div>
        <div class="h-9 flex items-end">
          <div
            v-if="loadingGames"
            class="h-7 w-20 rounded bg-asphalt-light animate-pulse"
          />
          <p v-else class="text-3xl font-semibold tabular-nums">
            {{ animatedTotalGames }}
          </p>
        </div>
        <p class="mt-1 text-xs text-asphalt-muted">
          Upcoming sessions ready for signup.
        </p>
      </div>

      <!-- Active games -->
      <div class="bg-charcoal rounded-xl border border-asphalt-light p-4 sm:p-5">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs font-medium uppercase tracking-wide text-asphalt-muted">
            Active Games
          </p>
          <font-awesome-icon icon="bolt" class="text-asphalt-muted" />
        </div>
        <div class="h-9 flex items-end">
          <div
            v-if="loadingGames"
            class="h-7 w-16 rounded bg-asphalt-light animate-pulse"
          />
          <p v-else class="text-3xl font-semibold tabular-nums">
            {{ animatedActiveGames }}
          </p>
        </div>
        <p class="mt-1 text-xs text-asphalt-muted">
          Games in planned or started state.
        </p>
      </div>
    </div>

    <!-- API status + recent activity -->
    <div class="grid gap-4 lg:grid-cols-3">
      <div class="lg:col-span-1 bg-charcoal rounded-xl border border-asphalt-light p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-asphalt-muted">
              API Status
            </p>
            <p class="text-sm text-snow font-medium">
              Court API health
            </p>
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
          <span>Checking API health…</span>
        </div>

        <div v-else-if="health" class="space-y-2 text-xs text-snow-dim">
          <p>
            <span class="text-asphalt-muted">Status:</span>
            <span class="ml-1 font-mono">
              {{ health.payload?.status || "unknown" }}
            </span>
          </p>
          <p v-if="lastDurationMs != null">
            <span class="text-asphalt-muted">Last response:</span>
            <span class="ml-1 font-mono">
              ~{{ Math.round(lastDurationMs) }}ms
            </span>
          </p>
          <p v-if="health.payload?.database">
            <span class="text-asphalt-muted">Database:</span>
            <span class="ml-1 font-mono">
              {{ health.payload.database }}
            </span>
          </p>
        </div>

        <ErrorMessage
          v-else-if="healthError"
          class="mt-2"
          title="API check failed"
          :message="healthError.message"
          hint="The dashboard will still load, but live data may be unavailable."
          retry-label="Retry health check"
          @retry="refreshHealth"
        />

        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 text-xs text-snow-dim hover:text-snow"
          @click="() => { refreshPlayers(); refreshGames(); refreshHealth(); }"
        >
          <font-awesome-icon icon="arrow-rotate-right" />
          Refresh all data
        </button>
      </div>

      <div class="lg:col-span-2 bg-charcoal rounded-xl border border-asphalt-light p-4">
        <p class="text-xs uppercase tracking-wide text-asphalt-muted mb-2">
          Quick insight
        </p>

        <div v-if="loadingPlayers || loadingGames" class="space-y-3">
          <div class="h-4 rounded bg-asphalt-light/80 animate-pulse" />
          <div class="h-4 rounded bg-asphalt-light/70 animate-pulse" />
          <div class="h-4 rounded bg-asphalt-light/60 animate-pulse" />
        </div>

        <div v-else class="space-y-1 text-sm text-snow-dim">
          <p>
            <font-awesome-icon icon="circle-dot" class="mr-2 text-racket" />
            Currently tracking
            <span class="font-semibold text-snow">{{ totalPlayers }}</span>
            players across
            <span class="font-semibold text-snow">{{ totalGames }}</span>
            planned games.
          </p>
          <p>
            <font-awesome-icon icon="circle-dot" class="mr-2 text-racket" />
            <span class="font-semibold text-snow">{{ activeGames }}</span>
            game<span v-if="activeGames !== 1">s</span> are in an active state
            (planned or started).
          </p>
          <p class="text-xs text-asphalt-muted mt-2">
            Use the Players and Games tabs above to drill into full CRUD
            management views.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

