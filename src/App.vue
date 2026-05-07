<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AdminHeader from "./components/AdminHeader.vue";

const route = useRoute();
const router = useRouter();
const isInitialLoad = ref(true);
const showAdminShell = computed(() => route.meta.requiresAuth);

router.isReady().then(() => {
  setTimeout(() => {
    isInitialLoad.value = false;
  }, 100);
});
</script>

<template>
  <div class="min-h-screen bg-court text-snow">
    <AdminHeader v-if="showAdminShell" />

    <main
      :class="showAdminShell
        ? 'max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10'
        : 'min-h-screen'"
    >
      <router-view v-slot="{ Component, route }">
        <Transition :name="isInitialLoad ? '' : 'page'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<style>
.page-enter-active {
  transition: all 0.3s ease-out;
}

.page-leave-active {
  transition: all 0.25s ease-in;
}

.page-enter-from {
  opacity: 0;
  /* transform: translateX(20px); */
}

.page-leave-to {
  opacity: 0;
  /* transform: translateX(-20px); */
}
</style>
