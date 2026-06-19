<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import appConfig from "@/config/appConfig";

const router = useRouter();
const menuOpen = ref(false);

const links = [
  { id: "home", labelKey: "nav.home" },
  { id: "how-it-works", labelKey: "nav.howItWorks" },
  { id: "faq", labelKey: "nav.faq" },
];

const scrollTo = (id) => {
  menuOpen.value = false;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  router.push({ path: "/", hash: `#${id}` });
};

const onKeydown = (e) => {
  if (e.key === "Escape") menuOpen.value = false;
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-white/5 bg-court/80 backdrop-blur-xl"
  >
    <div
      class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-8"
    >
      <button
        type="button"
        class="flex items-center gap-2.5 text-left"
        @click="scrollTo('home')"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-grad text-white shadow-glow-sm"
        >
          <font-awesome-icon icon="table-tennis-paddle-ball" />
        </span>
        <span class="text-sm font-semibold text-snow">{{ appConfig.name }}</span>
      </button>

      <nav class="hidden items-center gap-1 md:flex" :aria-label="$t('nav.landing')">
        <button
          v-for="link in links"
          :key="link.id"
          type="button"
          class="rounded-full px-3 py-2 text-sm font-medium text-snow-dim transition-colors hover:bg-white/5 hover:text-snow"
          @click="scrollTo(link.id)"
        >
          {{ $t(link.labelKey) }}
        </button>
      </nav>

      <div class="flex items-center gap-2">
        <router-link to="/login" class="btn-violet text-xs sm:text-sm">
          <font-awesome-icon icon="sign-in-alt" />
          {{ $t("nav.login") }}
        </router-link>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-snow-dim transition-colors hover:bg-white/5 hover:text-snow md:hidden"
          :aria-label="$t('nav.openMenu')"
          @click="menuOpen = !menuOpen"
        >
          <font-awesome-icon :icon="menuOpen ? 'times' : 'bars'" />
        </button>
      </div>
    </div>

    <div
      v-if="menuOpen"
      class="border-t border-white/5 px-4 py-3 md:hidden"
    >
      <div class="flex flex-col gap-1">
        <button
          v-for="link in links"
          :key="link.id"
          type="button"
          class="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-snow-dim transition-colors hover:bg-white/5 hover:text-snow"
          @click="scrollTo(link.id)"
        >
          {{ $t(link.labelKey) }}
        </button>
      </div>
    </div>
  </header>
</template>
