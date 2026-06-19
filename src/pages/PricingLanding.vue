<script setup>
import { computed, ref } from "vue";
import PublicSiteFooter from "@/components/PublicSiteFooter.vue";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";
import { t } from "@/i18n";

const selectedPlan = ref(null);
const checkoutStep = ref("details");
const isProcessing = ref(false);
const checkoutForm = ref({
  name: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
});

const plans = computed(() => [
  {
    id: "club-night",
    name: t("publicPages.clubNight"),
    price: t("publicPages.clubNightPrice"),
    description: t("publicPages.clubNightDescription"),
    items: [
      t("publicPages.playerOverview"),
      t("publicPages.gamePlanning"),
      t("publicPages.manualScoreFlow"),
    ],
  },
  {
    id: "organizer",
    name: t("publicPages.organizer"),
    price: t("publicPages.organizerPrice"),
    description: t("publicPages.organizerDescription"),
    items: [
      t("publicPages.adminRoles"),
      t("publicPages.rankingVisibility"),
      t("publicPages.apiHealthChecks"),
    ],
    highlighted: true,
  },
  {
    id: "venue",
    name: t("publicPages.venue"),
    price: t("publicPages.venuePrice"),
    description: t("publicPages.venueDescription"),
    items: [
      t("publicPages.multipleCourts"),
      t("publicPages.customWorkflows"),
      t("publicPages.setupSupport"),
    ],
  },
]);

const openCheckout = (plan) => {
  selectedPlan.value = plan;
  checkoutStep.value = "details";
  isProcessing.value = false;
};

const closeCheckout = () => {
  selectedPlan.value = null;
  checkoutStep.value = "details";
  isProcessing.value = false;
};

const submitCheckout = () => {
  isProcessing.value = true;
  window.setTimeout(() => {
    isProcessing.value = false;
    checkoutStep.value = "done";
  }, 700);
};
</script>

