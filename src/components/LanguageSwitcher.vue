<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { currentLocale, setLocale } from "@/i18n";

const route = useRoute();
const isOpen = ref(false);
const switcher = ref(null);

const languages = [
  { code: "en", labelKey: "language.en" },
  { code: "nl", labelKey: "language.nl" },
];

const activeLocale = computed(() => currentLocale.value);
const showSwitcher = computed(() => route.name !== "NotFound");

const chooseLocale = (locale) => {
  setLocale(locale);
  isOpen.value = false;
};

const handlePointerDown = (event) => {
  if (!switcher.value?.contains(event.target)) {
    isOpen.value = false;
  }
};

const handleKeydown = (event) => {
  if (event.key === "Escape") {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div
    v-if="showSwitcher"
    ref="switcher"
    class="fixed right-4 top-4 z-[90]"
  >
    <button
      type="button"
      class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-charcoal/85 text-snow shadow-card backdrop-blur-xl transition-colors hover:bg-asphalt"
      :aria-label="$t('language.switcherLabel')"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="isOpen = !isOpen"
    >
      <font-awesome-icon icon="globe" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-white/10 bg-charcoal/95 p-1 shadow-card backdrop-blur-xl"
      role="menu"
    >
      <button
        v-for="language in languages"
        :key="language.code"
        type="button"
        class="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-snow-dim hover:bg-white/5 hover:text-snow"
        :aria-current="activeLocale === language.code ? 'true' : undefined"
        role="menuitem"
        @click="chooseLocale(language.code)"
      >
        <span>{{ $t(language.labelKey) }}</span>
        <font-awesome-icon
          v-if="activeLocale === language.code"
          icon="check"
          class="text-xs text-turf"
        />
      </button>
    </div>
  </div>
</template>
