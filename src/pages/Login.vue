<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormInput from "@/components/FormInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = "Please enter both email and password";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    await authService.login(email.value, password.value);

    // Trigger unpaid orders check
    localStorage.removeItem("lastUnpaidOrderCheck");
    window.dispatchEvent(new Event("unpaidOrdersUpdated"));

    // Redirect to the page they tried to access or home
    const redirectTo = router.currentRoute.value.query.redirect || "/";
    router.push(redirectTo);
  } catch (err) {
    // Check for different error types
    if (err.message.includes("429") || err.message.includes("rate limit")) {
      error.value = "Rate limited. Please try again later.";
    } else if (
      err.message.includes("401") ||
      err.message.includes("Invalid credentials")
    ) {
      error.value = "Invalid email or password. Please try again.";
    } else if (err.message.includes("500")) {
      error.value = "Something went wrong. Please try again later.";
    } else if (
      err.message.includes("Failed to fetch") ||
      err.message.includes("NetworkError")
    ) {
      error.value = err.message || "Login failed. Please try again.";
    } else {
      error.value = err.message || "Login failed. Please try again.";
    }
    console.error("Login error:", err);
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
          Sign in to your account
        </h2>
      </div>

      <form class="mt-4 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <FormInput
            id="email"
            v-model="email"
            label="Email"
            type="email"
            :required="true"
            :disabled="isLoading"
            placeholder="Email address"
          />
          <FormInput
            id="password"
            v-model="password"
            label="Password"
            type="password"
            :required="true"
            :disabled="isLoading"
            placeholder="Password"
          />
        </div>

        <ErrorMessage
          v-if="error"
          title="Login failed"
          :message="error"
          :hint="error"
        />

        <div class="space-y-3">
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-racket hover:bg-racket-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-racket disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="isLoading" class="text-white" />
            <font-awesome-icon v-else icon="sign-in-alt" />
            <span>{{ isLoading ? "Signing in..." : "Sign in" }}</span>
          </button>

          <p class="text-center text-sm text-snow-dim">
            Or
            <router-link
              to="/signup"
              class="font-medium text-racket hover:text-racket-hover"
            >
              create a new account
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