<template>
  <div class="min-h-screen bg-court px-4 py-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <PublicSiteHeader />

      <main class="py-10 lg:py-14">
        <section class="grid gap-8 rounded-lg border border-asphalt-light bg-charcoal p-6 shadow-card lg:grid-cols-[1fr_0.7fr] lg:items-end lg:p-10">
          <div class="max-w-3xl">
            <p class="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-racket">
              {{ $t("publicPages.pricingBadge") }}
            </p>
            <h1 class="text-4xl font-semibold leading-tight text-snow sm:text-5xl">
              {{ $t("publicPages.pricingTitle") }}
            </h1>
            <p class="mt-5 text-base leading-7 text-snow-dim">
              {{ $t("publicPages.pricingSubtitle") }}
            </p>
          </div>
          <p class="rounded-lg border border-asphalt-light bg-asphalt p-4 text-sm leading-6 text-snow-dim">
            {{ $t("publicPages.pricingNote") }}
          </p>
        </section>

        <section class="mt-10 grid gap-4 lg:grid-cols-3">
          <article
            v-for="plan in plans"
            :key="plan.name"
            class="rounded-lg border p-5"
            :class="plan.highlighted ? 'border-racket bg-charcoal shadow-card' : 'border-asphalt-light bg-charcoal shadow-card'"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-lg font-semibold text-snow">{{ plan.name }}</h2>
                <p class="mt-2 text-sm leading-6 text-snow-dim">{{ plan.description }}</p>
              </div>
              <span
                v-if="plan.highlighted"
                class="rounded-md bg-racket px-3 py-1 text-xs font-semibold text-white"
              >
                {{ $t("publicPages.popular") }}
              </span>
            </div>

            <p class="mt-6 text-4xl font-semibold text-snow">{{ plan.price }}</p>

            <ul class="mt-6 space-y-3">
              <li
                v-for="item in plan.items"
                :key="item"
                class="flex items-center gap-3 text-sm text-snow-dim"
              >
                <font-awesome-icon icon="check" class="text-racket" />
                {{ item }}
              </li>
            </ul>

            <button
              type="button"
              class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium"
              :class="plan.highlighted ? 'bg-racket text-white hover:bg-racket-hover' : 'border border-asphalt-light text-snow hover:bg-asphalt'"
              @click="openCheckout(plan)"
            >
              <font-awesome-icon icon="credit-card" />
              {{ $t("publicPages.checkoutCta") }}
            </button>
          </article>
        </section>
      </main>

      <PublicSiteFooter />
    </div>

    <div
      v-if="selectedPlan"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-court px-4 py-6"
      @click.self="closeCheckout"
    >
      <section class="w-full max-w-lg rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-card">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-racket">
              {{ $t("publicPages.checkoutTitle") }}
            </p>
            <h2 class="mt-2 text-2xl font-semibold text-snow">
              {{ selectedPlan.name }}
            </h2>
            <p class="mt-1 text-sm text-snow-dim">
              {{ $t("publicPages.checkoutSubtitle") }}
            </p>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-md border border-asphalt-light text-snow-dim hover:bg-asphalt hover:text-snow"
            :aria-label="$t('publicPages.closeCheckout')"
            @click="closeCheckout"
          >
            <font-awesome-icon icon="times" />
          </button>
        </div>

        <div class="mt-5 grid grid-cols-3 gap-2 text-xs">
          <div
            class="rounded-md border px-3 py-2"
            :class="checkoutStep === 'details' ? 'border-racket bg-charcoal text-snow' : 'border-asphalt-light text-snow-dim'"
          >
            {{ $t("publicPages.checkoutStepPlan") }}
          </div>
          <div
            class="rounded-md border px-3 py-2"
            :class="checkoutStep === 'details' ? 'border-racket bg-charcoal text-snow' : 'border-asphalt-light text-snow-dim'"
          >
            {{ $t("publicPages.checkoutStepDetails") }}
          </div>
          <div
            class="rounded-md border px-3 py-2"
            :class="checkoutStep === 'done' ? 'border-turf bg-asphalt text-turf' : 'border-asphalt-light text-snow-dim'"
          >
            {{ $t("publicPages.checkoutStepDone") }}
          </div>
        </div>

        <form
          v-if="checkoutStep === 'details'"
          class="mt-5 space-y-4"
          @submit.prevent="submitCheckout"
        >
          <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm text-snow-dim">{{ $t("publicPages.selectedPlan") }}</p>
              <p class="text-lg font-semibold text-snow">{{ selectedPlan.price }}</p>
            </div>
            <p class="mt-1 text-sm font-medium text-snow">{{ selectedPlan.name }}</p>
          </div>

          <div>
            <label for="billing-name" class="block text-xs font-semibold uppercase tracking-wide text-snow-dim">
              {{ $t("publicPages.billingName") }}
            </label>
            <input
              id="billing-name"
              v-model="checkoutForm.name"
              required
              class="mt-2 block w-full rounded-md border border-asphalt-light bg-asphalt px-4 py-3 text-snow placeholder:text-asphalt-muted focus:border-racket focus:outline-none focus:ring-2 focus:ring-racket/30"
              :placeholder="$t('publicPages.billingNamePlaceholder')"
            />
          </div>

          <div>
            <label for="card-number" class="block text-xs font-semibold uppercase tracking-wide text-snow-dim">
              {{ $t("publicPages.cardNumber") }}
            </label>
            <input
              id="card-number"
              v-model="checkoutForm.cardNumber"
              inputmode="numeric"
              required
              class="mt-2 block w-full rounded-md border border-asphalt-light bg-asphalt px-4 py-3 text-snow placeholder:text-asphalt-muted focus:border-racket focus:outline-none focus:ring-2 focus:ring-racket/30"
              :placeholder="$t('publicPages.cardNumberPlaceholder')"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="expiry" class="block text-xs font-semibold uppercase tracking-wide text-snow-dim">
                {{ $t("publicPages.expiry") }}
              </label>
              <input
                id="expiry"
                v-model="checkoutForm.expiry"
                required
                class="mt-2 block w-full rounded-md border border-asphalt-light bg-asphalt px-4 py-3 text-snow placeholder:text-asphalt-muted focus:border-racket focus:outline-none focus:ring-2 focus:ring-racket/30"
                placeholder="12/30"
              />
            </div>
            <div>
              <label for="cvc" class="block text-xs font-semibold uppercase tracking-wide text-snow-dim">
                {{ $t("publicPages.cvc") }}
              </label>
              <input
                id="cvc"
                v-model="checkoutForm.cvc"
                inputmode="numeric"
                required
                class="mt-2 block w-full rounded-md border border-asphalt-light bg-asphalt px-4 py-3 text-snow placeholder:text-asphalt-muted focus:border-racket focus:outline-none focus:ring-2 focus:ring-racket/30"
                placeholder="123"
              />
            </div>
          </div>

          <p class="rounded-md border border-asphalt-light bg-asphalt px-3 py-2 text-xs leading-5 text-snow-dim">
            {{ $t("publicPages.fakeNotice") }}
          </p>

          <button
            type="submit"
            :disabled="isProcessing"
            class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-racket px-4 py-3 text-sm font-semibold text-white hover:bg-racket-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <font-awesome-icon :icon="isProcessing ? 'spinner' : 'credit-card'" :class="{ 'animate-spin': isProcessing }" />
            {{ isProcessing ? $t("publicPages.processingPayment") : $t("publicPages.payNow", { price: selectedPlan.price }) }}
          </button>
        </form>

        <div v-else class="mt-6 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-asphalt text-turf">
            <font-awesome-icon icon="check" />
          </div>
          <h3 class="mt-4 text-xl font-semibold text-snow">
            {{ $t("publicPages.paymentSuccessTitle") }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-snow-dim">
            {{ $t("publicPages.paymentSuccessText", { plan: selectedPlan.name }) }}
          </p>
          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <router-link
              to="/login"
              class="inline-flex items-center justify-center gap-2 rounded-md bg-racket px-4 py-2.5 text-sm font-semibold text-white hover:bg-racket-hover"
              @click="closeCheckout"
            >
              <font-awesome-icon icon="sign-in-alt" />
              {{ $t("publicPages.openDashboard") }}
            </router-link>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-md border border-asphalt-light px-4 py-2.5 text-sm font-medium text-snow hover:bg-asphalt"
              @click="closeCheckout"
            >
              {{ $t("publicPages.chooseAnother") }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
