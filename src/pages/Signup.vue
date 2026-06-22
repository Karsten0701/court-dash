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
});
const error = ref("");
const isLoading = ref(false);

const handleSignup = async () => {
  error.value = "";

  const email = formData.value.email.trim();
  const username = formData.value.username.trim();
  const password = formData.value.password;

  if (!email || !password) {
    error.value = "Email and password are required.";
    return;
  }

  if (username && username.length < 3) {
    error.value = "Username must be at least 3 characters.";
    return;
  }

  if (password !== formData.value.confirmPassword) {
    error.value = "Passwords do not match.";
    return;
  }

  if (password.length < 6) {
    error.value = "Password must be at least 6 characters.";
    return;
  }

  isLoading.value = true;

  try {
    await apiService.registerUser({
      email,
      password,
      ...(username ? { username } : {}),
    });

    await authService.login(email, password);

    if (authService.isAdmin()) {
      router.push("/dashboard");
      return;
    }

    router.push({ path: "/", query: { registered: "1" } });
  } catch (err) {
    if (err.status === 409) {
      error.value = "Email or username is already taken.";
    } else if (err.status === 400) {
      error.value =
        err.message || "Invalid information provided. Please check your details.";
    } else if (err.status === 429) {
      error.value = "Rate limited. Please try again later.";
    } else if (err.status === 500) {
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
  <div class="min-h-screen flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-grad shadow-glow"
        >
          <font-awesome-icon icon="user-plus" class="text-2xl text-white" />
        </div>
        <h2 class="text-3xl font-extrabold tracking-tight text-snow">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-snow-dim">
          Register to join court games and appear on the leaderboard.
        </p>
      </div>

      <form class="glass-card space-y-6 p-7" @submit.prevent="handleSignup">
        <div class="space-y-4">
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
            id="username"
            v-model="formData.username"
            label="Username"
            :disabled="isLoading"
            placeholder="Optional — defaults to your email prefix"
          />
          <FormInput
            id="password"
            v-model="formData.password"
            label="Password"
            type="password"
            :required="true"
            :disabled="isLoading"
            placeholder="At least 6 characters"
          />
          <FormInput
            id="confirmPassword"
            v-model="formData.confirmPassword"
            label="Confirm password"
            type="password"
            :required="true"
            :disabled="isLoading"
            placeholder="Repeat your password"
          />
        </div>

        <ErrorMessage
          v-if="error"
          title="Signup failed"
          :message="error"
          :hint="error"
        />

        <button type="submit" :disabled="isLoading" class="btn-violet w-full py-3">
          <LoadingSpinner v-if="isLoading" class="text-white" />
          <font-awesome-icon v-else icon="user-plus" />
          <span>{{ isLoading ? "Creating account..." : "Create account" }}</span>
        </button>

        <p class="text-center text-sm text-snow-dim">
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-racket hover:text-racket-hover"
          >
            Sign in
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>
