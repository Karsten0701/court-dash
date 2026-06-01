<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import EmptyState from "@/components/EmptyState.vue";

const router = useRouter();
const route = useRoute();

const isLoading = ref(true);
const leaderboard = ref([]);
const leaderboardError = ref("");

const searchQuery = ref("");
const isSearching = ref(false);
const searchResults = ref([]);
const searchError = ref("");
const hasSearched = ref(false);

const isAuthenticated = computed(() => authService.isAuthenticated());

const leaderboardPlayers = computed(() => {
  const players = Array.isArray(leaderboard.value)
    ? leaderboard.value
    : leaderboard.value?.players || [];

  return [...players].sort((a, b) => {
    if (a.rank != null && b.rank != null) {
      return a.rank - b.rank;
    }
    return (b.elo ?? 0) - (a.elo ?? 0);
  });
});

const normalizedSearchResults = computed(() =>
  Array.isArray(searchResults.value)
    ? searchResults.value
    : searchResults.value?.players || [],
);

const hasQuery = computed(() => searchQuery.value.trim().length > 0);

const getProfilePath = (playerId) => `/profile/${playerId}`;

const redirectToLogin = async (redirect = route.fullPath) => {
  await authService.logout().catch(() => null);
  router.push({ name: "Login", query: { redirect } });
};

const navigateToProfile = async (playerId) => {
  const profilePath = getProfilePath(playerId);

  if (!isAuthenticated.value) {
    router.push({ name: "Login", query: { redirect: profilePath } });
    return;
  }

  router.push(profilePath);
};

