<script setup>
import PublicSiteFooter from "@/components/PublicSiteFooter.vue";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";

const highlights = [
  { label: "Setup", value: "Fast" },
  { label: "Views", value: "Live" },
  { label: "Admin", value: "Clear" },
];

const features = [
  {
    icon: "users",
    title: "Player records",
    text: "Keep players, roles and ranking visibility tidy from one admin view.",
  },
  {
    icon: "table-tennis-paddle-ball",
    title: "Game control",
    text: "Create sessions, add participants and move games from planning to results.",
  },
  {
    icon: "server",
    title: "System checks",
    text: "See API and database status before match night starts.",
  },
];
</script>

<template>
  <div class="min-h-screen bg-court px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
      <PublicSiteHeader />

      <main class="flex flex-1 flex-col gap-14 py-10 lg:py-14">
        <section class="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div class="max-w-3xl">
            <p class="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-asphalt-muted">
              For padel and tennis organizers
            </p>
            <h1 class="text-4xl font-semibold leading-tight text-snow sm:text-5xl lg:text-6xl">
              Run your court nights without the spreadsheet mess.
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-snow-dim sm:text-lg">
              Plan sessions, manage players, follow rankings and keep match-night admin in one clean dashboard.
            </p>

            <div class="mt-7 flex flex-col gap-3 sm:flex-row">
              <router-link
                to="/login"
                class="inline-flex items-center justify-center gap-2 rounded-md bg-racket px-4 py-2.5 text-sm font-medium text-white hover:bg-racket-hover"
              >
                <font-awesome-icon icon="sign-in-alt" />
                Open dashboard
              </router-link>
              <router-link
                to="/features"
                class="inline-flex items-center justify-center gap-2 rounded-md border border-asphalt-light px-4 py-2.5 text-sm font-medium text-snow hover:bg-asphalt"
              >
                <font-awesome-icon icon="chevron-right" />
                View features
              </router-link>
            </div>

            <dl class="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <div
                v-for="item in highlights"
                :key="item.label"
                class="rounded-lg border border-asphalt-light bg-charcoal p-4"
              >
                <dt class="text-xs text-asphalt-muted">{{ item.label }}</dt>
                <dd class="mt-2 text-2xl font-semibold text-snow">{{ item.value }}</dd>
              </div>
            </dl>
          </div>

          <div class="rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-card">
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
        </section>

        <section class="grid gap-4 lg:grid-cols-3">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="rounded-lg border border-asphalt-light bg-charcoal p-5"
          >
            <font-awesome-icon :icon="feature.icon" class="text-asphalt-muted" />
            <h2 class="mt-4 text-base font-semibold text-snow">{{ feature.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-snow-dim">{{ feature.text }}</p>
          </article>
        </section>

        <section class="rounded-lg border border-asphalt-light bg-charcoal p-5 lg:p-6">
          <div class="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p class="text-sm font-semibold text-snow">Built for repeated use</p>
              <p class="mt-2 text-sm leading-6 text-snow-dim">
                The layout stays quiet and practical: quick scanning, clear actions and no heavy marketing clutter.
              </p>
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <router-link to="/features" class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4 hover:bg-asphalt">
                <p class="text-sm font-medium text-snow">Features</p>
                <p class="mt-1 text-xs text-snow-dim">What the dashboard handles.</p>
              </router-link>
              <router-link to="/pricing" class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4 hover:bg-asphalt">
                <p class="text-sm font-medium text-snow">Pricing</p>
                <p class="mt-1 text-xs text-snow-dim">Simple plans for clubs.</p>
              </router-link>
              <router-link to="/contact" class="rounded-lg border border-asphalt-light bg-asphalt/40 p-4 hover:bg-asphalt">
                <p class="text-sm font-medium text-snow">Contact</p>
                <p class="mt-1 text-xs text-snow-dim">Prepare your setup.</p>
              </router-link>
            </div>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  </div>
</template>
