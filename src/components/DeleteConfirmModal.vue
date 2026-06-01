<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: "Delete Account",
  },
  message: {
    type: String,
    default:
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
  },
  confirmLabel: {
    type: String,
    default: "Delete Account",
  },
});

defineEmits(["confirm", "cancel"]);
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-court/80 backdrop-blur-sm"
    @click.self="$emit('cancel')"
  >
    <div class="glass-card mx-4 w-full max-w-md p-6">
      <h3 class="text-lg font-semibold text-snow mb-4">{{ title }}</h3>
      <p class="text-sm text-snow-dim mb-6">{{ message }}</p>
      <div class="flex gap-3 justify-end">
        <button @click="$emit('cancel')" class="btn-glass">
          <FontAwesomeIcon icon="times" />
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-danger px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-danger-hover"
        >
          <FontAwesomeIcon icon="trash-alt" />
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
