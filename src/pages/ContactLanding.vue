<script setup>
import PublicSiteFooter from "@/components/PublicSiteFooter.vue";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";
</script>

<template>
  <div class="min-h-screen bg-court px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <PublicSiteHeader />

      <main class="py-12 lg:py-16">
        <section class="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p class="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-asphalt-muted">
              Contact
            </p>
            <h1 class="text-4xl font-semibold leading-tight text-snow sm:text-5xl">
              See if the dashboard fits your club night.
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-snow-dim">
              Use this page as the clean SaaS-style contact point. It explains
              what to prepare before setting up a dashboard for a real group.
            </p>
          </div>

          <div class="rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-xl">
            <p class="text-sm font-semibold text-snow">Setup checklist</p>
            <div class="mt-5 grid gap-3">
              <div class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4">
                <p class="text-sm font-medium text-snow">Player list</p>
                <p class="mt-1 text-sm text-snow-dim">Names, accounts and who needs admin access.</p>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4">
                <p class="text-sm font-medium text-snow">Game format</p>
                <p class="mt-1 text-sm text-snow-dim">How sessions are planned, started, scored and processed.</p>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4">
                <p class="text-sm font-medium text-snow">Court schedule</p>
                <p class="mt-1 text-sm text-snow-dim">How many courts are active and when players rotate.</p>
              </div>
            </div>

            <router-link
              to="/login"
              class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-racket px-4 py-2.5 text-sm font-medium text-white hover:bg-racket-hover"
            >
              <font-awesome-icon icon="sign-in-alt" />
              Open the login page
            </router-link>
          </div>
        </section>

        <section class="mt-12 grid gap-4 md:grid-cols-3">
          <div class="rounded-lg border border-asphalt-light bg-charcoal p-5">
            <font-awesome-icon icon="users" class="text-asphalt-muted" />
            <p class="mt-4 text-sm font-semibold text-snow">Small clubs</p>
            <p class="mt-2 text-sm leading-6 text-snow-dim">Good for recurring groups that want less manual admin.</p>
          </div>
          <div class="rounded-lg border border-asphalt-light bg-charcoal p-5">
            <font-awesome-icon icon="calendar-days" class="text-asphalt-muted" />
            <p class="mt-4 text-sm font-semibold text-snow">Weekly sessions</p>
            <p class="mt-2 text-sm leading-6 text-snow-dim">Plan, run and close match nights with the same flow.</p>
          </div>
          <div class="rounded-lg border border-asphalt-light bg-charcoal p-5">
            <font-awesome-icon icon="chart-line" class="text-asphalt-muted" />
            <p class="mt-4 text-sm font-semibold text-snow">Ranked play</p>
            <p class="mt-2 text-sm leading-6 text-snow-dim">Keep standings visible without making the app feel heavy.</p>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  </div>
</template>
