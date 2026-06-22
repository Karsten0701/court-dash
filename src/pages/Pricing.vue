<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormInput from "@/components/FormInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const router = useRouter();

const selectedPlan = ref(null);
const checkoutStep = ref("details");
const isProcessing = ref(false);
const error = ref("");
const createdOrg = ref(null);

const accentPresets = ["#7c5cfc", "#1E88E5", "#34d399", "#fbbf24", "#fb7185", "#a855f7"];

const orgForm = ref({
  name: "",
  accentColor: "#7c5cfc",
  managerEmail: "",
  managerPassword: "",
  confirmPassword: "",
});

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "€49 / mo",
    description: "One court group, leaderboard, and game management.",
    items: ["Up to 50 players", "ELO rankings", "Game scheduling"],
  },
  {
    id: "club",
    name: "Club",
    price: "€49 / mo",
    description: "Everything you need to run a weekly court ladder.",
    items: ["Unlimited games", "Manager dashboard", "Player history"],
    highlighted: true,
  },
  {
    id: "venue",
    name: "Venue",
    price: "€49 / mo",
    description: "Multiple managers, same org branding.",
    items: ["Org branding", "Manager accounts", "Read-only inactive mode"],
  },
];

const isHexColor = (value) => /^#[0-9A-Fa-f]{6}$/.test(value);

const canSubmitDetails = computed(
  () =>
    orgForm.value.name.trim() &&
    isHexColor(orgForm.value.accentColor) &&
    orgForm.value.managerEmail.trim() &&
    orgForm.value.managerPassword.length >= 6 &&
    orgForm.value.managerPassword === orgForm.value.confirmPassword,
);

const openCheckout = (plan) => {
  selectedPlan.value = plan;
  checkoutStep.value = "details";
  error.value = "";
  createdOrg.value = null;
};

const closeCheckout = () => {
  selectedPlan.value = null;
  checkoutStep.value = "details";
  isProcessing.value = false;
  error.value = "";
  createdOrg.value = null;
  orgForm.value = {
    name: "",
    accentColor: "#7c5cfc",
    managerEmail: "",
    managerPassword: "",
    confirmPassword: "",
  };
};

const submitDetails = () => {
  error.value = "";

  if (!isHexColor(orgForm.value.accentColor)) {
    error.value = "Accent color must be a hex value like #7c5cfc.";
    return;
  }

  if (orgForm.value.managerPassword !== orgForm.value.confirmPassword) {
    error.value = "Passwords do not match.";
    return;
  }

  if (orgForm.value.managerPassword.length < 6) {
    error.value = "Manager password must be at least 6 characters.";
    return;
  }

  checkoutStep.value = "payment";
};

const completeSignup = async () => {
  if (!selectedPlan.value) return;

  error.value = "";
  isProcessing.value = true;

  try {
    const createResponse = await apiService.createOrg({
      name: orgForm.value.name.trim(),
      accentColor: orgForm.value.accentColor,
      managerEmail: orgForm.value.managerEmail.trim(),
      managerPassword: orgForm.value.managerPassword,
    });

    const org = createResponse.org;
    const sessionId = createResponse.payment?.sessionId;

    if (!org?.id || !sessionId) {
      throw new Error("Organization was created but payment session is missing.");
    }

    const paymentResponse = await apiService.simulateOrgPayment(org.id, sessionId);

    createdOrg.value = paymentResponse.org || org;
    checkoutStep.value = "done";
  } catch (err) {
    error.value = err.message || "Could not create organization. Try again.";
  } finally {
    isProcessing.value = false;
  }
};

const goToLogin = () => {
  closeCheckout();
  router.push({
    name: "Login",
    query: createdOrg.value?.id
      ? { orgId: String(createdOrg.value.id) }
      : undefined,
  });
};
</script>

