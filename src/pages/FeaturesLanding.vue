<script setup>
import { computed } from "vue";
import PublicSiteFooter from "@/components/PublicSiteFooter.vue";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";
import { t } from "@/i18n";

const featureGroups = computed(() => [
  {
    icon: "calendar-days",
    title: t("publicPages.planEverySession"),
    text: t("publicPages.planEverySessionText"),
  },
  {
    icon: "users",
    title: t("publicPages.managePlayers"),
    text: t("publicPages.managePlayersText"),
  },
  {
    icon: "trophy",
    title: t("publicPages.trackStandings"),
    text: t("publicPages.trackStandingsText"),
  },
  {
    icon: "server",
    title: t("publicPages.checkSystemHealth"),
    text: t("publicPages.checkSystemHealthText"),
  },
]);
</script>

<template>
  <div class="min-h-screen bg-court px-4 py-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <PublicSiteHeader />

      <main class="py-10 lg:py-14">
        <section class="rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-card lg:p-8">
          <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p class="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-racket">
              {{ $t("publicPages.featuresKicker") }}
            </p>
            <h1 class="text-4xl font-semibold leading-tight text-snow sm:text-5xl">
              {{ $t("publicPages.featuresTitleAlt") }}
            </h1>
          </div>
          <p class="max-w-2xl text-base leading-7 text-snow-dim">
            {{ $t("publicPages.featuresSubtitleAlt") }}
          </p>
          </div>
          <div class="mt-8 grid gap-3 sm:grid-cols-3">
            <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
              <p class="text-3xl font-semibold text-ball">5</p>
              <p class="mt-1 text-xs text-snow-dim">{{ $t("publicPages.featuresMetricOne") }}</p>
            </div>
            <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
              <p class="text-3xl font-semibold text-ball">3</p>
              <p class="mt-1 text-xs text-snow-dim">{{ $t("publicPages.featuresMetricTwo") }}</p>
            </div>
            <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
              <p class="text-3xl font-semibold text-ball">24/7</p>
              <p class="mt-1 text-xs text-snow-dim">{{ $t("publicPages.featuresMetricThree") }}</p>
            </div>
          </div>
        </section>

        <section class="mt-12 grid gap-4 md:grid-cols-2">
          <article
            v-for="feature in featureGroups"
            :key="feature.title"
            class="rounded-lg border border-asphalt-light bg-asphalt p-5"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-asphalt text-racket">
              <font-awesome-icon :icon="feature.icon" />
            </div>
            <h2 class="mt-5 text-lg font-semibold text-snow">{{ feature.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-snow-dim">{{ feature.text }}</p>
          </article>
        </section>

        <section class="mt-12 rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-card lg:p-8">
          <div class="grid gap-8 lg:grid-cols-3">
            <div class="lg:col-span-1">
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-racket">{{ $t("publicPages.adminWorkflow") }}</p>
              <h2 class="mt-3 text-2xl font-semibold text-snow">{{ $t("publicPages.featuresOpsTitle") }}</h2>
              <p class="mt-2 text-sm leading-6 text-snow-dim">
                {{ $t("publicPages.featuresOpsText") }}
              </p>
            </div>
            <div class="grid gap-3 lg:col-span-2">
              <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
                <p class="text-sm font-medium text-snow">{{ $t("publicPages.createTheGame") }}</p>
                <p class="mt-1 text-sm text-snow-dim">{{ $t("publicPages.createTheGameText") }}</p>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
                <p class="text-sm font-medium text-snow">{{ $t("publicPages.addPlayers") }}</p>
                <p class="mt-1 text-sm text-snow-dim">{{ $t("publicPages.addPlayersText") }}</p>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
                <p class="text-sm font-medium text-snow">{{ $t("publicPages.processScores") }}</p>
                <p class="mt-1 text-sm text-snow-dim">{{ $t("publicPages.processScoresText") }}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  </div>
</template>
