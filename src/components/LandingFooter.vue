<script setup>
import appConfig from "@/config/appConfig";
</script>

<template>
  <footer class="border-t border-white/5 py-10">
    <div
      class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center lg:px-8"
    >
      <div>
        <p class="text-sm font-semibold text-snow">{{ appConfig.name }}</p>
        <p class="mt-1 text-xs text-asphalt-muted">
          Court sessions, ELO rankings, one ladder.
        </p>
      </div>
      <router-link to="/login" class="btn-glass text-xs">
        Admin log in
      </router-link>
    </div>
  </footer>
</template>