<template>
  <div class="px-4 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-16">
    <div class="mx-auto max-w-6xl">
      <span
        class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-snow-dim"
      >
        <font-awesome-icon icon="credit-card" class="text-racket" />
        Plans & pricing
      </span>

      <h1
        class="mt-4 bg-gradient-to-r from-snow to-snow-dim bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl"
      >
        Start your organization
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-relaxed text-snow-dim sm:text-base">
        Pick a plan, create your org and manager account, then activate with a simulated
        payment — exactly as described in the API.
      </p>

      <section class="mt-10 grid gap-4 lg:grid-cols-3">
        <article
          v-for="plan in plans"
          :key="plan.id"
          class="glass-card p-6"
          :class="plan.highlighted ? 'ring-1 ring-racket/40 shadow-glow' : ''"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-snow">{{ plan.name }}</h2>
              <p class="mt-2 text-sm leading-relaxed text-snow-dim">
                {{ plan.description }}
              </p>
            </div>
            <span
              v-if="plan.highlighted"
              class="rounded-full bg-violet-grad px-3 py-1 text-xs font-semibold text-white"
            >
              Popular
            </span>
          </div>

          <p class="mt-6 text-3xl font-extrabold text-snow">{{ plan.price }}</p>

          <ul class="mt-6 space-y-2">
            <li
              v-for="item in plan.items"
              :key="item"
              class="flex items-center gap-2 text-sm text-snow-dim"
            >
              <font-awesome-icon icon="check" class="text-racket" />
              {{ item }}
            </li>
          </ul>

          <button type="button" class="btn-violet mt-6 w-full" @click="openCheckout(plan)">
            Get started
          </button>
        </article>
      </section>
    </div>

    <div
      v-if="selectedPlan"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-court/80 px-4 py-6 backdrop-blur-sm"
      @click.self="closeCheckout"
    >
      <section class="glass-card w-full max-w-lg p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-snow-dim">
              {{ selectedPlan.name }} plan
            </p>
            <h2 class="mt-1 text-2xl font-bold text-snow">Create organization</h2>
            <p class="mt-1 text-sm text-snow-dim">
              Step
              {{
                checkoutStep === "details"
                  ? "1"
                  : checkoutStep === "payment"
                    ? "2"
                    : "3"
              }}
              of 3
            </p>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-snow-dim hover:bg-white/5 hover:text-snow"
            aria-label="Close"
            @click="closeCheckout"
          >
            <font-awesome-icon icon="times" />
          </button>
        </div>

        <form
          v-if="checkoutStep === 'details'"
          class="mt-6 space-y-4"
          @submit.prevent="submitDetails"
        >
          <FormInput
            id="org-name"
            v-model="orgForm.name"
            label="Organization name"
            :required="true"
            placeholder="Downtown Padel Club"
          />

          <div>
            <label
              for="org-accent-text"
              class="block text-xs font-semibold uppercase tracking-wide text-snow-dim"
            >
              Accent color <span class="text-danger">*</span>
            </label>
            <div
              class="mt-2 flex min-h-[3.25rem] flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-asphalt/60 px-3 py-2 focus-within:border-racket focus-within:ring-2 focus-within:ring-racket/30"
            >
              <input
                id="org-accent"
                v-model="orgForm.accentColor"
                type="color"
                class="h-10 w-12 cursor-pointer rounded-md border border-white/10 bg-transparent"
              />
              <input
                id="org-accent-text"
                v-model="orgForm.accentColor"
                type="text"
                required
                pattern="#[0-9A-Fa-f]{6}"
                class="min-w-0 flex-1 bg-transparent text-sm text-snow outline-none"
                placeholder="#7c5cfc"
              />
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="color in accentPresets"
                :key="color"
                type="button"
                class="h-7 w-7 rounded-full border border-white/20"
                :style="{ backgroundColor: color }"
                :aria-label="`Use ${color}`"
                @click="orgForm.accentColor = color"
              />
            </div>
          </div>

          <FormInput
            id="manager-email"
            v-model="orgForm.managerEmail"
            label="Manager email"
            type="email"
            :required="true"
            placeholder="owner@yourclub.com"
          />
          <FormInput
            id="manager-password"
            v-model="orgForm.managerPassword"
            label="Manager password"
            type="password"
            :required="true"
            placeholder="Min. 6 characters"
          />
          <FormInput
            id="manager-confirm"
            v-model="orgForm.confirmPassword"
            label="Confirm password"
            type="password"
            :required="true"
            placeholder="Repeat password"
          />

          <ErrorMessage
            v-if="error"
            title="Validation error"
            :message="error"
            :hint="error"
          />

          <button type="submit" class="btn-violet w-full py-3" :disabled="!canSubmitDetails">
            Continue to payment
          </button>
        </form>

        <div v-else-if="checkoutStep === 'payment'" class="mt-6 space-y-4">
          <div class="rounded-xl border border-white/5 bg-white/5 p-4 text-sm">
            <p class="text-snow-dim">Organization</p>
            <p class="mt-1 font-semibold text-snow">{{ orgForm.name }}</p>
            <p class="mt-3 text-snow-dim">Manager</p>
            <p class="mt-1 font-medium text-snow">{{ orgForm.managerEmail }}</p>
            <p class="mt-3 text-snow-dim">Plan</p>
            <p class="mt-1 font-medium text-snow">{{ selectedPlan.name }} — {{ selectedPlan.price }}</p>
          </div>

          <p class="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-snow-dim">
            No real charge. This calls
            <span class="font-mono text-snow">POST /api/orgs</span>
            and then
            <span class="font-mono text-snow">POST /api/orgs/:id/payment/simulate</span>
            as documented in API.md.
          </p>

          <ErrorMessage
            v-if="error"
            title="Signup failed"
            :message="error"
            :hint="error"
          />

          <div class="flex gap-3">
            <button type="button" class="btn-glass" @click="checkoutStep = 'details'">
              Back
            </button>
            <button
              type="button"
              class="btn-violet flex-1 py-3"
              :disabled="isProcessing"
              @click="completeSignup"
            >
              <LoadingSpinner v-if="isProcessing" class="text-white" />
              <font-awesome-icon v-else icon="credit-card" />
              {{ isProcessing ? "Creating org..." : "Pay & activate" }}
            </button>
          </div>
        </div>

        <div v-else class="mt-6 text-center">
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-grad text-white shadow-glow"
          >
            <font-awesome-icon icon="check" class="text-xl" />
          </div>
          <h3 class="mt-4 text-xl font-bold text-snow">Organization is active</h3>
          <p class="mt-2 text-sm leading-relaxed text-snow-dim">
            <strong class="text-snow">{{ createdOrg?.name || orgForm.name }}</strong>
            is ready. Log in as manager with the email and password you just set.
          </p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" class="btn-violet" @click="goToLogin">
              <font-awesome-icon icon="sign-in-alt" />
              Log in to dashboard
            </button>
            <button type="button" class="btn-glass" @click="closeCheckout">
              Close
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
