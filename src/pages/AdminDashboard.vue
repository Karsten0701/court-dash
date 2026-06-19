<script setup>
import { computed, onMounted, ref } from "vue";
import adminService from "@/services/adminService.js";
import authService from "@/services/authService.js";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import FormInput from "@/components/FormInput.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const orgs = ref([]);
const admins = ref([]);
const managers = ref([]);
const selectedOrg = ref(null);
const selectedOrgId = ref("");
const loading = ref(false);
const loadingDetail = ref(false);
const error = ref(null);
const toast = ref(null);
const actionLoading = ref("");
const editingManagerId = ref(null);
const confirmAction = ref(null);

const orgForm = ref({
  name: "",
  accentColor: "#1E88E5",
});

const managerForm = ref({
  email: "",
  password: "",
  username: "",
});

const managerEditForm = ref({
  email: "",
  password: "",
});

const adminForm = ref({
  email: "",
  password: "",
  username: "",
});

const accentColorPresets = [
  "#1E88E5",
  "#36B054",
  "#43A047",
  "#FB8C00",
  "#6A1B9A",
  "#E53935",
];

const currentUser = computed(() => authService.getCurrentUser());

const statusCounts = computed(() =>
  orgs.value.reduce(
    (counts, org) => ({
      ...counts,
      [org.status]: (counts[org.status] || 0) + 1,
    }),
    {},
  ),
);

const totalMembers = computed(() =>
  orgs.value.reduce((sum, org) => sum + Number(org.memberCount || 0), 0),
);

const selectedOrgStatusClass = computed(() =>
  statusClass(selectedOrg.value?.status || "pending_payment"),
);

const showToast = (type, message) => {
  toast.value = { type, message };
  setTimeout(() => {
    toast.value = null;
  }, 3200);
};

const statusClass = (status) => {
  if (status === "active") return "bg-turf/20 text-turf";
  if (status === "inactive") return "bg-ball/20 text-ball";
  return "bg-asphalt text-asphalt-muted";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const setSelectedOrg = async (orgId) => {
  selectedOrgId.value = String(orgId);
  await loadOrgDetail(orgId);
};

const loadOrgs = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await adminService.listOrgs();
    orgs.value = Array.isArray(data) ? data : [];

    if (!selectedOrgId.value && orgs.value.length > 0) {
      selectedOrgId.value = String(orgs.value[0].id);
    }
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
};

const loadAdmins = async () => {
  const data = await adminService.listAdmins();
  admins.value = Array.isArray(data) ? data : [];
};

const loadOrgDetail = async (orgId = selectedOrgId.value) => {
  if (!orgId) {
    selectedOrg.value = null;
    managers.value = [];
    return;
  }

  loadingDetail.value = true;

  try {
    const [org, managerList] = await Promise.all([
      adminService.getOrg(orgId),
      adminService.listManagers(orgId),
    ]);

    selectedOrg.value = org;
    managers.value = Array.isArray(managerList) ? managerList : [];
    orgForm.value = {
      name: org.name || "",
      accentColor: org.accentColor || "#1E88E5",
    };
  } catch (err) {
    showToast("error", err.message || "Failed to load organization");
  } finally {
    loadingDetail.value = false;
  }
};

const refreshAll = async () => {
  try {
    await Promise.all([loadOrgs(), loadAdmins()]);
    if (selectedOrgId.value) {
      await loadOrgDetail(selectedOrgId.value);
    }
  } catch (err) {
    showToast("error", err.message || "Refresh failed");
  }
};

const updateOrg = async () => {
  if (!selectedOrg.value) return;
  actionLoading.value = "org";

  try {
    await adminService.updateOrg(selectedOrg.value.id, {
      name: orgForm.value.name,
      accentColor: orgForm.value.accentColor,
    });
    showToast("success", "Organization updated");
    await refreshAll();
  } catch (err) {
    showToast("error", err.message || "Failed to update organization");
  } finally {
    actionLoading.value = "";
  }
};

const setOrgStatus = async (status) => {
  if (!selectedOrg.value) return;
  actionLoading.value = status;

  try {
    if (status === "inactive") {
      await adminService.deactivateOrg(selectedOrg.value.id);
      showToast("success", "Organization deactivated");
    } else {
      await adminService.reactivateOrg(selectedOrg.value.id);
      showToast("success", "Organization reactivated");
    }
    await refreshAll();
  } catch (err) {
    showToast("error", err.message || "Failed to change organization status");
  } finally {
    actionLoading.value = "";
  }
};

