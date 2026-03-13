import { ref, watch } from "vue";

/**
 * Smoothly animates a numeric ref or computed value.
 *
 * @param {import('vue').Ref<number> | import('vue').ComputedRef<number>} source
 * @param {Object} options
 * @param {number} [options.duration=500] - Duration in ms
 */
export function useAnimatedNumber(source, { duration = 500 } = {}) {
  const animated = ref(0);

  let frame;

  const animateTo = (target) => {
    const start = animated.value || 0;
    const change = target - start;
    if (change === 0) return;

    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      animated.value = Math.round(start + change * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(step);
  };

  watch(
    source,
    (value) => {
      const next = typeof value === "number" && !Number.isNaN(value) ? value : 0;
      animateTo(next);
    },
    { immediate: true },
  );

  return animated;
}

