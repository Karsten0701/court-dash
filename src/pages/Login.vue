<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormInput from "@/components/FormInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import PublicSiteFooter from "@/components/PublicSiteFooter.vue";
import PublicSiteHeader from "@/components/PublicSiteHeader.vue";
import { t } from "@/i18n";

const router = useRouter();

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

const modes = computed(() => [
  { value: "manager", label: t("auth.managerTab"), icon: "users" },
  { value: "admin", label: t("auth.adminTab"), icon: "crown" },
]);

const modeTitle = computed(() =>
  activeMode.value === "manager"
    ? t("auth.managerLoginTitle")
    : t("auth.adminLoginTitle"),
);

const modeSubtitle = computed(() =>
  activeMode.value === "manager"
    ? t("auth.managerLoginSubtitle")
    : t("auth.adminLoginSubtitle"),
);

const redirectTo = computed(
  () => router.currentRoute.value.query.redirect || "/dashboard",
);

const dashboardReason = computed(
  () => router.currentRoute.value.query.reason === "dashboard",
);

const selectedOrg = computed(() =>
  orgs.value.find((org) => String(org.id) === String(managerForm.value.orgId)),
);

const loadOrgs = async () => {
  isLoadingOrgs.value = true;
  orgsError.value = "";

  try {
    const data = await apiService.listOrgs();
    orgs.value = Array.isArray(data) ? data : [];

    if (!managerForm.value.orgId && orgs.value.length > 0) {
      managerForm.value.orgId = String(orgs.value[0].id);
    }
  } catch (err) {
    orgsError.value = err.message || t("auth.orgLoadFailed");
  } finally {
    isLoadingOrgs.value = false;
  }
};

const mapLoginError = (err) => {
  const message = err.message || "";

  if (message.includes("429") || message.toLowerCase().includes("rate limit")) {
    return t("auth.rateLimited");
  }

  if (err.status === 401 || message.includes("Invalid credentials")) {
    return t("auth.invalidCredentials");
  }

  if (err.status === 403) {
    return message || t("auth.dashboardRequired");
  }

  if (message.includes("Manager access")) {
    return t("auth.managerRequired");
  }

  if (message.includes("Admin access")) {
    return t("auth.adminRequired");
  }

  if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
    return t("auth.networkError");
  }

  return message || t("auth.loginFailed");
};

