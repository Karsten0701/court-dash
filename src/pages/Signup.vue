<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormInput from "@/components/FormInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import { t } from "@/i18n";

const router = useRouter();
const formData = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone_number: "",
});
const error = ref("");
const isLoading = ref(false);

const handleSignup = async () => {
  error.value = "";

  // Validation
  if (
    !formData.value.username ||
    !formData.value.email ||
    !formData.value.password
  ) {
    error.value = t("auth.requiredFields");
    return;
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = t("auth.passwordsMismatch");
    return;
  }

  if (formData.value.password.length < 6) {
    error.value = t("auth.passwordTooShort");
    return;
  }

  isLoading.value = true;

  try {
    await apiService.registerUser({
      username: formData.value.username,
      email: formData.value.email,
      password: formData.value.password,
      phone_number: formData.value.phone_number,
      role: "user",
    });

    // Clear any existing unpaid orders data for new user
    localStorage.removeItem("hasUnpaidOrders");
    localStorage.removeItem("lastUnpaidOrderCheck");

    // Auto-login with the credentials just used to register
    await authService.login(formData.value.email, formData.value.password);

    router.push("/");
  } catch (err) {
    // Check for different error types
    if (err.message.includes("429") || err.message.includes("rate limit")) {
      error.value = t("auth.rateLimited");
    } else if (err.message.includes("400")) {
      error.value = t("auth.invalidInfo");
    } else if (err.message.includes("500")) {
      error.value = t("errors.generic");
    } else {
      error.value =
        err.message || t("auth.createFailed");
    }
    console.error("Signup error:", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-[calc(100dvh-var(--nav-h))] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-snow">
          {{ $t("auth.signupTitle") }}
        </h2>
        <p class="mt-2 text-center text-sm text-snow-dim">
          {{ $t("auth.signupPrompt") }}
          <router-link
            to="/login"
            class="font-medium text-racket hover:text-racket-hover"
          >
            {{ $t("auth.signIn") }}
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
        <div class="space-y-4">
          <FormInput
            id="username"
            v-model="formData.username"
            :label="$t('auth.name')"
            :required="true"
            :disabled="isLoading"
            :placeholder="$t('auth.name')"
          />
          <FormInput
            id="email"
            v-model="formData.email"
            :label="$t('auth.email')"
            type="email"
            :required="true"
            :disabled="isLoading"
            :placeholder="$t('auth.emailPlaceholder')"
          />
          <FormInput
            id="phone_number"
            v-model="formData.phone_number"
            :label="$t('auth.phoneNumber')"
            type="tel"
            :disabled="isLoading"
            :placeholder="$t('auth.phoneNumber')"
          />
          <FormInput
            id="password"
            v-model="formData.password"
            :label="$t('auth.password')"
            type="password"
            :required="true"
            :disabled="isLoading"
            :placeholder="$t('auth.passwordMinPlaceholder')"
          />
          <FormInput
            id="confirmPassword"
            v-model="formData.confirmPassword"
            :label="$t('auth.confirmPassword')"
            type="password"
            :required="true"
            :disabled="isLoading"
            :placeholder="$t('auth.confirmPasswordPlaceholder')"
          />
        </div>

        <ErrorMessage v-if="error" :title="$t('auth.signupFailed')" :message="error" :hint="error" />

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-violet w-full py-3"
          >
            <LoadingSpinner v-if="isLoading" class="text-white" />
            <font-awesome-icon v-else icon="user-plus" />
            <span>{{ isLoading ? $t("auth.creatingAccount") : $t("auth.signUp") }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
