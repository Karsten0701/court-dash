<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import appConfig from "@/config/appConfig";
import authService from "@/services/authService.js";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { t } from "@/i18n";

const route = useRoute();
const router = useRouter();

const managerTabs = [
  { to: "/dashboard", labelKey: "nav.overview", name: "Dashboard", icon: "house" },
  { to: "/players", labelKey: "nav.players", name: "Players", icon: "users" },
  { to: "/games", labelKey: "nav.games", name: "Games", icon: "table-tennis-paddle-ball" },
];

const activeTabName = computed(() => route.name);
const currentUser = computed(() => authService.getCurrentUser());
const tabs = computed(() =>
  authService.isAdmin()
    ? [
        {
          to: "/dashboard",
          labelKey: "nav.platform",
          name: "Dashboard",
          icon: "server",
        },
      ]
    : managerTabs,
);
const userInitial = computed(() =>
  (currentUser.value?.name || currentUser.value?.email || "A")
    .charAt(0)
    .toUpperCase(),
);

const pageTitle = computed(() => {
  if (route.name === "Dashboard") {
    return authService.isAdmin() ? t("nav.platform") : t("nav.overview");
  }
  if (route.name === "Players") return t("nav.players");
  if (route.name === "Games") return t("nav.games");
  return route.name || t("nav.dashboard");
});

const handleLogout = async () => {
  try {
    await authService.logout();
  } finally {
    router.push("/");
  }
};
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-white/5 bg-court/80 backdrop-blur-xl"
  >
    <div
      class="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="flex items-center justify-between gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-grad text-white shadow-glow-sm"
        >
          <font-awesome-icon icon="table-tennis-paddle-ball" />
        </div>
        <div>
          <p class="text-sm font-semibold leading-tight text-snow">
            {{ appConfig.name }}
          </p>
          <p class="text-xs text-asphalt-muted">
            {{ pageTitle }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3">
        <nav
          class="flex flex-1 justify-start lg:justify-end gap-1 text-sm"
          :aria-label="$t('nav.main')"
        >
          <router-link
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 font-medium text-snow-dim transition-all hover:bg-white/5 hover:text-snow"
            :class="{
              'border-white/10 bg-white/5 text-snow shadow-glow-sm': tab.name === activeTabName,
            }"
          >
            <font-awesome-icon :icon="tab.icon" class="text-[11px] lg:text-xs" />
            <span class="font-medium">{{ $t(tab.labelKey) }}</span>
          </router-link>
        </nav>

        <ThemeToggle />

        <button
          type="button"
          class="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-snow transition-all hover:bg-white/10"
          @click="handleLogout"
        >
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-grad text-white text-[11px] font-semibold shadow-glow-sm"
          >
            {{ userInitial }}
          </span>
          <div class="leading-tight text-left">
            <p class="font-medium text-snow text-xs">
              {{ currentUser?.name || $t("players.admin") }}
            </p>
            <p class="text-[10px] text-asphalt-muted">{{ $t("nav.logout") }}</p>
          </div>
        </button>
      </div>
    </div>
  </header>
</template>
