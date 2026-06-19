<script setup>
import { computed } from "vue";
import PublicSiteFooter from "@/components/PublicSiteFooter.vue";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";
import { t } from "@/i18n";
import heroBgUrl from "../../bg image.jpg";

const highlights = computed(() => [
  { label: t("landing.proofClubs"), value: "12+" },
  { label: t("landing.proofMatches"), value: "3.8k" },
  { label: t("landing.proofAdmin"), value: "6h" },
]);

const features = computed(() => [
  {
    icon: "users",
    title: t("landing.featurePlayerTitle"),
    text: t("landing.featurePlayerText"),
  },
  {
    icon: "table-tennis-paddle-ball",
    title: t("landing.featureGameTitle"),
    text: t("landing.featureGameText"),
  },
  {
    icon: "server",
    title: t("landing.featureSystemTitle"),
    text: t("landing.featureSystemText"),
  },
]);

const workflow = computed(() => [
  {
    icon: "calendar-days",
    title: t("landing.workflowPlan"),
    text: t("landing.workflowPlanText"),
  },
  {
    icon: "table-tennis-paddle-ball",
    title: t("landing.workflowRun"),
    text: t("landing.workflowRunText"),
  },
  {
    icon: "trophy",
    title: t("landing.workflowRank"),
    text: t("landing.workflowRankText"),
  },
]);
</script>

