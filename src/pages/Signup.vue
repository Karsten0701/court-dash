<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormInput from "@/components/FormInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

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
    error.value = "Please fill in all required fields";
    return;
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = "Passwords do not match";
    return;
  }

  if (formData.value.password.length < 6) {
    error.value = "Password must be at least 6 characters";
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
      error.value = "Rate limited. Please try again later.";
    } else if (err.message.includes("400")) {
      error.value = "Invalid information provided. Please check your details.";
    } else if (err.message.includes("500")) {
      error.value = "Something went wrong. Please try again later.";
    } else {
      error.value =
        err.message || "Failed to create account. Please try again.";
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
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-snow-dim">
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-racket hover:text-racket-hover"
          >
            Sign in
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
        <div class="space-y-4">
          <FormInput
            id="username"
            v-model="formData.username"
            label="Name"
            :required="true"
            :disabled="isLoading"
            placeholder="Name"
          />
          <FormInput
            id="email"
            v-model="formData.email"
            label="Email"
            type="email"
            :required="true"
            :disabled="isLoading"
            placeholder="Email address"
          />
          <FormInput
            id="phone_number"
            v-model="formData.phone_number"
            label="Phone Number"
            type="tel"
            :disabled="isLoading"
            placeholder="Phone Number"
          />
          <FormInput
            id="password"
            v-model="formData.password"
            label="Password"
            type="password"
            :required="true"
            :disabled="isLoading"
            placeholder="Password (min 6 characters)"
          />
          <FormInput
            id="confirmPassword"
            v-model="formData.confirmPassword"
            label="Confirm Password"
            type="password"
            :required="true"
            :disabled="isLoading"
            placeholder="Confirm Password"
          />
        </div>

        <ErrorMessage v-if="error" title="Signup failed" :message="error" :hint="error" />

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-racket hover:bg-racket-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-racket disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="isLoading" class="text-white" />
            <font-awesome-icon v-else icon="user-plus" />
            <span>{{ isLoading ? "Creating account..." : "Sign up" }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
