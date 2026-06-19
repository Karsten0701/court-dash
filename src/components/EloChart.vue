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
import { currentLocale, t } from "@/i18n";

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
  return d.toLocaleDateString(currentLocale.value, {
    month: "short",
    day: "numeric",
  });
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
  gradient.addColorStop(0, "rgba(124, 92, 252, 0.35)");
  gradient.addColorStop(1, "rgba(124, 92, 252, 0)");

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
          borderColor: "#a78bfa",
          backgroundColor: gradient,
          pointBackgroundColor: "#7c5cfc",
          pointBorderColor: "#16131f",
          pointHoverBackgroundColor: "#a78bfa",
          pointHoverBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          backgroundColor: "#211d2e",
          titleColor: "#9b94b8",
          bodyColor: "#f4f3fb",
          borderColor: "rgba(124, 92, 252, 0.4)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              return gameNames[idx] || labels[idx];
            },
            label: (item) => t("chart.tooltipLabel", { elo: item.raw }),
          },
        },
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          border: { display: false },
          ticks: { color: "#9b94b8" },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.04)" },
          border: { display: false },
          ticks: { color: "#9b94b8" },
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

watch(currentLocale, () => {
  destroyChart();
  createChart();
});
</script>

<template>
  <div
    :class="[
      'p-6',
      nested
        ? 'rounded-xl border border-white/5 bg-white/5'
        : 'glass-card',
    ]"
  >
    <div v-if="!nested" class="mb-5 flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-snow-dim">
          {{ $t("chart.currentElo") }}
        </p>
        <p
          class="mt-1 bg-gradient-to-r from-snow to-snow-dim bg-clip-text text-3xl font-extrabold text-transparent"
        >
          {{ eloData.currentElo }}
        </p>
      </div>
      <div
        class="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-soft text-racket"
      >
        <font-awesome-icon icon="chart-line" class="text-xl" />
      </div>
    </div>
    <div v-if="hasHistory()" class="relative h-64">
      <canvas ref="canvas"></canvas>
    </div>
    <div
      v-else
      class="flex items-center justify-center h-64 text-asphalt-muted"
    >
      {{ $t("chart.noHistory") }}
    </div>
  </div>
</template>
