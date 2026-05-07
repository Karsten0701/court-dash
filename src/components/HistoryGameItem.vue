<script setup>
import { formatDate } from "@/utils/formatters.js";

const props = defineProps({
  game: { type: Object, required: true },
  currentUserId: { type: Number, default: null },
});

const emit = defineEmits(["navigate"]);

const statusConfig = {
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
    label: "Processed",
    bg: "bg-status-processed/20",
    text: "text-status-processed",
  },
};

const status =
  statusConfig[props.game.status?.toLowerCase()] || statusConfig.started;
</script>

<template>
  <div
    class="bg-charcoal rounded-lg border border-asphalt-light cursor-pointer transition-colors duration-150 hover:border-snow-dim"
    @click="emit('navigate', game.id)"
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

      <p
        v-if="game.description"
        class="text-snow-dim text-sm mb-4 leading-relaxed line-clamp-2"
      >
        {{ game.description }}
      </p>

      <div
        class="grid grid-cols-3 gap-2 text-sm border-t border-asphalt-light pt-4"
      >
        <span class="text-snow-dim">
          <font-awesome-icon icon="calendar-days" class="mr-1" />
          {{ formatDate(game.startedAt) || "Unknown" }}
        </span>
        <span class="text-snow-dim text-center">
          <template v-if="game.userScore != null">
            Your score: {{ game.userScore }}
          </template>
          <template v-else>--</template>
        </span>
        <span class="text-snow-dim text-right">
          <template v-if="game.winnerUserId && currentUserId">
            <span
              :class="
                game.winnerUserId === currentUserId
                  ? 'text-status-processed'
                  : 'text-danger'
              "
            >
              {{ game.winnerUserId === currentUserId ? "Win" : "Loss" }}
            </span>
          </template>
          <template v-else>--</template>
        </span>
      </div>
    </div>
  </div>
</template>
