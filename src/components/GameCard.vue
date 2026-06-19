<script setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { formatDate } from "@/utils/formatters.js";
import { t } from "@/i18n";

const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

const statusConfig = {
  planned: {
    labelKey: "status.planned",
    bg: "bg-racket/15",
    text: "text-racket",
    ring: "ring-racket/30",
  },
  started: {
    labelKey: "status.live",
    bg: "bg-status-pending/15",
    text: "text-status-pending",
    ring: "ring-status-pending/30",
  },
  ended: {
    labelKey: "status.ended",
    bg: "bg-status-delivering/15",
    text: "text-status-delivering",
    ring: "ring-status-delivering/30",
  },
  processed: {
    labelKey: "status.processed",
    bg: "bg-status-processed/15",
    text: "text-status-processed",
    ring: "ring-status-processed/30",
  },
};

const status = computed(() => statusConfig[props.game.status] || statusConfig.planned);

const viewDetails = () => {
  router.push(`/details/${props.game.id}`);
};
</script>

<template>
  <div
    class="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-charcoal/70 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-racket/40 hover:shadow-glow"
    @click="viewDetails"
  >
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-racket/20 blur-3xl transition-opacity duration-300 group-hover:opacity-100 opacity-60"
    ></div>

    <div class="relative p-6">
      <div class="flex items-start justify-between gap-3 mb-3">
        <h3 class="text-xl font-bold text-snow">{{ game.name }}</h3>
        <span
          class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
          :class="[status.bg, status.text, status.ring]"
        >
          {{ t(status.labelKey) }}
        </span>
      </div>

      <p class="text-snow-dim text-sm mb-5 leading-relaxed line-clamp-2">
        {{ game.description }}
      </p>

      <div class="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-sm">
        <div class="min-w-0">
          <p class="text-[11px] uppercase tracking-wide text-asphalt-muted">
            {{ $t("games.date") }}
          </p>
          <p class="mt-0.5 truncate font-medium text-snow">
            <font-awesome-icon icon="calendar-days" class="mr-1 text-racket" />
            {{ formatDate(game.plannedAt) }}
          </p>
        </div>
        <div class="min-w-0 text-center">
          <p class="text-[11px] uppercase tracking-wide text-asphalt-muted">
            {{ $t("games.players") }}
          </p>
          <p class="mt-0.5 font-semibold text-snow">
            {{ game.signupCount ?? 0 }}
          </p>
        </div>
        <div class="min-w-0 text-right">
          <p class="text-[11px] uppercase tracking-wide text-asphalt-muted">
            {{ $t("games.avgElo") }}
          </p>
          <p class="mt-0.5 font-semibold text-snow">
            <template v-if="game.averageElo != null">
              ~{{ game.averageElo }}
            </template>
            <template v-else>--</template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
