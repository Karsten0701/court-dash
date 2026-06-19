<script setup>
import PublicSiteFooter from "@/components/PublicSiteFooter.vue";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";
</script>

<template>
  <div class="min-h-screen bg-court px-4 py-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <PublicSiteHeader />

      <main class="py-10 lg:py-14">
        <section class="grid gap-8 rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-card lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
          <div>
            <p class="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-racket">
              {{ $t("publicPages.contactBadge") }}
            </p>
            <h1 class="text-4xl font-semibold leading-tight text-snow sm:text-5xl">
              {{ $t("publicPages.contactTitle") }}
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-snow-dim">
              {{ $t("publicPages.contactSubtitle") }}
            </p>
            <div class="mt-8 rounded-lg border border-asphalt-light bg-asphalt p-4">
              <p class="text-sm font-semibold text-snow">{{ $t("publicPages.contactResponse") }}</p>
              <p class="mt-2 text-sm leading-6 text-snow-dim">{{ $t("publicPages.contactResponseText") }}</p>
            </div>
          </div>

          <div class="rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-xl">
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-ball">{{ $t("publicPages.setupChecklist") }}</p>
            <h2 class="mt-3 text-2xl font-semibold text-snow">{{ $t("publicPages.contactOpsTitle") }}</h2>
            <p class="mt-2 text-sm leading-6 text-snow-dim">{{ $t("publicPages.contactOpsText") }}</p>
            <div class="mt-5 grid gap-3">
              <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
                <p class="text-sm font-medium text-snow">{{ $t("publicPages.playerList") }}</p>
                <p class="mt-1 text-sm text-snow-dim">{{ $t("publicPages.playerListText") }}</p>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
                <p class="text-sm font-medium text-snow">{{ $t("publicPages.gameFormat") }}</p>
                <p class="mt-1 text-sm text-snow-dim">{{ $t("publicPages.gameFormatText") }}</p>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
                <p class="text-sm font-medium text-snow">{{ $t("publicPages.courtSchedule") }}</p>
                <p class="mt-1 text-sm text-snow-dim">{{ $t("publicPages.courtScheduleText") }}</p>
              </div>
            </div>

            <router-link
              to="/login"
              class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-racket px-4 py-3 text-sm font-semibold text-white hover:bg-racket-hover"
            >
              <font-awesome-icon icon="sign-in-alt" />
              {{ $t("publicPages.openLogin") }}
            </router-link>
          </div>
        </section>

        <section class="mt-12 grid gap-4 md:grid-cols-3">
          <div class="rounded-lg border border-asphalt-light bg-asphalt p-5">
            <font-awesome-icon icon="users" class="text-racket" />
            <p class="mt-4 text-sm font-semibold text-snow">{{ $t("publicPages.smallClubs") }}</p>
            <p class="mt-2 text-sm leading-6 text-snow-dim">{{ $t("publicPages.smallClubsText") }}</p>
          </div>
          <div class="rounded-lg border border-asphalt-light bg-asphalt p-5">
            <font-awesome-icon icon="calendar-days" class="text-racket" />
            <p class="mt-4 text-sm font-semibold text-snow">{{ $t("publicPages.weeklySessions") }}</p>
            <p class="mt-2 text-sm leading-6 text-snow-dim">{{ $t("publicPages.weeklySessionsText") }}</p>
          </div>
          <div class="rounded-lg border border-asphalt-light bg-asphalt p-5">
            <font-awesome-icon icon="chart-line" class="text-racket" />
            <p class="mt-4 text-sm font-semibold text-snow">{{ $t("publicPages.rankedPlay") }}</p>
            <p class="mt-2 text-sm leading-6 text-snow-dim">{{ $t("publicPages.rankedPlayText") }}</p>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  </div>
</template>
