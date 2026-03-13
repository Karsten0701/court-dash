<script setup>
import { computed } from "vue";
import { formatDate } from "@/utils/formatters.js";

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
      label: "Planned At",
      value: formatDate(props.game.plannedAt) || "Unknown",
      show: props.game.status === "planned",
    },
    {
      label: "Started At",
      value: formatDate(props.game.startedAt) || "Unknown",
      show: props.game.status !== "planned",
    },
    {
      label: "Ended At",
      value: formatDate(props.game.endedAt) || "Unknown",
      show: !!props.game.endedAt,
    },
  ];
  if (props.columns >= 3) {
    list.push({
      label: "Players",
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
