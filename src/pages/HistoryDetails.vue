<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import PlayerList from "@/components/PlayerList.vue";
import GameInfoGrid from "@/components/GameInfoGrid.vue";
import { formatDate, getStatusClasses } from "@/utils/formatters.js";

const router = useRouter();
const route = useRoute();
const isLoading = ref(true);
const game = ref(null);
const error = ref("");

const gameId = route.params.id;

const fetchGameDetails = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    const response = await apiService.getHistoricalGameById(gameId);
    game.value = response;
  } catch (err) {
    console.error("Failed to fetch game details:", err);

    if (
      err.status === 401 ||
      err.message?.includes("401") ||
      err.message?.includes("Unauthorized")
    ) {
      if (!authService.isAuthenticated()) {
        await authService.logout();
        router.push({ name: "Login", query: { redirect: route.fullPath } });
        return;
      } else {
        error.value = "Game not found";
      }
    } else if (err.status === 404) {
      error.value = "Game not found";
    } else if (err.status === 500) {
      error.value = "Something went wrong. Please try again later.";
    } else {
      error.value = err.message || "Failed to load game details";
    }
  } finally {
    isLoading.value = false;
  }
};

const navigateToProfile = (userId) => {
  router.push(`/profile/${userId}`)
}

onMounted(() => {
  fetchGameDetails();
});
</script>

<template>
  <div class="min-h-[calc(100dvh-var(--nav-h))] py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Back Button -->
      <button
        @click="router.push('/history')"
        class="mb-6 inline-flex items-center text-sm font-medium text-snow-dim hover:text-snow"
      >
        <font-awesome-icon icon="arrow-left" class="mr-2" />
        Back to Game History
      </button>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-charcoal rounded-lg p-6 animate-pulse">
        <div class="h-6 bg-asphalt-light rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-asphalt-light rounded w-2/3 mb-6"></div>
        <div class="h-4 bg-asphalt-light rounded w-1/2"></div>
      </div>

      <!-- Error State -->
      <ErrorMessage
        v-else-if="error"
        title="Error loading game"
        :message="error"
        hint="We couldn't load this game. Try again or go back to your game history."
      >
        <template #actions>
          <button
            v-if="error !== 'Game not found'"
            @click="fetchGameDetails"
            class="text-sm font-medium text-danger hover:text-danger-hover inline-flex items-center"
          >
            <font-awesome-icon icon="redo" class="mr-1" />
            Try again
          </button>
          <button
            @click="router.push('/history')"
            class="text-sm font-medium text-danger hover:text-danger-hover inline-flex items-center"
          >
            <font-awesome-icon icon="arrow-left" class="mr-1" />
            Back to history
          </button>
        </template>
      </ErrorMessage>

      <!-- Game Details -->
      <div v-else-if="game" class="space-y-6">
        <!-- Game Header -->
        <div class="bg-charcoal rounded-lg p-6">
          <div class="flex justify-between items-start mb-4">
            <h1 class="text-3xl font-bold text-snow">
              {{ game.name }}
            </h1>
            <span
              class="px-3 py-1 text-sm font-semibold rounded-lg capitalize"
              :class="getStatusClasses(game.status)"
            >
              {{ game.status === 'processed' ? 'Ended' : game.status }}
            </span>
          </div>

          <p v-if="game.description" class="text-snow-dim mb-6">
            {{ game.description }}
          </p>

          <div class="mt-4">
            <GameInfoGrid :game="game" :columns="3" />
          </div>
        </div>

        <!-- Scoreboard -->
        <div class="bg-charcoal rounded-lg p-6">
          <h2 class="text-xl font-bold text-snow mb-4">Scoreboard</h2>
          <PlayerList
            :participants="game.participants || []"
            :winner-user-id="game.winnerUserId"
            value-field="score"
            value-label="pts"
            empty-text="No participants recorded."
            :clickable="true"
            @player-click="navigateToProfile"
          />
        </div>
      </div>
    </div>
  </div>
</template>
