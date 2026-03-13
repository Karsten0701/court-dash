import { ref } from "vue";

/**
 * Generic API request composable with loading, error, retry, and timing.
 *
 * @param {Function} requestFn - Function that returns a Promise.
 * @param {Object} options
 * @param {boolean} [options.immediate=true] - Execute on creation.
 * @param {number} [options.maxRetries=0] - Number of retry attempts on failure.
 * @param {number} [options.retryDelay=400] - Delay between retries in ms.
 */
export function useApiRequest(requestFn, options = {}) {
  const {
    immediate = true,
    maxRetries = 0,
    retryDelay = 400,
  } = options;

  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const isRetrying = ref(false);
  const lastDurationMs = ref(null);

  const execute = async (...args) => {
    loading.value = true;
    error.value = null;
    isRetrying.value = false;

    let attempt = 0;
    const startedAt = performance.now();

    while (true) {
      try {
        const result = await requestFn(...args);
        lastDurationMs.value = performance.now() - startedAt;
        data.value = result;
        loading.value = false;
        return result;
      } catch (err) {
        if (attempt >= maxRetries) {
          lastDurationMs.value = performance.now() - startedAt;
          error.value = err;
          loading.value = false;
          throw err;
        }

        attempt += 1;
        isRetrying.value = true;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  };

  if (immediate) {
    // Fire and forget; errors are surfaced via state.
    execute().catch(() => {});
  }

  return {
    data,
    loading,
    error,
    isRetrying,
    lastDurationMs,
    execute,
    refresh: () => execute(),
  };
}