<template>
  <div class="min-h-screen bg-court px-4 py-4 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-screen max-w-7xl flex-col">
      <PublicSiteHeader />

      <main class="flex flex-1 flex-col gap-16 py-8 lg:gap-20 lg:py-10">
        <section
          class="relative left-1/2 min-h-[calc(100vh-6.5rem)] w-screen -translate-x-1/2 overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        >
          <div
            class="absolute inset-0 bg-cover bg-center"
            :style="{ backgroundImage: `url(${heroBgUrl})` }"
            aria-hidden="true"
          ></div>
          <div
            class="absolute inset-0 bg-white/30"
            aria-hidden="true"
          ></div>
          <div class="relative z-10 mx-auto grid max-w-7xl gap-10 rounded-lg border border-[#d7e1da] bg-white p-5 shadow-card sm:p-8 lg:grid-cols-[0.95fr_0.75fr] lg:items-center lg:p-10">
          <div class="max-w-3xl">
            <span class="inline-flex items-center gap-2 rounded-full border border-[#d7e1da] bg-[#f4f8f5] px-3 py-1 text-xs font-semibold uppercase text-[#127b5c]">
              <span class="h-1.5 w-1.5 rounded-full bg-ball"></span>
              {{ $t("landing.heroBadge") }}
            </span>
            <h1 class="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[#071812] sm:text-6xl lg:text-7xl">
              {{ $t("landing.title") }}
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-[#53675d] sm:text-lg">
              {{ $t("landing.subtitle") }}
            </p>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-[#6f8278]">
              {{ $t("landing.heroProof") }}
            </p>

            <div class="mt-7 flex flex-col gap-3 sm:flex-row">
              <router-link
                to="/login"
                class="inline-flex items-center justify-center gap-2 rounded-md bg-racket px-5 py-3 text-sm font-semibold text-white hover:bg-racket-hover"
              >
                <font-awesome-icon icon="sign-in-alt" />
                {{ $t("landing.openDashboard") }}
              </router-link>
              <router-link
                to="/features"
                class="inline-flex items-center justify-center gap-2 rounded-md border border-[#d7e1da] bg-white px-5 py-3 text-sm font-semibold text-[#071812] hover:bg-[#f4f8f5]"
              >
                <font-awesome-icon icon="chevron-right" />
                {{ $t("landing.viewFeatures") }}
              </router-link>
            </div>

            <p class="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8278]">
              {{ $t("landing.clubProof") }}
            </p>
            <dl class="mt-4 grid max-w-2xl grid-cols-3 gap-3">
              <div
                v-for="item in highlights"
                :key="item.label"
                class="rounded-lg border border-[#d7e1da] bg-white p-4"
              >
                <dt class="text-xs text-[#6f8278]">{{ item.label }}</dt>
                <dd class="mt-2 text-2xl font-semibold text-[#127b5c]">{{ item.value }}</dd>
              </div>
            </dl>
          </div>

          <div class="rounded-lg border border-[#d7e1da] bg-white p-5 shadow-card">
            <div class="mb-5 flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-[#127b5c]">{{ $t("landing.liveBoard") }}</p>
                <p class="mt-1 text-lg font-semibold text-[#071812]">{{ $t("landing.courtTitle") }}</p>
              </div>
              <span class="inline-flex items-center gap-2 rounded-full bg-[#e8f4ee] px-3 py-1 text-xs font-medium text-[#127b5c]">
                <span class="h-2 w-2 rounded-full bg-turf" />
                {{ $t("status.ready") }}
              </span>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-lg border border-[#d7e1da] bg-[#f4f8f5] p-4">
                <p class="text-xs text-[#6f8278]">{{ $t("landing.players") }}</p>
                <p class="mt-2 text-3xl font-semibold tabular-nums text-[#071812]">24</p>
              </div>
              <div class="rounded-lg border border-[#d7e1da] bg-[#f4f8f5] p-4">
                <p class="text-xs text-[#6f8278]">{{ $t("landing.games") }}</p>
                <p class="mt-2 text-3xl font-semibold tabular-nums text-[#071812]">8</p>
              </div>
              <div class="rounded-lg border border-[#d7e1da] bg-[#f4f8f5] p-4">
                <p class="text-xs text-[#6f8278]">{{ $t("landing.capacity") }}</p>
                <p class="mt-2 text-3xl font-semibold tabular-nums text-[#071812]">91%</p>
              </div>
            </div>

            <div class="mt-4 space-y-3">
              <div class="flex items-center justify-between rounded-lg border border-[#d7e1da] bg-[#f4f8f5] p-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-8 w-8 items-center justify-center rounded-md bg-racket text-xs text-white">
                    <font-awesome-icon icon="calendar-days" />
                  </span>
                  <div>
                    <p class="text-sm font-medium text-[#071812]">{{ $t("landing.roundOne") }}</p>
                    <p class="text-xs text-[#6f8278]">{{ $t("landing.courtTime") }}</p>
                  </div>
                </div>
                <font-awesome-icon icon="chevron-right" class="text-[#6f8278]" />
              </div>
              <div class="flex items-center justify-between rounded-lg border border-[#d7e1da] bg-[#f4f8f5] p-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-8 w-8 items-center justify-center rounded-md bg-ball text-xs text-[#071812]">
                    <font-awesome-icon icon="trophy" />
                  </span>
                  <div>
                    <p class="text-sm font-medium text-[#071812]">{{ $t("landing.rankingUpdate") }}</p>
                    <p class="text-xs text-[#6f8278]">{{ $t("landing.scoresProcessed") }}</p>
                  </div>
                </div>
                <font-awesome-icon icon="chevron-right" class="text-[#6f8278]" />
              </div>
            </div>
          </div>
          </div>
        </section>

        <section class="grid gap-4 lg:grid-cols-3">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-card"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-md bg-asphalt text-racket">
              <font-awesome-icon :icon="feature.icon" />
            </div>
            <h2 class="mt-4 text-base font-semibold text-snow">{{ feature.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-snow-dim">{{ feature.text }}</p>
          </article>
        </section>

        <section class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-racket">{{ $t("landing.repeatedTitle") }}</p>
            <h2 class="mt-3 text-3xl font-semibold leading-tight text-snow sm:text-4xl">
              {{ $t("landing.workflowTitle") }}
            </h2>
          </div>
          <p class="text-base leading-7 text-snow-dim">{{ $t("landing.workflowSubtitle") }}</p>
        </section>

        <section class="grid gap-4 lg:grid-cols-3">
          <article
            v-for="(step, index) in workflow"
            :key="step.title"
            class="rounded-lg border border-asphalt-light bg-asphalt p-5"
          >
            <div class="flex items-center justify-between">
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-ball text-white">
                <font-awesome-icon :icon="step.icon" />
              </div>
              <span class="font-mono text-sm text-asphalt-muted">0{{ index + 1 }}</span>
            </div>
            <h3 class="mt-5 text-lg font-semibold text-snow">{{ step.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-snow-dim">{{ step.text }}</p>
          </article>
        </section>

        <section class="rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-card lg:p-8">
          <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <h2 class="text-3xl font-semibold leading-tight text-snow">{{ $t("landing.insightTitle") }}</h2>
              <p class="mt-4 max-w-2xl text-sm leading-7 text-snow-dim">{{ $t("landing.insightText") }}</p>
            </div>
            <div class="grid gap-3">
              <div class="flex items-center gap-3 rounded-lg border border-asphalt-light bg-asphalt p-4 text-sm font-medium text-snow">
                <font-awesome-icon icon="check" class="text-ball" />
                {{ $t("landing.insightOne") }}
              </div>
              <div class="flex items-center gap-3 rounded-lg border border-asphalt-light bg-asphalt p-4 text-sm font-medium text-snow">
                <font-awesome-icon icon="check" class="text-ball" />
                {{ $t("landing.insightTwo") }}
              </div>
              <div class="flex items-center gap-3 rounded-lg border border-asphalt-light bg-asphalt p-4 text-sm font-medium text-snow">
                <font-awesome-icon icon="check" class="text-ball" />
                {{ $t("landing.insightThree") }}
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-lg border border-asphalt-light bg-racket p-6 text-white shadow-card lg:p-8">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-2xl font-semibold">{{ $t("landing.finalCtaTitle") }}</h2>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-white">{{ $t("landing.finalCtaText") }}</p>
            </div>
            <router-link
              to="/pricing"
              class="inline-flex items-center justify-center gap-2 rounded-md bg-court px-5 py-3 text-sm font-semibold text-snow hover:bg-charcoal"
            >
              <font-awesome-icon icon="credit-card" />
              {{ $t("nav.pricing") }}
            </router-link>
          </div>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  </div>
</template>
