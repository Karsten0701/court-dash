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
    class="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 pt-2"
    :class="{ hidden: route.name === 'NotFound' }"
  >
    <ul
      class="flex w-full max-w-md items-center justify-between gap-1 rounded-full border border-white/10 bg-charcoal/80 px-3 py-2 shadow-card backdrop-blur-xl sm:px-4"
    >
      <li v-for="item in navItems" :key="item.to" class="min-w-0 flex-1">
        <router-link
          :to="item.to"
          class="group relative flex min-w-0 flex-col items-center gap-1 rounded-full px-2 py-2 transition-all duration-200"
          :class="
            item.names.includes(route.name)
              ? 'text-white'
              : 'text-snow-dim hover:text-white'
          "
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
            :class="
              item.names.includes(route.name)
                ? 'bg-violet-grad shadow-glow-sm'
                : 'bg-transparent group-hover:bg-white/5'
            "
          >
            <font-awesome-icon :icon="item.icon" class="text-base sm:text-lg" />
          </span>
          <span class="truncate text-[10px] font-medium leading-none sm:text-xs">{{
            item.label
          }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>
