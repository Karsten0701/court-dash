<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import appConfig from "@/config/appConfig";

const route = useRoute();

const tabs = [
  { to: "/", label: "Overview", name: "Dashboard", icon: "gauge-high" },
  { to: "/players", label: "Players", name: "Players", icon: "users" },
  { to: "/games", label: "Games", name: "Games", icon: "table-tennis-paddle-ball" },
  { to: "/status", label: "API Status", name: "ApiStatus", icon: "server" },
];

const activeTabName = computed(() => route.name);

const pageTitle = computed(() => {
  if (route.meta?.title) return route.meta.title;
  if (route.name === "Dashboard") return "Overview";
  return route.name || "Dashboard";
});
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-asphalt-light bg-charcoal/95 backdrop-blur"
  >
    <div
      class="max-w-7xl mx-auto px-4 lg:px-8 py-3 lg:py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-md bg-racket text-snow shadow-md"
        >
          <font-awesome-icon icon="table-tennis-paddle-ball" class="text-lg" />
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-asphalt-muted">
            {{ appConfig.name }}
          </p>
          <h1 class="text-lg font-semibold leading-tight text-snow">
            {{ pageTitle }}
          </h1>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4">
        <nav
          class="flex flex-1 justify-center lg:justify-end gap-1 rounded-full bg-asphalt px-1 py-1 text-xs lg:text-sm"
          aria-label="Main navigation"
        >
          <router-link
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="inline-flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full transition-all duration-150 text-snow-dim hover:text-snow"
            :class="{
              'bg-racket text-snow shadow-sm': tab.name === activeTabName,
            }"
          >
            <font-awesome-icon :icon="tab.icon" class="text-[11px] lg:text-xs" />
            <span class="font-medium">{{ tab.label }}</span>
          </router-link>
        </nav>

        <div
          class="hidden sm:flex items-center gap-2 rounded-full bg-asphalt px-3 py-1.5 text-xs"
        >
          <span
            class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-turf text-snow text-[11px] font-semibold"
          >
            A
          </span>
          <div class="leading-tight">
            <p class="font-medium text-snow text-xs">Admin</p>
            <p class="text-[10px] text-asphalt-muted">Management Console</p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

