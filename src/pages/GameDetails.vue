<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import { formatDate } from "@/utils/formatters.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import GameInfoGrid from "@/components/GameInfoGrid.vue";
import PlayerList from "@/components/PlayerList.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const route = useRoute();
const router = useRouter();

const game = ref(null);
const isLoading = ref(true);
const error = ref("");
const isSigningUp = ref(false);

const gameId = route.params.id;

const statusConfig = {
  planned: { label: "Planned", bg: "bg-racket/20", text: "text-racket" },
  started: {
    label: "Started",
    bg: "bg-status-pending/20",
    text: "text-status-pending",
  },
  ended: {
    label: "Ended",
    bg: "bg-status-delivering/20",
    text: "text-status-delivering",
  },
  processed: {
    label: "Ended",
    bg: "bg-status-processed/20",
    text: "text-status-processed",
  },
};

const statusDisplay = computed(() => {
  if (!game.value) return statusConfig.planned;
  return statusConfig[game.value.status] || statusConfig.planned;
});

const isUserSignedUp = computed(() => {
  if (!game.value?.participants || !authService.isAuthenticated()) return false;
  const currentUser = authService.getCurrentUser();
  return game.value.participants.some((p) => p.userId === currentUser?.id);
});

const fetchGame = async () => {
  try {
    isLoading.value = true;
    error.value = "";
    const response = await apiService.getGameById(gameId);
    game.value = response;
  } catch (err) {
    console.error("Failed to fetch game:", err);
    if (err.status === 401) {
      router.push({ name: "Login", query: { redirect: route.fullPath } });
      return;
    }
    if (err.status === 404) {
      error.value = "Game not found. It may have been removed.";
    } else {
      error.value = err.message || "Failed to load game details";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleSignup = async () => {
  try {
    isSigningUp.value = true;
    await apiService.signupGame(gameId);
    await fetchGame();
  } catch (err) {
    console.error("Signup failed:", err);
    if (err.status === 401) {
      router.push({ name: "Login", query: { redirect: route.fullPath } });
      return;
    }
    error.value = err.message || "Failed to sign up for game";
  } finally {
    isSigningUp.value = false;
  }
};

const handleLeave = async () => {
  try {
    isSigningUp.value = true;
    await apiService.leaveGame(gameId);
    await fetchGame();
  } catch (err) {
    console.error("Leave failed:", err);
    if (err.status === 401) {
      router.push({ name: "Login", query: { redirect: route.fullPath } });
      return;
    }
    error.value = err.message || "Failed to leave game";
  } finally {
    isSigningUp.value = false;
  }
};

const navigateToProfile = (userId) => {
  router.push(`/profile/${userId}`)
}

onMounted(() => {
  fetchGame();
});
</script>

<template>
  <div class="min-h-[calc(100dvh-var(--nav-h))] py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Back Button -->
      <button
        @click="router.push('/')"
        class="mb-6 inline-flex items-center text-sm font-medium text-snow-dim hover:text-snow"
      >
        <font-awesome-icon icon="arrow-left" class="mr-2" />
        Back to Games
      </button>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="bg-charcoal shadow rounded-lg p-8">
        <div class="animate-pulse space-y-6">
          <div class="flex items-center justify-between">
            <div class="h-9 bg-asphalt-light rounded w-1/3"></div>
            <div class="h-6 bg-asphalt-light rounded-full w-20"></div>
          </div>
          <div class="h-4 bg-asphalt-light rounded w-2/3"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-16 bg-asphalt-light rounded"></div>
            <div class="h-16 bg-asphalt-light rounded"></div>
            <div class="h-16 bg-asphalt-light rounded"></div>
            <div class="h-16 bg-asphalt-light rounded"></div>
          </div>
          <div class="h-10 bg-asphalt-light rounded w-32"></div>
          <div class="space-y-3">
            <div class="h-6 bg-asphalt-light rounded w-40"></div>
            <div class="h-12 bg-asphalt-light rounded"></div>
            <div class="h-12 bg-asphalt-light rounded"></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <ErrorMessage
        v-else-if="error"
        title="Error loading game"
        :message="error"
        hint="We couldn't load this game. It may no longer be available."
      >
        <template #actions>
          <button
            v-if="error !== 'Game not found'"
            @click="fetchGame"
            class="text-sm font-medium text-danger hover:text-danger-hover inline-flex items-center"
          >
            <font-awesome-icon icon="redo" class="mr-1" />
            Try again
          </button>
          <button
            @click="router.push('/')"
            class="text-sm font-medium text-danger hover:text-danger-hover inline-flex items-center"
          >
            <font-awesome-icon icon="arrow-left" class="mr-1" />
            Back to home
          </button>
        </template>
      </ErrorMessage>

      <!-- Game Details -->
      <div v-else-if="game" class="space-y-6">
        <div class="bg-charcoal shadow rounded-lg p-6 sm:p-8">
          <!-- Header: name + status -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
          >
            <h1 class="text-3xl font-bold text-snow">{{ game.name }}</h1>
            <span
              class="self-start shrink-0 px-3 py-1 rounded-full text-sm font-medium"
              :class="[statusDisplay.bg, statusDisplay.text]"
            >
              {{ statusDisplay.label }}
            </span>
          </div>

          <!-- Description -->
          <p v-if="game.description" class="text-snow-dim leading-relaxed mb-6">
            {{ game.description }}
          </p>

          <!-- Info Grid -->
          <GameInfoGrid :game="game" :columns="4" class="mb-6" />

          <!-- Signup / Leave Section -->
          <div class="mb-6">
            <template v-if="authService.isAuthenticated()">
              <template v-if="game.status === 'planned'">
                <button
                  v-if="!isUserSignedUp"
                  class="px-6 py-2.5 bg-racket text-white rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-racket-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isSigningUp"
                  @click="handleSignup"
                >
                  <FontAwesomeIcon icon="sign-in-alt" class="mr-1" />
                  {{ isSigningUp ? "Signing up…" : "Sign Up" }}
                </button>
                <button
                  v-else
                  class="px-6 py-2.5 bg-danger-solid text-white rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-danger-hover disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isSigningUp"
                  @click="handleLeave"
                >
                  <FontAwesomeIcon icon="sign-out-alt" class="mr-1" />
                  {{ isSigningUp ? "Leaving…" : "Leave Game" }}
                </button>
              </template>
            </template>
            <router-link
              v-else
              :to="{ name: 'Login', query: { redirect: $route.fullPath } }"
              class="inline-block px-6 py-2.5 bg-racket text-white rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-racket-hover no-underline"
            >
              <FontAwesomeIcon icon="sign-in-alt" class="mr-1" />
              Sign in to join
            </router-link>
          </div>
        </div>

        <!-- Participants Section -->
        <div class="bg-charcoal shadow rounded-lg p-6 sm:p-8">
          <h2 class="text-xl font-bold text-snow mb-4">
            Participants ({{ game.participants?.length ?? 0 }})
          </h2>

          <PlayerList
            :participants="game.participants || []"
            :winner-user-id="game.winnerUserId"
            value-field="elo"
            value-label="ELO"
            empty-text="No players have signed up yet."
            :clickable="true"
            @player-click="navigateToProfile"
          />
        </div>
      </div>
    </div>
  </div>
</template>
