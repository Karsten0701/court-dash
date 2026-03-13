<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import EmptyState from "@/components/EmptyState.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import EloChart from "@/components/EloChart.vue";
import { formatDate } from "@/utils/formatters.js";

const router = useRouter();
const route = useRoute();

const isLoading = ref(true);
const player = ref(null);
const error = ref("");
const requiresLogin = ref(false);
const eloHistory = ref(null);
const eloLoading = ref(false);

const profileId = computed(() => route.params.id);
const currentUser = computed(() => authService.getCurrentUser());
const isOwnProfile = computed(
  () => Number(profileId.value) === Number(currentUser.value?.id),
);
const displayName = computed(
  () => player.value?.name || player.value?.username || "Unknown player",
);
const memberSince = computed(() =>
  player.value?.createdAt
    ? formatDate(player.value.createdAt, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A",
);
const profileInitial = computed(
  () => displayName.value.charAt(0).toUpperCase() || "?",
);

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push("/");
};

const redirectToLogin = async () => {
  await authService.logout().catch(() => null);
  router.push({ name: "Login", query: { redirect: route.fullPath } });
};

const fetchEloHistory = async () => {
  eloLoading.value = true;
  try {
    eloHistory.value = await apiService.getHistoricalEloByUserId(profileId.value);
  } catch (err) {
    console.error("Failed to fetch ELO history:", err);
  } finally {
    eloLoading.value = false;
  }
};

const fetchProfile = async () => {
  if (!authService.isAuthenticated()) {
    requiresLogin.value = true;
    player.value = null;
    error.value = "";
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    requiresLogin.value = false;
    error.value = "";

    const response = await apiService.getPlayerProfile(profileId.value);
    player.value = response?.player || response;
    fetchEloHistory();
  } catch (err) {
    console.error("Failed to fetch player profile:", err);

    if (
      err.status === 401 ||
      err.message?.includes("401") ||
      err.message?.includes("Unauthorized")
    ) {
      await redirectToLogin();
      return;
    }

    if (err.status === 404) {
      error.value = "Player not found";
    } else if (err.status === 500) {
      error.value = "Something went wrong. Please try again later.";
    } else {
      error.value = err.message || "Failed to load player profile";
    }
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => route.params.id,
  () => {
    eloHistory.value = null;
    fetchProfile();
  },
);

onMounted(() => {
  fetchProfile();
});
</script>

<template>
  <div class="min-h-[calc(100dvh-var(--nav-h))] py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto space-y-6">
      <button
        type="button"
        class="inline-flex items-center text-sm font-medium text-snow-dim hover:text-snow"
        @click="goBack"
      >
        <font-awesome-icon icon="arrow-left" class="mr-2" />
        Back
      </button>

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="rounded-lg bg-charcoal p-6 animate-pulse">
        <div
          class="flex items-center justify-between gap-4 border-b border-asphalt-light pb-5"
        >
          <div class="flex items-center gap-4">
            <div
              class="h-16 w-16 flex-shrink-0 rounded-full bg-asphalt-light"
            ></div>
            <div class="space-y-2">
              <div class="h-5 w-36 rounded bg-asphalt-light"></div>
              <div class="h-4 w-24 rounded bg-asphalt-light"></div>
            </div>
          </div>
          <div class="h-16 w-20 rounded-lg bg-asphalt-light"></div>
        </div>
        <div class="grid grid-cols-2 gap-3 pt-5">
          <div class="h-14 rounded-lg bg-asphalt-light"></div>
          <div class="h-14 rounded-lg bg-asphalt-light"></div>
          <div class="h-14 rounded-lg bg-asphalt-light"></div>
        </div>
        <div class="mt-5 rounded-lg bg-asphalt-light animate-pulse" style="height: 320px;"></div>
      </div>

      <EmptyState
        v-else-if="requiresLogin"
        icon="user-circle"
        title="Sign in to view profiles."
        message="Profiles are only available when you're logged in."
        action-label="Sign in"
        action-icon="sign-in-alt"
        @action="
          router.push({ name: 'Login', query: { redirect: route.fullPath } })
        "
      />

      <ErrorMessage
        v-else-if="error"
        title="Couldn't load profile"
        :message="error"
        hint="Try again in a moment, or head back."
      >
        <template #actions>
          <button
            v-if="error !== 'Player not found'"
            type="button"
            class="text-sm font-medium text-danger hover:text-danger-hover inline-flex items-center"
            @click="fetchProfile"
          >
            <font-awesome-icon icon="redo" class="mr-1" />
            Try again
          </button>
          <button
            type="button"
            class="text-sm font-medium text-danger hover:text-danger-hover inline-flex items-center"
            @click="goBack"
          >
            <font-awesome-icon icon="arrow-left" class="mr-1" />
            Back
          </button>
        </template>
      </ErrorMessage>

      <section v-else-if="player" class="rounded-lg bg-charcoal p-6">
        <!-- Header: avatar + name/badges left, ELO right -->
        <div
          class="flex flex-wrap items-center justify-between gap-4 border-b border-asphalt-light pb-5"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-asphalt-light text-2xl font-bold text-snow"
            >
              {{ profileInitial }}
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-2xl font-bold text-snow">{{ displayName }}</h2>
                <span
                  v-if="isOwnProfile"
                  class="rounded-full bg-racket/20 px-3 py-1 text-xs font-medium text-racket"
                >
                  You
                </span>
                <span
                  v-if="player.role"
                  :class="player.role === 'admin'
                    ? 'rounded-full bg-ball/20 px-3 py-1 text-xs font-medium capitalize text-ball'
                    : 'rounded-full bg-asphalt px-3 py-1 text-xs font-medium capitalize text-snow-dim'"
                >
                  {{ player.role }}
                </span>
              </div>
            </div>
          </div>

          <div class="rounded-lg bg-asphalt px-4 py-3 text-center">
            <p class="text-3xl font-bold text-snow">{{ player.elo ?? 1000 }}</p>
            <p class="mt-1 text-xs uppercase tracking-wide text-snow-dim">
              Rating
            </p>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 pt-5">
          <div class="rounded-lg bg-asphalt px-4 py-3">
            <p class="text-xs uppercase tracking-wide text-snow-dim">
              Member ID
            </p>
            <p class="mt-1 text-sm font-medium text-snow">{{ player.id }}</p>
          </div>
          <div class="rounded-lg bg-asphalt px-4 py-3">
            <p class="text-xs uppercase tracking-wide text-snow-dim">Joined</p>
            <p class="mt-1 text-sm font-medium text-snow">{{ memberSince }}</p>
          </div>
        </div>

        <!-- ELO history chart -->
        <div class="mt-5">
          <!-- Loading shimmer -->
          <div v-if="eloLoading" class="rounded-lg bg-asphalt animate-pulse h-[calc(theme(spacing.64)+theme(spacing.16))]"></div>
          <!-- Chart -->
          <EloChart v-else-if="eloHistory" :eloData="eloHistory" :nested="true" />
        </div>

        <!-- Admin-only account section -->
        <div
          v-if="player.email || player.role"
          class="mt-5 rounded-lg border border-asphalt-light bg-asphalt p-4"
        >
          <h3 class="text-sm font-semibold text-snow">Account</h3>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div v-if="player.email">
              <p class="text-xs uppercase tracking-wide text-asphalt-muted">
                Email
              </p>
              <p class="mt-2 break-all text-sm text-snow">{{ player.email }}</p>
            </div>
            <div v-if="player.role">
              <p class="text-xs uppercase tracking-wide text-asphalt-muted">
                Role
              </p>
              <p class="mt-2 text-sm capitalize text-snow">{{ player.role }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
