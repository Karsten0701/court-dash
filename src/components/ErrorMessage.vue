<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  hint: { type: String, default: null },
  retryLabel: { type: String, default: null },
  retryIcon: { type: String, default: "redo" },
});

const emit = defineEmits(["retry"]);
</script>

<template>
  <div
    class="rounded-2xl border border-danger-border/60 bg-danger-surface/70 p-6 shadow-card backdrop-blur-xl"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <font-awesome-icon icon="circle-xmark" class="h-5 w-5 text-danger" />
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-danger">{{ title }}</h3>
        <p v-if="hint" class="mt-2 text-sm text-danger">{{ hint }}</p>
        <slot />
        <details class="mt-2 group">
          <summary
            class="text-xs text-asphalt-muted cursor-pointer select-none hover:text-snow-dim list-none flex items-center gap-1"
          >
            <font-awesome-icon
              icon="chevron-right"
              class="text-[10px] transition-transform group-open:rotate-90"
            />
            {{ $t("common.technicalDetails") }}
          </summary>
          <p
            class="mt-1 text-xs text-asphalt-muted font-mono break-all leading-relaxed"
          >
            {{ message }}
          </p>
        </details>
        <div
          v-if="retryLabel || $slots.actions"
          class="mt-3 flex items-center gap-3"
        >
          <button
            v-if="retryLabel"
            @click="emit('retry')"
            class="text-sm font-medium text-danger hover:text-danger-hover inline-flex items-center"
          >
            <font-awesome-icon :icon="retryIcon" class="mr-1" />
            {{ retryLabel }}
          </button>
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>
