<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormInput from "@/components/FormInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import PublicSiteFooter from "@/components/PublicSiteFooter.vue";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = "Please enter both email and password";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    await authService.login(email.value, password.value);

    if (!authService.isAdmin()) {
      await authService.logout().catch(() => {});
      error.value = "This dashboard is only available to admin accounts.";
      return;
    }

    const redirectTo = router.currentRoute.value.query.redirect || "/";
    router.push(redirectTo);
  } catch (err) {
    // Check for different error types
    if (err.message.includes("429") || err.message.includes("rate limit")) {
      error.value = "Rate limited. Please try again later.";
    } else if (
      err.message.includes("401") ||
      err.message.includes("Invalid credentials")
    ) {
      error.value = "Invalid email or password. Please try again.";
    } else if (err.message.includes("500")) {
      error.value = "Something went wrong. Please try again later.";
    } else if (
      err.message.includes("Failed to fetch") ||
      err.message.includes("NetworkError")
    ) {
      error.value = err.message || "Login failed. Please try again.";
    } else {
      error.value = err.message || "Login failed. Please try again.";
    }
    console.error("Login error:", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-court px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
      <PublicSiteHeader />

      <main class="flex flex-1 flex-col justify-center gap-12 py-10 lg:py-14">
        <section class="grid items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div class="max-w-3xl">
            <p class="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-asphalt-muted">
              For padel and tennis organizers
            </p>
            <h1 class="text-4xl font-semibold leading-tight text-snow sm:text-5xl lg:text-6xl">
              Run your court nights without the spreadsheet mess.
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-snow-dim sm:text-lg">
              Plan sessions, manage players, follow rankings and keep the admin work in one clean dashboard.
            </p>

            <div class="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#login"
                class="inline-flex items-center justify-center gap-2 rounded-md bg-racket px-4 py-2.5 text-sm font-medium text-white hover:bg-racket-hover"
              >
                <font-awesome-icon icon="sign-in-alt" />
                Open dashboard
              </a>
              <a
                href="#features"
                class="inline-flex items-center justify-center gap-2 rounded-md border border-asphalt-light px-4 py-2.5 text-sm font-medium text-snow hover:bg-asphalt"
              >
                <font-awesome-icon icon="chevron-down" />
                See what's inside
              </a>
            </div>

            <dl class="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <div class="rounded-lg border border-asphalt-light bg-charcoal p-4">
                <dt class="text-xs text-asphalt-muted">Setup</dt>
                <dd class="mt-2 text-2xl font-semibold text-snow">Fast</dd>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-charcoal p-4">
                <dt class="text-xs text-asphalt-muted">Views</dt>
                <dd class="mt-2 text-2xl font-semibold text-snow">Live</dd>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-charcoal p-4">
                <dt class="text-xs text-asphalt-muted">Admin</dt>
                <dd class="mt-2 text-2xl font-semibold text-snow">Clear</dd>
              </div>
            </dl>
          </div>

          <div class="grid gap-4">
            <div class="rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-xl">
              <div class="mb-5 flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-snow">Tonight's court</p>
                  <p class="text-xs text-asphalt-muted">Planning overview</p>
                </div>
                <span class="inline-flex items-center gap-2 rounded-full bg-turf/20 px-3 py-1 text-xs font-medium text-turf">
                  <span class="h-2 w-2 rounded-full bg-turf" />
                  Ready
                </span>
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <div class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4">
                  <p class="text-xs text-asphalt-muted">Players</p>
                  <p class="mt-2 text-3xl font-semibold tabular-nums text-snow">24</p>
                </div>
                <div class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4">
                  <p class="text-xs text-asphalt-muted">Games</p>
                  <p class="mt-2 text-3xl font-semibold tabular-nums text-snow">8</p>
                </div>
                <div class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4">
                  <p class="text-xs text-asphalt-muted">Courts</p>
                  <p class="mt-2 text-3xl font-semibold tabular-nums text-snow">4</p>
                </div>
              </div>

              <div class="mt-4 space-y-3">
                <div class="flex items-center justify-between rounded-lg border border-asphalt-light bg-asphalt/40 p-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-md bg-racket text-xs text-white">
                      <font-awesome-icon icon="calendar-days" />
                    </span>
                    <div>
                      <p class="text-sm font-medium text-snow">King round 1</p>
                      <p class="text-xs text-asphalt-muted">Court 2 - 19:30</p>
                    </div>
                  </div>
                  <font-awesome-icon icon="chevron-right" class="text-asphalt-muted" />
                </div>
                <div class="flex items-center justify-between rounded-lg border border-asphalt-light bg-asphalt/40 p-3">
                  <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 items-center justify-center rounded-md bg-turf text-xs text-white">
                      <font-awesome-icon icon="trophy" />
                    </span>
                    <div>
                      <p class="text-sm font-medium text-snow">Ranking update</p>
                      <p class="text-xs text-asphalt-muted">Scores processed after the final match</p>
                    </div>
                  </div>
                  <font-awesome-icon icon="chevron-right" class="text-asphalt-muted" />
                </div>
              </div>
            </div>

            <form
              id="login"
              class="rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-xl space-y-5"
              @submit.prevent="handleLogin"
            >
              <div>
                <p class="text-sm font-semibold text-snow">Admin login</p>
                <p class="mt-1 text-sm text-snow-dim">
                  Sign in to manage players, games and API status.
                </p>
              </div>

              <div class="space-y-4">
                <FormInput
                  id="email"
                  v-model="email"
                  label="Email"
                  type="email"
                  :required="true"
                  :disabled="isLoading"
                  placeholder="Email address"
                />
                <FormInput
                  id="password"
                  v-model="password"
                  label="Password"
                  type="password"
                  :required="true"
                  :disabled="isLoading"
                  placeholder="Password"
                />
              </div>

              <ErrorMessage
                v-if="error"
                title="Login failed"
                :message="error"
                :hint="error"
              />

              <button
                type="submit"
                :disabled="isLoading"
                class="group relative flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-racket px-4 py-2.5 text-sm font-medium text-white hover:bg-racket-hover focus:outline-none focus:ring-2 focus:ring-racket disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LoadingSpinner v-if="isLoading" class="text-white" />
                <font-awesome-icon v-else icon="sign-in-alt" />
                <span>{{ isLoading ? "Signing in..." : "Sign in" }}</span>
              </button>
            </form>
          </div>
        </section>

        <section id="features" class="grid gap-4 lg:grid-cols-3">
          <article class="rounded-lg border border-asphalt-light bg-charcoal p-5">
            <font-awesome-icon icon="users" class="text-asphalt-muted" />
            <h2 class="mt-4 text-base font-semibold text-snow">Player records</h2>
            <p class="mt-2 text-sm leading-6 text-snow-dim">
              Keep player data, roles and ranking visibility tidy from one admin view.
            </p>
          </article>
          <article class="rounded-lg border border-asphalt-light bg-charcoal p-5">
            <font-awesome-icon icon="table-tennis-paddle-ball" class="text-asphalt-muted" />
            <h2 class="mt-4 text-base font-semibold text-snow">Game control</h2>
            <p class="mt-2 text-sm leading-6 text-snow-dim">
              Create sessions, add participants and move games from planning to results.
            </p>
          </article>
          <article class="rounded-lg border border-asphalt-light bg-charcoal p-5">
            <font-awesome-icon icon="server" class="text-asphalt-muted" />
            <h2 class="mt-4 text-base font-semibold text-snow">System checks</h2>
            <p class="mt-2 text-sm leading-6 text-snow-dim">
              See whether the API and database are healthy before match night starts.
            </p>
          </article>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  </div>
</template>

<style scoped></style>