const createManager = async () => {
  if (!selectedOrg.value || !managerForm.value.email || !managerForm.value.password) {
    showToast("error", "Email and password are required");
    return;
  }

  actionLoading.value = "manager-create";

  try {
    await adminService.createManager(selectedOrg.value.id, {
      email: managerForm.value.email,
      password: managerForm.value.password,
      username: managerForm.value.username || undefined,
    });
    managerForm.value = { email: "", password: "", username: "" };
    showToast("success", "Manager created");
    await loadOrgDetail();
  } catch (err) {
    showToast("error", err.message || "Failed to create manager");
  } finally {
    actionLoading.value = "";
  }
};

const startEditManager = (manager) => {
  editingManagerId.value = manager.id;
  managerEditForm.value = {
    email: manager.email || "",
    password: "",
  };
};

const updateManager = async () => {
  if (!selectedOrg.value || !editingManagerId.value) return;
  actionLoading.value = `manager-${editingManagerId.value}`;

  try {
    const payload = {
      email: managerEditForm.value.email,
    };

    if (managerEditForm.value.password) {
      payload.password = managerEditForm.value.password;
    }

    await adminService.updateManager(
      selectedOrg.value.id,
      editingManagerId.value,
      payload,
    );
    editingManagerId.value = null;
    showToast("success", "Manager updated");
    await loadOrgDetail();
  } catch (err) {
    showToast("error", err.message || "Failed to update manager");
  } finally {
    actionLoading.value = "";
  }
};

const createAdmin = async () => {
  if (!adminForm.value.email || !adminForm.value.password) {
    showToast("error", "Email and password are required");
    return;
  }

  actionLoading.value = "admin-create";

  try {
    await adminService.createAdmin({
      email: adminForm.value.email,
      password: adminForm.value.password,
      username: adminForm.value.username || undefined,
    });
    adminForm.value = { email: "", password: "", username: "" };
    showToast("success", "Admin created");
    await loadAdmins();
  } catch (err) {
    showToast("error", err.message || "Failed to create admin");
  } finally {
    actionLoading.value = "";
  }
};

const askDeleteOrg = () => {
  if (!selectedOrg.value) return;
  confirmAction.value = {
    title: "Delete organization",
    message: `Delete ${selectedOrg.value.name}? This permanently removes the organization.`,
    confirmLabel: "Delete org",
    run: async () => {
      await adminService.deleteOrg(selectedOrg.value.id);
      selectedOrg.value = null;
      selectedOrgId.value = "";
      await refreshAll();
    },
  };
};

const askDeleteManager = (manager) => {
  confirmAction.value = {
    title: "Delete manager",
    message: `Remove ${manager.email} from ${selectedOrg.value.name}?`,
    confirmLabel: "Delete manager",
    run: async () => {
      await adminService.deleteManager(selectedOrg.value.id, manager.id);
      await loadOrgDetail();
    },
  };
};

const askDeleteAdmin = (admin) => {
  confirmAction.value = {
    title: "Delete platform admin",
    message: `Delete ${admin.email}? Another admin is required to recreate this account.`,
    confirmLabel: "Delete admin",
    run: async () => {
      await adminService.deleteAdmin(admin.id);
      await loadAdmins();
    },
  };
};

const confirmDelete = async () => {
  if (!confirmAction.value) return;
  actionLoading.value = "delete";

  try {
    await confirmAction.value.run();
    showToast("success", "Deleted");
  } catch (err) {
    showToast("error", err.message || "Delete failed");
  } finally {
    actionLoading.value = "";
    confirmAction.value = null;
  }
};

onMounted(async () => {
  await refreshAll();
});
</script>

