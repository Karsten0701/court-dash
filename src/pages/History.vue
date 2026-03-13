<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import EmptyState from "@/components/EmptyState.vue";
import EloChart from "@/components/EloChart.vue";
import HistoryGameItem from "@/components/HistoryGameItem.vue";

const router = useRouter();
const isLoading = ref(true);
const games = ref([]);
const error = ref("");
const eloData = ref(null);

const currentUserId = authService.getCurrentUser()?.id;
const activeFilter = ref("all");

const statusGame = { started: 0, ended: 1, processed: 2 };

const sortedGames = computed(() => {
  return [...games.value].sort((a, b) => {
    const orderA = statusGame[a.status?.toLowerCase()] ?? 3;
    const orderB = statusGame[b.status?.toLowerCase()] ?? 3;
    if (orderA !== orderB) return orderA - orderB;
    // Within same status group, sort by startedAt descending (newest first)
    const dateA = new Date(a.startedAt || 0);
    const dateB = new Date(b.startedAt || 0);
    return dateB - dateA;
  });
});

const filteredGames = computed(() => {
  if (activeFilter.value === "all") return sortedGames.value;
  if (activeFilter.value === "ended") {
    return sortedGames.value.filter((g) => {
      const s = g.status?.toLowerCase();
      return s === "ended" || s === "processed";
    });
  }
  return sortedGames.value.filter(
    (g) => g.status?.toLowerCase() === activeFilter.value,
  );
});

const filterTabs = computed(() => {
  let started = 0;
  let ended = 0;
  games.value.forEach((g) => {
    const s = g.status?.toLowerCase();
    if (s === "started") started++;
    else if (s === "ended" || s === "processed") ended++;
  });
  return [
    { key: "all", label: "All", count: games.value.length },
    { key: "started", label: "Started", count: started },
    { key: "ended", label: "Ended", count: ended },
  ];
});

const fetchGames = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    const response = await apiService.getHistoricalGames();
    games.value = response.games || response || [];
  } catch (err) {
    console.error("Failed to fetch games:", err);

    if (
      err.status === 401 ||
      err.message?.includes("401") ||
      err.message?.includes("Unauthorized")
    ) {
      await authService.logout();
      router.push({ name: "Login", query: { redirect: "/history" } });
      return;
    } else if (err.status === 500) {
      error.value = "Something went wrong. Please try again later.";
    } else {
      error.value = err.message || "Failed to load game history";
    }
  } finally {
    isLoading.value = false;
  }
};

const fetchEloHistory = async () => {
  try {
    const response = await apiService.getHistoricalElo();
    eloData.value = response;
  } catch (err) {
    console.error("Failed to fetch ELO history:", err);
  }
};

onMounted(() => {
  fetchGames();
  fetchEloHistory();
});
</script>

<template>
  <div class="min-h-[calc(100dvh-var(--nav-h))] py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8 pt-4">
        <h1 class="text-3xl font-bold text-snow">Game History</h1>
        <p class="text-snow-dim text-sm mt-1">
          Your past games and performance
        </p>
      </div>

      <!-- ELO History Chart -->
      <EloChart v-if="eloData" :elo-data="eloData" class="mb-8" />
      <div
        v-else-if="!error"
        class="bg-charcoal rounded-lg p-6 mb-8 animate-pulse"
      >
        <div class="h-7 bg-asphalt-light rounded w-1/4 mb-4"></div>
        <div class="h-64 bg-asphalt-light rounded"></div>
      </div>

      <!-- Filter Tabs -->
      <div v-if="!isLoading && !error && games.length" class="flex gap-2 mb-6">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          @click="activeFilter = tab.key"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
          :class="
            activeFilter === tab.key
              ? 'bg-racket text-white'
              : 'bg-asphalt-light text-snow hover:bg-asphalt-muted hover:text-snow'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="space-y-4">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-charcoal rounded-lg p-6 animate-pulse"
        >
          <div class="h-5 bg-asphalt-light rounded w-1/3 mb-3"></div>
          <div class="h-4 bg-asphalt-light rounded w-2/3"></div>
        </div>
      </div>

      <!-- Error State -->
      <ErrorMessage
        v-else-if="error"
        title="Error loading games"
        :message="error"
        hint="We couldn't load your game history. Check your connection and try again."
        retry-label="Try again"
        @retry="fetchGames"
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="games.length === 0"
        icon="clipboard-list"
        title="No games played yet."
        message="Join a game and start competing!"
        action-label="Browse Games"
        action-icon="home"
        @action="router.push('/')"
      />

      <!-- Games List -->
      <div v-else class="space-y-4">
        <HistoryGameItem
          v-for="game in filteredGames"
          :key="game.id"
          :game="game"
          :current-user-id="currentUserId"
          @navigate="(id) => router.push(`/history/${id}`)"
        />

        <!-- No results for filter -->
        <div v-if="filteredGames.length === 0" class="text-center py-8">
          <p class="text-sm text-asphalt-muted">
            No {{ activeFilter }} games found.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
