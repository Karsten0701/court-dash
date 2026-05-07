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
  <section class="space-y-5">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-snow">Overview</h2>
        <p class="text-sm text-snow-dim">Manage the court from one place.</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-asphalt-light px-3 py-2 text-xs text-snow hover:bg-asphalt"
        @click="() => { refreshPlayers(); refreshGames(); refreshHealth(); }"
      >
        <font-awesome-icon icon="arrow-rotate-right" />
        Refresh
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-asphalt-light bg-charcoal p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-snow-dim">Players</p>
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
          Top 50 leaderboard users.
        </p>
      </div>

      <div class="rounded-xl border border-asphalt-light bg-charcoal p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-snow-dim">Games</p>
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
          Planned sessions from the API.
        </p>
      </div>

      <div class="rounded-xl border border-asphalt-light bg-charcoal p-5">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-snow-dim">Active</p>
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
          Planned or started games.
        </p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="rounded-xl border border-asphalt-light bg-charcoal p-5">
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

      </div>

      <div class="rounded-xl border border-asphalt-light bg-charcoal p-5 lg:col-span-2">
        <p class="text-sm font-medium text-snow">Next actions</p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <router-link
            to="/games"
            class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4 hover:bg-asphalt"
          >
            <p class="font-medium text-snow">Run games</p>
            <p class="mt-1 text-sm text-snow-dim">
              Create sessions, add players, start, end, and process scores.
            </p>
          </router-link>
          <router-link
            to="/players"
            class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4 hover:bg-asphalt"
          >
            <p class="font-medium text-snow">Manage players</p>
            <p class="mt-1 text-sm text-snow-dim">
              Update accounts, roles, ELO visibility, and player records.
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

