<script setup>
import { computed, onMounted, ref } from "vue";

const STORAGE_KEY = "courtDashTheme";
const theme = ref("light");

const applyTheme = (value) => {
  theme.value = value;
  document.documentElement.classList.toggle("theme-dark", value === "dark");
  document.documentElement.classList.toggle("theme-light", value === "light");
  window.localStorage.setItem(STORAGE_KEY, value);
};

const icon = computed(() => (theme.value === "dark" ? "sun" : "moon"));

const toggleTheme = () => {
  applyTheme(theme.value === "dark" ? "light" : "dark");
};

onMounted(() => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  applyTheme(stored || "light");
});
</script>

<template>
  <button
    type="button"
    class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-asphalt-light bg-charcoal text-snow transition-colors hover:bg-asphalt"
    aria-label="Toggle color mode"
    @click="toggleTheme"
  >
    <font-awesome-icon :icon="icon" />
  </button>
</template>
