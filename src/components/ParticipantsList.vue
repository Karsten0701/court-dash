<script setup>
defineProps({
  participants: { type: Array, required: true },
  winnerUserId: { type: Number, default: null },
  showScore: { type: Boolean, default: true },
  displayField: { type: String, default: "score" },
});
</script>

<template>
  <div v-if="participants?.length" class="divide-y divide-asphalt-light">
    <div
      v-for="participant in participants"
      :key="participant.id"
      class="flex items-center justify-between py-3"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-full bg-asphalt-light flex items-center justify-center text-snow text-sm font-semibold uppercase"
        >
          {{ participant.username?.charAt(0) || "?" }}
        </div>
        <span class="text-snow font-medium">{{ participant.username }}</span>
        <span
          v-if="winnerUserId && participant.userId === winnerUserId"
          class="text-xs font-medium text-status-processed bg-status-processed/20 px-2 py-0.5 rounded-full"
        >
          <font-awesome-icon icon="crown" class="mr-1" /> Winner
        </span>
      </div>
      <span
        v-if="showScore && participant[displayField] != null"
        class="text-snow-dim text-sm font-mono"
      >
        <template v-if="displayField === 'elo'">
          <font-awesome-icon icon="chart-line" class="mr-1" />{{
            participant.elo
          }}
          ELO
        </template>
        <template v-else> {{ participant.score }} pts </template>
      </span>
    </div>
  </div>
  <p v-else class="text-sm text-asphalt-muted text-center py-4">
    No players have signed up yet.
  </p>
</template>
