<script setup>
import { computed } from 'vue'

const emit = defineEmits(['player-click'])

const props = defineProps({
  participants: { type: Array, required: true },
  winnerUserId: { type: Number, default: null },
  valueField: { type: String, default: 'score' },
  valueLabel: { type: String, default: 'pts' },
  title: { type: String, default: 'Players' },
  emptyText: { type: String, default: 'No players yet.' },
  showRank: { type: Boolean, default: true },
  clickable: { type: Boolean, default: false },
})

const sortedParticipants = computed(() => {
  const field = props.valueField
  return [...props.participants].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1
    return bVal - aVal
  })
})
</script>

<template>
  <div>
    <p v-if="!sortedParticipants.length" class="text-sm text-asphalt-muted text-center py-4">
      {{ emptyText }}
    </p>

    <div v-else class="divide-y divide-asphalt-light">
      <component
        :is="clickable ? 'button' : 'div'"
        v-for="(participant, index) in sortedParticipants"
        :key="participant.userId"
        class="flex items-center gap-3 py-3 w-full text-left"
        :class="clickable ? 'hover:bg-asphalt-light rounded transition-colors cursor-pointer px-2 -mx-2' : ''"
        v-bind="clickable ? { type: 'button' } : {}"
        @click="clickable && emit('player-click', participant.userId)"
      >
        <!-- Rank number -->
        <span
          v-if="showRank"
          class="w-6 text-sm font-medium text-center"
          :class="index === 0 ? 'text-ball' : 'text-snow-dim'"
        >
          {{ index + 1 }}
        </span>

        <!-- Avatar circle -->
        <div class="w-8 h-8 rounded-full bg-asphalt-light flex items-center justify-center text-snow text-sm font-semibold uppercase shrink-0">
          {{ participant.username?.charAt(0) || '?' }}
        </div>

        <!-- Name + winner indicator -->
        <span class="flex items-center gap-2 flex-1 min-w-0">
          <span
            class="text-sm truncate"
            :class="participant.userId === winnerUserId ? 'text-snow font-semibold' : 'text-snow font-medium'"
          >
            {{ participant.username }}
          </span>
          <font-awesome-icon
            v-if="participant.userId === winnerUserId"
            icon="trophy"
            class="text-ball text-xs shrink-0"
          />
        </span>

        <!-- Value -->
        <span class="text-sm text-snow-dim shrink-0">
          <font-awesome-icon v-if="valueField === 'elo'" icon="chart-line" class="mr-1" />
          <font-awesome-icon v-else-if="valueField === 'score'" icon="star" class="mr-1" />
          {{ participant[valueField] ?? '--' }} {{ valueLabel }}
        </span>
      </component>
    </div>
  </div>
</template>
