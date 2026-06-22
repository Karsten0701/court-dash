<script setup>
import { computed, onMounted, ref } from "vue";
import authService from "@/services/authService.js";
import orgService from "@/services/orgService.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const paymentMessage = ref("");
const paymentError = ref("");

const isManager = computed(() => authService.isManager());
const org = computed(() => orgService.org.value);
const isInactive = computed(() => orgService.isInactive.value);
const isLoading = computed(() => orgService.loading.value);
const isReactivating = computed(() => orgService.reactivating.value);

const loadOrg = async () => {
  if (!isManager.value) return;
  paymentError.value = "";
  await orgService.loadMyOrg().catch((err) => {
    paymentError.value = err.message || "Could not load organization status.";
  });
};

const reactivateOrg = async () => {
  paymentMessage.value = "";
  paymentError.value = "";

  try {
    const response = await orgService.reactivateMyOrg();
    paymentMessage.value =
      response.payment?.sessionId
        ? `Payment ${response.payment.sessionId} completed. Your organization is active again.`
        : "Payment completed. Your organization is active again.";
  } catch (err) {
    paymentError.value = err.message || "Payment failed. Try again.";
  }
};

onMounted(() => {
  loadOrg();
});
</script>

<template>
  <section v-if="isManager" class="mx-auto max-w-7xl px-4 pt-4 lg:px-8">
    <div
      v-if="isLoading && !org"
      class="glass-card px-4 py-3 text-sm text-snow-dim"
    >
      <LoadingSpinner size="4" />
      <span class="ml-2">Checking organization status...</span>
    </div>

    <div
      v-else-if="isInactive"
      class="rounded-2xl border border-ball/40 bg-ball/10 px-4 py-4 shadow-card"
    >
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-snow">
            {{ org?.name || "Organization" }} is inactive
          </p>
          <p class="mt-1 text-sm leading-6 text-snow-dim">
            Everything is read-only until a manager completes the simulated payment.
          </p>
          <p v-if="paymentMessage" class="mt-2 text-sm font-medium text-turf">
            {{ paymentMessage }}
          </p>
          <p v-if="paymentError" class="mt-2 text-sm font-medium text-danger">
            {{ paymentError }}
          </p>
        </div>
        <button
          type="button"
          class="btn-violet"
          :disabled="isReactivating"
          @click="reactivateOrg"
        >
          <LoadingSpinner v-if="isReactivating" size="4" class="text-white" />
          <font-awesome-icon v-else icon="credit-card" />
          {{ isReactivating ? "Processing payment..." : "Pay to reactivate" }}
        </button>
      </div>
    </div>
  </section>
</template>