<template>
  <section class="space-y-5">
    <div
      v-if="toast"
      class="fixed right-4 top-24 z-50 rounded-md px-4 py-3 text-sm font-semibold shadow-card"
      :class="toast.type === 'success' ? 'bg-turf text-snow' : 'bg-danger-surface text-danger'"
    >
      {{ toast.message }}
    </div>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-racket">
          Platform admin
        </p>
        <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-snow">
          Organization control
        </h2>
        <p class="text-sm text-snow-dim">
          Manage tenants, manager accounts, and platform operators.
        </p>
      </div>
      <button type="button" class="btn-glass text-xs" @click="refreshAll">
        <font-awesome-icon icon="arrow-rotate-right" />
        Refresh
      </button>
    </div>

    <ErrorMessage
      v-if="error"
      title="Failed to load admin data"
      :message="error.message"
      hint="Platform admin endpoints require an admin session."
      retry-label="Retry"
      @retry="refreshAll"
    />

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="glass-card p-5">
        <p class="text-sm text-snow-dim">Organizations</p>
        <p class="mt-2 text-3xl font-semibold tabular-nums">{{ orgs.length }}</p>
      </div>
      <div class="glass-card p-5">
        <p class="text-sm text-snow-dim">Active</p>
        <p class="mt-2 text-3xl font-semibold tabular-nums text-turf">
          {{ statusCounts.active || 0 }}
        </p>
      </div>
      <div class="glass-card p-5">
        <p class="text-sm text-snow-dim">Inactive</p>
        <p class="mt-2 text-3xl font-semibold tabular-nums text-ball">
          {{ statusCounts.inactive || 0 }}
        </p>
      </div>
      <div class="glass-card p-5">
        <p class="text-sm text-snow-dim">Members</p>
        <p class="mt-2 text-3xl font-semibold tabular-nums">{{ totalMembers }}</p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[0.95fr_1.25fr]">
      <div class="glass-card p-5">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm font-semibold text-snow">Organizations</p>
          <LoadingSpinner v-if="loading" size="4" />
        </div>

        <div class="space-y-2">
          <button
            v-for="org in orgs"
            :key="org.id"
            type="button"
            class="w-full rounded-lg border p-3 text-left transition hover:bg-asphalt"
            :class="String(org.id) === selectedOrgId
              ? 'border-racket bg-asphalt'
              : 'border-asphalt-light bg-charcoal'"
            @click="setSelectedOrg(org.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-snow">{{ org.name }}</p>
                <p class="mt-1 text-xs text-asphalt-muted">
                  {{ org.memberCount || 0 }} members - created {{ formatDate(org.createdAt) }}
                </p>
              </div>
              <span
                class="rounded-md px-2 py-1 text-[11px] font-semibold"
                :class="statusClass(org.status)"
              >
                {{ org.status }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <div class="glass-card p-5">
        <div v-if="loadingDetail" class="flex items-center gap-3 text-sm text-snow-dim">
          <LoadingSpinner size="4" />
          Loading organization...
        </div>

        <div v-else-if="selectedOrg" class="space-y-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-semibold text-snow">{{ selectedOrg.name }}</h3>
                <span
                  class="rounded-md px-2 py-1 text-xs font-semibold"
                  :class="selectedOrgStatusClass"
                >
                  {{ selectedOrg.status }}
                </span>
              </div>
              <p class="mt-1 text-sm text-snow-dim">
                {{ selectedOrg.memberCount || 0 }} members - {{ selectedOrg.gameCount || 0 }} games
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-if="selectedOrg.status === 'active'"
                type="button"
                class="btn-glass px-3 py-2 text-xs"
                :disabled="actionLoading === 'inactive'"
                @click="setOrgStatus('inactive')"
              >
                Deactivate
              </button>
              <button
                v-if="selectedOrg.status === 'inactive'"
                type="button"
                class="btn-violet px-3 py-2 text-xs"
                :disabled="actionLoading === 'active'"
                @click="setOrgStatus('active')"
              >
                Reactivate
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-md border border-danger/40 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-surface"
                @click="askDeleteOrg"
              >
                <font-awesome-icon icon="trash-alt" />
                Delete
              </button>
            </div>
          </div>

          <form class="grid gap-3 sm:grid-cols-[1fr_20rem_auto]" @submit.prevent="updateOrg">
            <FormInput
              id="org-name"
              v-model="orgForm.name"
              label="Organization name"
              :required="true"
              :disabled="actionLoading === 'org'"
            />
            <div>
              <label
                for="org-color-text"
                class="block text-xs font-semibold uppercase tracking-wide text-snow-dim"
              >
                Accent color <span class="text-danger">*</span>
              </label>
              <div class="mt-2 flex min-h-[3.25rem] items-center gap-2 rounded-xl border border-white/10 bg-asphalt/60 px-2 py-2 focus-within:border-racket focus-within:ring-2 focus-within:ring-racket/30">
                <input
                  id="org-color"
                  v-model="orgForm.accentColor"
                  type="color"
                  :disabled="actionLoading === 'org'"
                  class="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-white/10 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Choose accent color"
                />
                <input
                  id="org-color-text"
                  v-model="orgForm.accentColor"
                  type="text"
                  required
                  pattern="#[0-9A-Fa-f]{6}"
                  placeholder="#1E88E5"
                  :disabled="actionLoading === 'org'"
                  class="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm text-snow placeholder:text-asphalt-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="color in accentColorPresets"
                  :key="color"
                  type="button"
                  class="h-6 w-6 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-racket/30"
                  :class="orgForm.accentColor?.toLowerCase() === color.toLowerCase()
                    ? 'border-snow ring-2 ring-racket/30'
                    : 'border-asphalt-light'"
                  :style="{ backgroundColor: color }"
                  :aria-label="`Use ${color}`"
                  :disabled="actionLoading === 'org'"
                  @click="orgForm.accentColor = color"
                />
              </div>
            </div>
            <button
              type="submit"
              class="btn-violet self-end"
              :disabled="actionLoading === 'org'"
            >
              <LoadingSpinner v-if="actionLoading === 'org'" size="4" />
              <font-awesome-icon v-else icon="save" />
              Save
            </button>
          </form>

          <div class="border-t border-asphalt-light pt-5">
            <div class="mb-4 flex items-center justify-between">
              <p class="text-sm font-semibold text-snow">Managers</p>
              <span class="text-xs text-asphalt-muted">{{ managers.length }} total</span>
            </div>

            <form class="grid gap-3 lg:grid-cols-4" @submit.prevent="createManager">
              <FormInput
                id="manager-email"
                v-model="managerForm.email"
                label="Email"
                type="email"
                :required="true"
                :disabled="actionLoading === 'manager-create'"
              />
              <FormInput
                id="manager-password"
                v-model="managerForm.password"
                label="Password"
                type="password"
                :required="true"
                :disabled="actionLoading === 'manager-create'"
              />
              <FormInput
                id="manager-name"
                v-model="managerForm.username"
                label="Username"
                :disabled="actionLoading === 'manager-create'"
              />
              <button
                type="submit"
                class="btn-violet self-end"
                :disabled="actionLoading === 'manager-create'"
              >
                <font-awesome-icon icon="user-plus" />
                Add manager
              </button>
            </form>

            <div class="mt-4 space-y-2">
              <div
                v-for="manager in managers"
                :key="manager.id"
                class="rounded-lg border border-asphalt-light bg-asphalt p-3"
              >
                <div
                  v-if="editingManagerId !== manager.id"
                  class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-snow">{{ manager.name }}</p>
                    <p class="text-xs text-snow-dim">{{ manager.email }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button type="button" class="btn-glass px-3 py-2 text-xs" @click="startEditManager(manager)">
                      <font-awesome-icon icon="pen" />
                      Edit
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center gap-2 rounded-md border border-danger/40 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-surface"
                      @click="askDeleteManager(manager)"
                    >
                      <font-awesome-icon icon="trash-alt" />
                      Delete
                    </button>
                  </div>
                </div>

                <form
                  v-else
                  class="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]"
                  @submit.prevent="updateManager"
                >
                  <FormInput
                    id="manager-edit-email"
                    v-model="managerEditForm.email"
                    label="Email"
                    type="email"
                    :required="true"
                  />
                  <FormInput
                    id="manager-edit-password"
                    v-model="managerEditForm.password"
                    label="New password"
                    type="password"
                  />
                  <button type="submit" class="btn-violet self-end">
                    Save
                  </button>
                  <button
                    type="button"
                    class="btn-glass self-end"
                    @click="editingManagerId = null"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-snow-dim">Select an organization to manage.</p>
      </div>
    </div>

    <div class="glass-card p-5">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-semibold text-snow">Platform admins</p>
          <p class="text-xs text-asphalt-muted">
            Admins are global operators and do not belong to an organization.
          </p>
        </div>
        <span class="text-xs text-asphalt-muted">{{ admins.length }} total</span>
      </div>

      <form class="grid gap-3 lg:grid-cols-4" @submit.prevent="createAdmin">
        <FormInput
          id="admin-email"
          v-model="adminForm.email"
          label="Email"
          type="email"
          :required="true"
          :disabled="actionLoading === 'admin-create'"
        />
        <FormInput
          id="admin-password"
          v-model="adminForm.password"
          label="Password"
          type="password"
          :required="true"
          :disabled="actionLoading === 'admin-create'"
        />
        <FormInput
          id="admin-name"
          v-model="adminForm.username"
          label="Username"
          :disabled="actionLoading === 'admin-create'"
        />
        <button
          type="submit"
          class="btn-violet self-end"
          :disabled="actionLoading === 'admin-create'"
        >
          <font-awesome-icon icon="user-plus" />
          Add admin
        </button>
      </form>

      <div class="mt-4 grid gap-2 lg:grid-cols-2">
        <div
          v-for="admin in admins"
          :key="admin.id"
          class="flex items-center justify-between gap-3 rounded-lg border border-asphalt-light bg-asphalt p-3"
        >
          <div>
            <p class="text-sm font-semibold text-snow">{{ admin.name }}</p>
            <p class="text-xs text-snow-dim">{{ admin.email }}</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-md border border-danger/40 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-surface disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="admin.id === currentUser?.id"
            @click="askDeleteAdmin(admin)"
          >
            <font-awesome-icon icon="trash-alt" />
            Delete
          </button>
        </div>
      </div>
    </div>

    <DeleteConfirmModal
      :visible="!!confirmAction"
      :title="confirmAction?.title"
      :message="confirmAction?.message"
      :confirm-label="confirmAction?.confirmLabel"
      @confirm="confirmDelete"
      @cancel="confirmAction = null"
    />
  </section>
</template>
