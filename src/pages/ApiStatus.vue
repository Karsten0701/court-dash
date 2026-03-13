<script setup>
import statusService from "@/services/statusService.js";
import { useApiRequest } from "@/composables/useApiRequest.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

const {
  data: health,
  loading,
  error,
  lastDurationMs,
  refresh,
} = useApiRequest(() => statusService.getApiHealth(), {
  immediate: true,
  maxRetries: 1,
});
</script>

<template>
  <section class="space-y-5">
    <div>
      <p class="text-xs uppercase tracking-wide text-asphalt-muted">
        API Status
      </p>
      <p class="text-sm text-snow-dim">
        Live health information for the court-api backend.
      </p>
    </div>

    <div class="bg-charcoal rounded-xl border border-asphalt-light p-4 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-asphalt-muted">
            Health endpoint
          </p>
          <p class="text-sm text-snow">
            /api/health
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded bg-asphalt px-3 py-2 text-xs text-snow hover:bg-asphalt-light"
          @click="refresh"
        >
          <font-awesome-icon icon="arrow-rotate-right" />
          Refresh
        </button>
      </div>

      <div v-if="loading" class="flex items-center gap-3 text-sm text-snow-dim">
        <LoadingSpinner size="5" />
        <span>Checking API health…</span>
      </div>

      <ErrorMessage
        v-else-if="error"
        :title="'Health check failed'"
        :message="error.message"
        hint="The backend did not respond as expected."
        retry-label="Retry"
        @retry="refresh"
      />

      <div v-else-if="health" class="space-y-2 text-sm text-snow-dim">
        <p>
          <span class="text-asphalt-muted">Status:</span>
          <span
            class="ml-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
            :class="health.ok ? 'bg-turf/20 text-turf' : 'bg-danger-surface text-danger'"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="health.ok ? 'bg-turf' : 'bg-danger'"
            />
            {{ health.payload?.status || (health.ok ? 'healthy' : 'unhealthy') }}
          </span>
        </p>
        <p v-if="lastDurationMs != null">
          <span class="text-asphalt-muted">Response time:</span>
          <span class="ml-2 font-mono">
            ~{{ Math.round(lastDurationMs) }}ms
          </span>
        </p>
        <p v-if="health.payload?.database">
          <span class="text-asphalt-muted">Database:</span>
          <span class="ml-2 font-mono">
            {{ health.payload.database }}
          </span>
        </p>
        <p v-if="health.payload?.timestamp">
          <span class="text-asphalt-muted">Timestamp:</span>
          <span class="ml-2 font-mono">
            {{ health.payload.timestamp }}
          </span>
        </p>
      </div>

      <p class="text-xs text-asphalt-muted">
        This view is intended for quick troubleshooting and monitoring. For more
        detail, use API testing tools against the documented endpoints.
      </p>
    </div>
  </section>
</template>