const handleLogin = async () => {
  error.value = "";

  const isManagerMode = activeMode.value === "manager";
  const form = isManagerMode ? managerForm.value : adminForm.value;

  if (!form.email || !form.password || (isManagerMode && !form.orgId)) {
    error.value = t("auth.requiredFields");
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
  <div class="min-h-screen bg-court px-4 py-6 sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
      <PublicSiteHeader />

      <main class="flex flex-1 items-center py-10 lg:py-14">
        <section class="grid w-full gap-8 lg:grid-cols-[0.9fr_0.72fr] lg:items-center">
          <div class="max-w-3xl">
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-racket">
              {{ $t("auth.loginEyebrow") }}
            </p>
            <h1 class="mt-4 text-4xl font-semibold leading-tight text-snow sm:text-5xl lg:text-6xl">
              {{ $t("auth.dashboardLoginTitle") }}
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-snow-dim sm:text-lg">
              {{ $t("auth.dashboardLoginSubtitle") }}
            </p>

            <div class="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <div class="rounded-lg border border-asphalt-light bg-charcoal p-4">
                <font-awesome-icon icon="table-tennis-paddle-ball" class="text-racket" />
                <p class="mt-3 text-sm font-semibold text-snow">{{ $t("auth.manageGames") }}</p>
                <p class="mt-1 text-xs leading-5 text-asphalt-muted">{{ $t("auth.manageGamesText") }}</p>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-charcoal p-4">
                <font-awesome-icon icon="users" class="text-racket" />
                <p class="mt-3 text-sm font-semibold text-snow">{{ $t("auth.managePlayers") }}</p>
                <p class="mt-1 text-xs leading-5 text-asphalt-muted">{{ $t("auth.managePlayersText") }}</p>
              </div>
              <div class="rounded-lg border border-asphalt-light bg-charcoal p-4">
                <font-awesome-icon icon="server" class="text-racket" />
                <p class="mt-3 text-sm font-semibold text-snow">{{ $t("auth.checkSystem") }}</p>
                <p class="mt-1 text-xs leading-5 text-asphalt-muted">{{ $t("auth.checkSystemText") }}</p>
              </div>
            </div>
          </div>

          <form
            class="rounded-lg border border-asphalt-light bg-charcoal p-5 shadow-card sm:p-6"
            @submit.prevent="handleLogin"
          >
            <div class="grid grid-cols-2 gap-2 rounded-lg border border-asphalt-light bg-asphalt p-1">
              <button
                v-for="mode in modes"
                :key="mode.value"
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition"
                :class="activeMode === mode.value
                  ? 'bg-racket text-white'
                  : 'text-snow-dim hover:bg-charcoal hover:text-snow'"
                @click="activeMode = mode.value; error = ''"
              >
                <font-awesome-icon :icon="mode.icon" />
                {{ mode.label }}
              </button>
            </div>

            <div class="mt-6">
              <p class="text-lg font-semibold text-snow">{{ modeTitle }}</p>
              <p class="mt-1 text-sm leading-6 text-snow-dim">{{ modeSubtitle }}</p>
            </div>

            <ErrorMessage
              v-if="dashboardReason"
              class="mt-5"
              :title="$t('auth.accessDenied')"
              :message="$t('auth.dashboardRequired')"
              :hint="$t('auth.dashboardRequired')"
            />

            <div class="mt-5 space-y-4">
              <div v-if="activeMode === 'manager'">
                <label
                  for="org"
                  class="block text-xs font-semibold uppercase tracking-wide text-snow-dim"
                >
                  {{ $t("auth.organization") }} <span class="text-danger">*</span>
                </label>
                <select
                  id="org"
                  v-model="managerForm.orgId"
                  :disabled="isLoading || isLoadingOrgs"
                  required
                  class="mt-2 block w-full rounded-xl border border-white/10 bg-asphalt/60 px-4 py-3 text-snow transition-all focus:border-racket focus:outline-none focus:ring-2 focus:ring-racket/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    {{ isLoadingOrgs ? $t("auth.loadingOrgs") : $t("auth.chooseOrg") }}
                  </option>
                  <option
                    v-for="org in orgs"
                    :key="org.id"
                    :value="String(org.id)"
                  >
                    {{ org.name }}
                  </option>
                </select>
                <p
                  v-if="selectedOrg?.status === 'inactive'"
                  class="mt-2 text-xs text-ball"
                >
                  {{ $t("auth.orgReadOnly") }}
                </p>
                <p
                  v-if="orgsError"
                  class="mt-2 text-xs text-danger"
                >
                  {{ orgsError }}
                </p>
              </div>

              <FormInput
                v-if="activeMode === 'manager'"
                :id="`${activeMode}-email`"
                v-model="managerForm.email"
                :label="$t('auth.email')"
                type="email"
                :required="true"
                :disabled="isLoading"
                :placeholder="$t('auth.emailPlaceholder')"
              />
              <FormInput
                v-else
                :id="`${activeMode}-email`"
                v-model="adminForm.email"
                :label="$t('auth.email')"
                type="email"
                :required="true"
                :disabled="isLoading"
                :placeholder="$t('auth.emailPlaceholder')"
              />
              <FormInput
                v-if="activeMode === 'manager'"
                :id="`${activeMode}-password`"
                v-model="managerForm.password"
                :label="$t('auth.password')"
                type="password"
                :required="true"
                :disabled="isLoading"
                :placeholder="$t('auth.passwordPlaceholder')"
              />
              <FormInput
                v-else
                :id="`${activeMode}-password`"
                v-model="adminForm.password"
                :label="$t('auth.password')"
                type="password"
                :required="true"
                :disabled="isLoading"
                :placeholder="$t('auth.passwordPlaceholder')"
              />
            </div>

            <ErrorMessage
              v-if="error"
              class="mt-5"
              :title="$t('auth.loginFailed')"
              :message="error"
              :hint="error"
            />

            <button
              type="submit"
              :disabled="isLoading || (activeMode === 'manager' && isLoadingOrgs)"
              class="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-racket px-4 py-3 text-sm font-semibold text-white hover:bg-racket-hover focus:outline-none focus:ring-2 focus:ring-racket disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LoadingSpinner v-if="isLoading" class="text-white" />
              <font-awesome-icon v-else icon="sign-in-alt" />
              <span>{{ isLoading ? $t("auth.signingIn") : $t("auth.signIn") }}</span>
            </button>
          </form>
        </section>
      </main>

      <PublicSiteFooter />
    </div>
  </div>
</template>
