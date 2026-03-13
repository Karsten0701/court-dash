<script setup>
import { computed } from "vue";

const props = defineProps({
  participants: {
    type: Array,
    required: true,
  },
  winnerUserId: {
    type: Number,
    default: null,
  },
});

const sortedParticipants = computed(() => {
  if (!props.participants) return [];
  return [...props.participants].sort((a, b) => b.score - a.score);
});
</script>

<template>
  <div class="bg-charcoal rounded-lg p-6">
    <h2 class="text-lg font-semibold text-snow mb-4">Scoreboard</h2>

    <div
      v-if="sortedParticipants.length === 0"
      class="text-sm text-asphalt-muted text-center py-4"
    >
      No participants recorded.
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-asphalt-light">
            <th class="pb-3 text-xs text-asphalt-muted w-16">#</th>
            <th class="pb-3 text-xs text-asphalt-muted">Player</th>
            <th class="pb-3 text-xs text-asphalt-muted text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(participant, index) in sortedParticipants"
            :key="participant.id"
            class="border-b border-asphalt-light last:border-b-0"
          >
            <td class="py-3 w-16">
              <span
                class="text-sm font-medium"
                :class="index === 0 ? 'text-ball' : 'text-snow-dim'"
              >
                {{ index + 1 }}
              </span>
            </td>
            <td class="py-3">
              <span class="flex items-center gap-2">
                <span
                  :class="
                    participant.userId === winnerUserId
                      ? 'text-snow font-semibold'
                      : 'text-snow font-medium'
                  "
                  class="text-sm"
                >
                  {{ participant.username }}
                </span>
                <font-awesome-icon
                  v-if="participant.userId === winnerUserId"
                  icon="trophy"
                  class="text-ball text-xs"
                />
              </span>
            </td>
            <td class="py-3 text-sm text-snow text-right font-medium">
              {{ participant.score ?? '--' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