const fetchLeaderboard = async () => {
  try {
    isLoading.value = true;
    leaderboardError.value = "";

    const response = await apiService.getLeaderboard();
    leaderboard.value = Array.isArray(response)
      ? response
      : response?.players || [];
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);

    if (err.status === 500) {
      leaderboardError.value = "Something went wrong. Please try again later.";
    } else {
      leaderboardError.value = err.message || "Failed to load leaderboard";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = async () => {
  if (!hasQuery.value) {
    hasSearched.value = false;
    searchResults.value = [];
    searchError.value = "";
    return;
  }

  if (!isAuthenticated.value) {
    router.push({ name: "Login", query: { redirect: route.fullPath } });
    return;
  }

  try {
    isSearching.value = true;
    searchError.value = "";
    hasSearched.value = true;

    const response = await apiService.searchPlayers(searchQuery.value.trim());
    searchResults.value = Array.isArray(response)
      ? response
      : response?.players || [];
  } catch (err) {
    console.error("Failed to search players:", err);

    if (
      err.status === 401 ||
      err.message?.includes("401") ||
      err.message?.includes("Unauthorized")
    ) {
      await redirectToLogin(route.fullPath);
      return;
    }

    if (err.status === 500) {
      searchError.value = "Something went wrong. Please try again later.";
    } else {
      searchError.value = err.message || "Failed to search players";
    }
  } finally {
    isSearching.value = false;
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  searchResults.value = [];
  searchError.value = "";
  hasSearched.value = false;
};

onMounted(() => {
  fetchLeaderboard();
});
</script>

<template>
  <div class="min-h-[calc(100dvh-var(--nav-h))] py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 pt-4">
        <span
          class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-snow-dim"
        >
          <font-awesome-icon icon="trophy" class="text-ball" />
          Season standings
        </span>
        <h1
          class="mt-4 bg-gradient-to-r from-snow to-snow-dim bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
        >
          Leaderboard
        </h1>
        <p class="mt-2 text-sm text-snow-dim">
          Rankings update after each game.
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section class="space-y-3">
          <div v-if="isLoading" class="glass-card animate-pulse divide-y divide-white/5">
            <div v-for="n in 8" :key="n" class="flex items-center justify-between gap-3 px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-6 h-4 rounded bg-asphalt-light shrink-0"></div>
                <div class="w-8 h-8 rounded-full bg-asphalt-light shrink-0"></div>
                <div class="h-4 w-32 rounded bg-asphalt-light"></div>
              </div>
              <div class="h-4 w-20 rounded bg-asphalt-light"></div>
            </div>
          </div>

          <ErrorMessage
            v-else-if="leaderboardError"
            title="Error loading leaderboard"
            :message="leaderboardError"
            hint="Refresh the page or try again in a moment."
            retry-label="Try again"
            @retry="fetchLeaderboard"
          />

          <EmptyState
            v-else-if="leaderboardPlayers.length === 0"
            icon="users"
            title="No players ranked yet."
            message="Rankings appear after games are processed."
            action-label="Refresh"
            action-icon="redo"
            @action="fetchLeaderboard"
          />

          <div v-else class="glass-card divide-y divide-white/5">
            <button
              v-for="(player, index) in leaderboardPlayers"
              :key="player.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-white/5"
              @click="navigateToProfile(player.id)"
            >
              <div class="flex items-center gap-3">
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                  :class="
                    player.rank === 1
                      ? 'bg-ball/15 text-ball'
                      : player.rank === 2 || player.rank === 3
                        ? 'bg-white/5 text-snow'
                        : 'text-snow-dim'
                  "
                >{{ player.rank ?? index + 1 }}</span>

                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase text-snow"
                  :class="
                    player.rank === 1
                      ? 'bg-violet-grad shadow-glow-sm'
                      : 'bg-asphalt-light'
                  "
                >
                  {{ (player.name || '?').charAt(0) }}
                </div>

                <div class="flex items-center gap-2 min-w-0">
                  <span class="truncate font-medium text-snow">{{ player.name || 'Unknown' }}</span>
                  <font-awesome-icon v-if="player.rank === 1" icon="crown" class="shrink-0 text-xs text-ball" />
                  <font-awesome-icon v-else-if="player.rank === 2 || player.rank === 3" icon="trophy" class="shrink-0 text-xs text-racket" />
                </div>
              </div>

              <span
                class="shrink-0 rounded-full bg-white/5 px-3 py-1 font-mono text-sm text-snow"
              >
                {{ player.elo ?? 1000 }}
                <span class="text-snow-dim">ELO</span>
              </span>
            </button>
          </div>
        </section>

        <aside class="space-y-4">
          <div class="glass-card p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl font-bold text-snow">Find a player</h2>
                <p class="mt-1 text-sm text-snow-dim">
                  Look up any player by name.
                </p>
              </div>
              <div
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-soft text-racket"
              >
                <font-awesome-icon icon="user-circle" class="text-xl" />
              </div>
            </div>

            <div v-if="isAuthenticated" class="mt-5">
              <form class="space-y-3" @submit.prevent="handleSearch">
                <label
                  for="player-search"
                  class="block text-xs font-semibold uppercase tracking-wide text-snow-dim"
                >
                  Name
                </label>
                <input
                  id="player-search"
                  v-model="searchQuery"
                  type="text"
                  placeholder="Start typing a name"
                  class="w-full rounded-xl border border-white/10 bg-asphalt/60 px-4 py-3 text-snow placeholder:text-asphalt-muted transition-all focus:border-racket focus:outline-none focus:ring-2 focus:ring-racket/30"
                />

                <div class="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    class="btn-violet"
                    :disabled="isSearching || !hasQuery"
                  >
                    <font-awesome-icon
                      :icon="isSearching ? 'spinner' : 'user-circle'"
                      :class="{ 'animate-spin': isSearching }"
                    />
                    {{ isSearching ? "Searching..." : "Search" }}
                  </button>

                  <button
                    v-if="hasQuery || hasSearched"
                    type="button"
                    class="btn-glass"
                    @click="clearSearch"
                  >
                    <font-awesome-icon icon="times" />
                    Clear
                  </button>
                </div>
              </form>
            </div>

            <div
              v-else
              class="mt-5 rounded-xl border border-dashed border-white/10 bg-white/5 p-4"
            >
              <p class="text-sm text-snow">
                Sign in to search players and view profiles.
              </p>
              <button
                type="button"
                class="btn-violet mt-4"
                @click="
                  router.push({
                    name: 'Login',
                    query: { redirect: route.fullPath },
                  })
                "
              >
                <font-awesome-icon icon="sign-in-alt" />
                Login to search
              </button>
            </div>
          </div>

          <ErrorMessage
            v-if="searchError"
            title="Search failed"
            :message="searchError"
            hint="Try again in a moment."
            retry-label="Try again"
            @retry="handleSearch"
          />

          <EmptyState
            v-else-if="
              isAuthenticated &&
              hasSearched &&
              normalizedSearchResults.length === 0
            "
            icon="user-circle"
            title="No players found."
            message="Check the spelling or try a shorter name."
            action-label="Clear search"
            action-icon="times"
            @action="clearSearch"
          />

          <div
            v-else-if="normalizedSearchResults.length"
            class="glass-card p-4"
          >
            <div class="mb-3 flex items-center justify-between gap-3">
              <h3 class="text-sm font-semibold text-snow">
                Search results for
                <span class="text-racket">"{{ searchQuery }}"</span>
              </h3>
              <span class="text-xs text-asphalt-muted">
                {{ normalizedSearchResults.length }}
                {{
                  normalizedSearchResults.length === 1 ? "player" : "players"
                }}
              </span>
            </div>

            <div class="space-y-2">
              <button
                v-for="player in normalizedSearchResults"
                :key="player.id"
                type="button"
                class="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3 text-left transition-colors hover:bg-white/10"
                @click="navigateToProfile(player.id)"
              >
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-asphalt-light text-sm font-semibold uppercase text-snow"
                >
                  {{ (player.name || "?").charAt(0) }}
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-snow">
                    {{ player.name || "Unknown player" }}
                  </p>
                </div>

                <div class="text-right">
                  <p class="text-sm font-semibold text-snow">
                    {{ player.elo ?? 1000 }}
                  </p>
                  <p class="text-[11px] text-snow-dim">ELO</p>
                </div>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
