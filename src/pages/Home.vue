<script setup>
import { ref, computed, onMounted } from "vue";
import apiService from "@/services/apiService.js";
import GameCard from "@/components/GameCard.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import EmptyState from "@/components/EmptyState.vue";

const games = ref([]);
const isLoading = ref(true);
const error = ref("");

const sortedGames = computed(() =>
  [...games.value].sort((a, b) => {
    if (!a.plannedAt && !b.plannedAt) return 0;
    if (!a.plannedAt) return 1;
    if (!b.plannedAt) return -1;
    return new Date(a.plannedAt) - new Date(b.plannedAt);
  }),
);

const fetchGames = async () => {
  try {
    isLoading.value = true;
    error.value = "";
    const data = await apiService.getGames();
    games.value = Array.isArray(data) ? data : data.games || [];
  } catch (err) {
    console.error("Failed to fetch games:", err);
    if (err.status === 500) {
      error.value = "Something went wrong. Please try again later.";
    } else {
      error.value = err.message || "Failed to load games";
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchGames();
});
</script>

<template>
  <div class="min-h-[calc(100dvh-var(--nav-h))] py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 pt-4">
        <h1 class="text-3xl font-bold text-snow">King of the Court</h1>
        <p class="text-snow-dim text-sm mt-1">Upcoming games</p>
      </div>

      <!-- Skeleton Loading -->
      <div
        v-if="isLoading"
        class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 overflow-visible"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="bg-charcoal rounded-lg border border-asphalt-light animate-pulse p-6"
        >
          <div class="h-5 bg-asphalt-light rounded w-2/3 mb-4"></div>
          <div class="h-4 bg-asphalt-light rounded w-full mb-2"></div>
          <div class="h-4 bg-asphalt-light rounded w-4/5"></div>
        </div>
      </div>

      <!-- Error State -->
      <ErrorMessage
        v-else-if="error"
        title="Error loading games"
        :message="error"
        hint="Something went wrong loading the games. Check your connection and try again."
        retry-label="Try again"
        @retry="fetchGames"
        class="max-w-2xl mx-auto"
      />

      <!-- Empty State -->
      <EmptyState
        v-else-if="games.length === 0"
        icon="home"
        title="No games available right now."
        message="Check back later for upcoming games!"
        action-label="Refresh"
        action-icon="redo"
        @action="fetchGames"
      />

      <!-- Games Grid -->
      <div
        v-else
        class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 overflow-visible"
      >
        <GameCard v-for="game in sortedGames" :key="game.id" :game="game" />
      </div>
    </div>
  </div>
</template>
