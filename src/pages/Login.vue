<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormInput from "@/components/FormInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const router = useRouter();
const route = useRoute();

const activeMode = ref("manager");
const orgs = ref([]);
const orgsError = ref("");
const isLoadingOrgs = ref(false);
const isLoading = ref(false);
const error = ref("");

const managerForm = ref({
  orgId: "",
  email: "",
  password: "",
});

const adminForm = ref({
  email: "",
  password: "",
});

const redirectTo = computed(
  () => route.query.redirect || "/dashboard",
);

const dashboardReason = computed(() => route.query.reason === "dashboard");

const selectedOrg = computed(() =>
  orgs.value.find((org) => String(org.id) === String(managerForm.value.orgId)),
);

const loadOrgs = async () => {
  isLoadingOrgs.value = true;
  orgsError.value = "";

  try {
    const data = await apiService.listOrgs();
    orgs.value = Array.isArray(data) ? data : [];

    const queryOrgId = route.query.orgId;
    if (queryOrgId && orgs.value.some((org) => String(org.id) === String(queryOrgId))) {
      managerForm.value.orgId = String(queryOrgId);
    } else if (!managerForm.value.orgId && orgs.value.length > 0) {
      managerForm.value.orgId = String(orgs.value[0].id);
    }
  } catch (err) {
    orgsError.value = err.message || "Could not load organizations.";
  } finally {
    isLoadingOrgs.value = false;
  }
};

const mapLoginError = (err) => {
  const message = err.message || "";

  if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
    return "Rate limited. Please try again later.";
  }

  if (err.status === 401 || message.includes("Invalid credentials")) {
    return "Invalid email or password.";
  }

  if (err.status === 403) {
    return message || "You do not have access to this dashboard.";
  }

  if (message.includes("Manager access")) {
    return "Manager access is required.";
  }

  if (message.includes("Admin access")) {
    return "Platform admin access is required.";
  }

  return message || "Login failed.";
};

const handleLogin = async () => {
  error.value = "";

  const isManagerMode = activeMode.value === "manager";
  const form = isManagerMode ? managerForm.value : adminForm.value;

  if (!form.email || !form.password || (isManagerMode && !form.orgId)) {
    error.value = "Please fill in all required fields.";
    return;
  }

  isLoading.value = true;

  try {
    if (isManagerMode) {
      await authService.managerLogin({
        orgId: Number(form.orgId),
        email: form.email,
        password: form.password,
      });
    } else {
      await authService.adminLogin({
        email: form.email,
        password: form.password,
      });
    }

    router.push(redirectTo.value);
  } catch (err) {
    error.value = mapLoginError(err);
    console.error("Dashboard login error:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadOrgs();
});
</script>

<template>
  <div class="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-md flex-col">
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-grad shadow-glow"
        >
          <font-awesome-icon icon="table-tennis-paddle-ball" class="text-2xl text-white" />
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-snow">
          Dashboard login
        </h1>
        <p class="mt-2 text-sm text-snow-dim">
          Managers sign in with their organization. Platform admins use the admin tab.
        </p>
        <p class="mt-3 text-sm text-snow-dim">
          New here?
          <router-link to="/pricing" class="font-semibold text-racket hover:text-racket-hover">
            Create an organization
          </router-link>
        </p>
      </div>

      <form class="glass-card space-y-6 p-7" @submit.prevent="handleLogin">
        <div class="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
            :class="activeMode === 'manager'
              ? 'bg-violet-grad text-white shadow-glow-sm'
              : 'text-snow-dim hover:bg-white/5 hover:text-snow'"
            @click="activeMode = 'manager'; error = ''"
          >
            <font-awesome-icon icon="users" />
            Manager
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
            :class="activeMode === 'admin'
              ? 'bg-violet-grad text-white shadow-glow-sm'
              : 'text-snow-dim hover:bg-white/5 hover:text-snow'"
            @click="activeMode = 'admin'; error = ''"
          >
            <font-awesome-icon icon="crown" />
            Platform admin
          </button>
        </div>

        <ErrorMessage
          v-if="dashboardReason"
          title="Access denied"
          message="This area is for managers and platform admins."
          hint="Use the correct login tab and credentials."
        />

        <div class="space-y-4">
          <div v-if="activeMode === 'manager'">
            <label
              for="org"
              class="block text-xs font-semibold uppercase tracking-wide text-snow-dim"
            >
              Organization <span class="text-danger">*</span>
            </label>
            <select
              id="org"
              v-model="managerForm.orgId"
              :disabled="isLoading || isLoadingOrgs"
              required
              class="mt-2 block w-full rounded-xl border border-white/10 bg-asphalt/60 px-4 py-3 text-snow transition-all focus:border-racket focus:outline-none focus:ring-2 focus:ring-racket/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                {{ isLoadingOrgs ? "Loading organizations..." : "Choose organization" }}
              </option>
              <option
                v-for="org in orgs"
                :key="org.id"
                :value="String(org.id)"
              >
                {{ org.name }}{{ org.status === 'inactive' ? ' (read-only)' : '' }}
              </option>
            </select>
            <p v-if="selectedOrg?.status === 'inactive'" class="mt-2 text-xs text-ball">
              This organization is inactive. You can log in read-only or reactivate from the dashboard.
            </p>
            <p v-if="orgsError" class="mt-2 text-xs text-danger">{{ orgsError }}</p>
          </div>

          <FormInput
            v-if="activeMode === 'manager'"
            id="manager-email"
            v-model="managerForm.email"
            label="Email"
            type="email"
            :required="true"
            :disabled="isLoading"
            placeholder="manager@yourclub.com"
          />
          <FormInput
            v-else
            id="admin-email"
            v-model="adminForm.email"
            label="Email"
            type="email"
            :required="true"
            :disabled="isLoading"
            placeholder="admin@kingofcourt.com"
          />

          <FormInput
            v-if="activeMode === 'manager'"
            id="manager-password"
            v-model="managerForm.password"
            label="Password"
            type="password"
            :required="true"
            :disabled="isLoading"
            placeholder="Password"
          />
          <FormInput
            v-else
            id="admin-password"
            v-model="adminForm.password"
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

        <button
          type="submit"
          class="btn-violet w-full py-3"
          :disabled="isLoading || (activeMode === 'manager' && isLoadingOrgs)"
        >
          <LoadingSpinner v-if="isLoading" class="text-white" />
          <font-awesome-icon v-else icon="sign-in-alt" />
          <span>{{ isLoading ? "Signing in..." : "Sign in" }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
