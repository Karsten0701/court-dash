<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
);

const props = defineProps({
  eloData: { type: Object, required: true },
  nested: { type: Boolean, default: false },
});

const canvas = ref(null);
let chart = null;

const hasHistory = () =>
  props.eloData?.history && props.eloData.history.length > 0;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const createChart = () => {
  if (!canvas.value || !hasHistory()) return;

  const ctx = canvas.value.getContext("2d");
  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    canvas.value.clientHeight || 300,
  );
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.12)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

  const labels = props.eloData.history.map((h) => formatDate(h.recordedAt));
  const data = props.eloData.history.map((h) => h.elo);
  const gameNames = props.eloData.history.map((h) => h.gameName);

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data,
          borderColor: "#3b82f6",
          backgroundColor: gradient,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#3b82f6",
          pointHoverBackgroundColor: "#2563eb",
          pointHoverBorderColor: "#2563eb",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          backgroundColor: "#1e1e1e",
          titleColor: "#9ca3af",
          bodyColor: "#f0f0f0",
          borderColor: "#2e2e2e",
          borderWidth: 1,
          padding: 10,
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              return gameNames[idx] || labels[idx];
            },
            label: (item) => `ELO: ${item.raw}`,
          },
        },
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { color: "#2e2e2e" },
          ticks: { color: "#9ca3af" },
        },
        y: {
          grid: { color: "#2e2e2e" },
          ticks: { color: "#9ca3af" },
        },
      },
    },
  });
};

const destroyChart = () => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
};

onMounted(() => createChart());
onBeforeUnmount(() => destroyChart());

watch(
  () => props.eloData,
  () => {
    destroyChart();
    createChart();
  },
  { deep: true },
);
</script>

<template>
  <div :class="['rounded-lg p-6', nested ? 'bg-asphalt' : 'bg-charcoal']">
    <h2 v-if="!nested" class="text-lg font-semibold text-snow mb-4">
      Current ELO: {{ eloData.currentElo }}
    </h2>
    <div v-if="hasHistory()" class="relative h-64">
      <canvas ref="canvas"></canvas>
    </div>
    <div
      v-else
      class="flex items-center justify-center h-64 text-asphalt-muted"
    >
      No ELO history yet
    </div>
  </div>
</template>
