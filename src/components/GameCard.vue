<script setup>
import { useRouter } from "vue-router";
import { formatDate } from "@/utils/formatters.js";

const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const statusConfig = {
  planned: { label: "Planned", bg: "bg-racket/20", text: "text-racket" },
  started: {
    label: "Started",
    bg: "bg-status-pending/20",
    text: "text-status-pending",
  },
  ended: {
    label: "Ended",
    bg: "bg-status-delivering/20",
    text: "text-status-delivering",
  },
  processed: {
    label: "Ended",
    bg: "bg-status-processed/20",
    text: "text-status-processed",
  },
};

const status = statusConfig[props.game.status] || statusConfig.planned;

const viewDetails = () => {
  router.push(`/details/${props.game.id}`);
};
</script>

<template>
  <div
    class="bg-charcoal rounded-lg border border-asphalt-light cursor-pointer transition-colors duration-150 hover:border-snow-dim"
    @click="viewDetails"
  >
    <div class="p-6">
      <div class="flex items-start justify-between gap-3 mb-3">
        <h3 class="text-xl font-semibold text-snow">{{ game.name }}</h3>
        <span
          class="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="[status.bg, status.text]"
        >
          {{ status.label }}
        </span>
      </div>

      <p class="text-snow-dim text-sm mb-4 leading-relaxed line-clamp-2">
        {{ game.description }}
      </p>

      <div
        class="grid grid-cols-3 gap-2 text-sm border-t border-asphalt-light pt-4"
      >
        <span class="text-snow-dim">
          <font-awesome-icon icon="calendar-days" class="mr-1" />
          {{ formatDate(game.plannedAt) }}
        </span>
        <span class="text-snow-dim text-center">
          {{ game.signupCount ?? 0 }} players
        </span>
        <span class="text-snow-dim text-right">
          <template v-if="game.averageElo != null">
            ~{{ game.averageElo }} ELO
          </template>
          <template v-else>--</template>
        </span>
      </div>
    </div>
  </div>
</template>
