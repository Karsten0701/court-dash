<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <div
    class="flex flex-col items-center justify-center h-screen text-center px-4"
  >
    <h1 class="text-6xl font-bold text-snow mb-4">404</h1>
    <p class="text-xl text-snow-dim mb-8">Page Not Found</p>
    <router-link
      to="/"
      class="px-6 py-3 bg-racket text-white rounded-lg hover:bg-racket-hover transition-colors"
    >
      <font-awesome-icon icon="home" class="mr-2" />
      Go Back Home
    </router-link>
  </div>
</template>

<style scoped></style>
