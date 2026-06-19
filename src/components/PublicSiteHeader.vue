<script setup>
import ThemeToggle from "@/components/ThemeToggle.vue";

const links = [
  { to: "/", labelKey: "nav.home" },
  { to: "/features", labelKey: "nav.features" },
  { to: "/pricing", labelKey: "nav.pricing" },
  { to: "/contact", labelKey: "nav.contact" },
];
</script>

<template>
  <header class="sticky top-4 z-50 rounded-lg border border-asphalt-light bg-charcoal px-4 py-3 shadow-card">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <router-link to="/" class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-lg bg-racket text-white"
      >
        <font-awesome-icon icon="table-tennis-paddle-ball" />
      </div>
      <div>
        <p class="text-sm font-semibold leading-tight text-snow">
          {{ $t("common.appName") }}
        </p>
        <p class="text-xs text-asphalt-muted">{{ $t("common.dashboardTagline") }}</p>
      </div>
    </router-link>

    <div class="flex flex-wrap items-center gap-2">
      <nav class="flex flex-wrap items-center gap-1 text-sm" :aria-label="$t('nav.public')">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-md border border-transparent px-3 py-2 text-xs font-medium text-snow-dim transition hover:bg-asphalt hover:text-snow"
          exact-active-class="border-asphalt-light bg-asphalt text-snow"
        >
          {{ $t(link.labelKey) }}
        </router-link>
      </nav>

      <ThemeToggle />

      <a
        href="/login#login"
        class="inline-flex items-center gap-2 rounded-md bg-racket px-3 py-2 text-xs font-semibold text-white hover:bg-racket-hover"
      >
        <font-awesome-icon icon="sign-in-alt" />
        {{ $t("nav.login") }}
      </a>
    </div>
    </div>
  </header>
</template>
