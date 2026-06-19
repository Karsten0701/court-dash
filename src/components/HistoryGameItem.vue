<script setup>
import { formatDate } from "@/utils/formatters.js";
import { t } from "@/i18n";

const props = defineProps({
  game: { type: Object, required: true },
  currentUserId: { type: Number, default: null },
});

const emit = defineEmits(["navigate"]);

const statusConfig = {
  started: {
    labelKey: "status.started",
    bg: "bg-status-pending/20",
    text: "text-status-pending",
  },
  ended: {
    labelKey: "status.ended",
    bg: "bg-status-delivering/20",
    text: "text-status-delivering",
  },
  processed: {
    labelKey: "status.processed",
    bg: "bg-status-processed/20",
    text: "text-status-processed",
  },
};

const status =
  statusConfig[props.game.status?.toLowerCase()] || statusConfig.started;
</script>

<template>
  <div
    class="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-charcoal/70 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-racket/40 hover:shadow-glow"
    @click="emit('navigate', game.id)"
  >
    <div class="p-6">
      <div class="flex items-start justify-between gap-3 mb-3">
        <h3 class="text-xl font-semibold text-snow">{{ game.name }}</h3>
        <span
          class="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium"
          :class="[status.bg, status.text]"
        >
          {{ t(status.labelKey) }}
        </span>
      </div>

      <p
        v-if="game.description"
        class="text-snow-dim text-sm mb-4 leading-relaxed line-clamp-2"
      >
        {{ game.description }}
      </p>

      <div
        class="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-sm"
      >
        <span class="text-snow-dim">
          <font-awesome-icon icon="calendar-days" class="mr-1" />
          {{ formatDate(game.startedAt) || $t("common.unknown") }}
        </span>
        <span class="text-snow-dim text-center">
          <template v-if="game.userScore != null">
            {{ $t("games.yourScore", { score: game.userScore }) }}
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
              {{ game.winnerUserId === currentUserId ? $t("common.win") : $t("common.loss") }}
            </span>
          </template>
          <template v-else>--</template>
        </span>
      </div>
    </div>
  </div>
</template>
