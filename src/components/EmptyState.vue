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
  <div class="bg-charcoal rounded-lg p-8 text-center">
    <font-awesome-icon :icon="icon" class="mx-auto h-8 w-8 text-asphalt-muted" />
    <h3 class="mt-2 text-sm font-medium text-snow">{{ title }}</h3>
    <p v-if="message" class="mt-1 text-sm text-asphalt-muted">{{ message }}</p>
    <div v-if="actionLabel" class="mt-6">
      <button
        @click="$emit('action')"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-racket hover:bg-racket-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-racket"
      >
        <font-awesome-icon v-if="actionIcon" :icon="actionIcon" class="mr-2" />
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>
