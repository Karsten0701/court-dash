<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const navItems = [
  {
    to: "/",
    label: "Home",
    icon: "house",
    names: ["Home"],
  },
  {
    to: "/leaderboard",
    label: "Leaderboard",
    icon: "trophy",
    names: ["Leaderboard", "ProfileDetails"],
  },
  {
    to: "/history",
    label: "History",
    icon: "chart-line",
    names: ["History"],
  },
  {
    to: "/account",
    label: "Account",
    icon: "user-circle",
    names: ["Account"],
  },
];
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-charcoal text-white shadow-md"
    :class="{ hidden: route.name === 'NotFound' }"
  >
    <ul class="grid grid-cols-4 items-center gap-1 px-2 py-2 sm:px-4">
      <li v-for="item in navItems" :key="item.to" class="min-w-0">
        <router-link
          :to="item.to"
          class="flex min-w-0 flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors text-gray-400 hover:text-white"
          :class="{ 'text-white': item.names.includes(route.name) }"
        >
          <font-awesome-icon :icon="item.icon" class="text-xl sm:text-2xl" />
          <span class="truncate text-[11px] leading-none sm:text-xs">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>
