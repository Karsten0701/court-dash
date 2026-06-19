<script setup>
import { computed } from "vue";
import { formatDate } from "@/utils/formatters.js";
import { t } from "@/i18n";

const props = defineProps({
  game: { type: Object, required: true },
  columns: { type: Number, default: 4 },
});

const gridClass = computed(
  () => `grid grid-cols-2 sm:grid-cols-${props.columns} gap-4`,
);

const items = computed(() => {
  const list = [
    {
      label: t("games.plannedAt"),
      value: formatDate(props.game.plannedAt) || t("common.unknown"),
      show: props.game.status === "planned",
    },
    {
      label: t("games.startedAt"),
      value: formatDate(props.game.startedAt) || t("common.unknown"),
      show: props.game.status !== "planned",
    },
    {
      label: t("games.endedAt"),
      value: formatDate(props.game.endedAt) || t("common.unknown"),
      show: !!props.game.endedAt,
    },
  ];
  if (props.columns >= 3) {
    list.push({
      label: t("games.players"),
      value: props.game.participants?.length ?? 0,
    });
  }
  return list.filter((item) => item.show !== false);
});
</script>

<template>
  <div :class="gridClass">
    <div v-for="item in items" :key="item.label">
      <p class="text-xs text-asphalt-muted mb-1">{{ item.label }}</p>
      <p class="text-sm text-snow font-medium">{{ item.value }}</p>
    </div>
  </div>
</template>
