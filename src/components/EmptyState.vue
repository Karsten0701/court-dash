<script setup>
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, default: "" },
  actionLabel: { type: String, default: "" },
  actionIcon: { type: String, default: "" },
});

defineEmits(["action"]);
</script>

<template>
  <div
    class="rounded-2xl border border-white/5 bg-charcoal/70 p-10 text-center shadow-card backdrop-blur-xl"
  >
    <div
      class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-soft text-racket"
    >
      <font-awesome-icon :icon="icon" class="h-6 w-6" />
    </div>
    <h3 class="mt-4 text-base font-semibold text-snow">{{ title }}</h3>
    <p v-if="message" class="mt-1 text-sm text-asphalt-muted">{{ message }}</p>
    <div v-if="actionLabel" class="mt-6">
      <button @click="$emit('action')" class="btn-violet">
        <font-awesome-icon v-if="actionIcon" :icon="actionIcon" />
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>
