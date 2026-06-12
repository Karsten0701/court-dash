<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService.js";
import authService from "@/services/authService.js";
import ErrorMessage from "@/components/ErrorMessage.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import FormInput from "@/components/FormInput.vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const router = useRouter();
const isLoading = ref(true);
const user = ref(null);
const error = ref("");
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const editForm = ref({
  username: "",
  email: "",
  phone_number: "",
});

const fetchUserData = async () => {
  try {
    isLoading.value = true;
    error.value = "";

    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error("User not found");
    }

    const response = await apiService.getUserById(currentUser.id);
    user.value = response.user || response;

    // Initialize edit form
    editForm.value = {
      username: user.value.username || user.value.name || "",
      email: user.value.email || "",
      phone_number: user.value.phone_number || "",
    };
  } catch (err) {
    console.error("Failed to fetch user data:", err);

    // If 401, token is invalid - redirect to login
    if (err.message.includes("401") || err.message.includes("Unauthorized")) {
      await authService.logout();
      router.push({ name: "Login", query: { redirect: "/account" } });
      return;
    } else if (err.status === 500) {
      error.value = "Something went wrong. Please try again later.";
    } else {
      error.value = err.message || "Failed to load account information";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateProfile = async () => {
  try {
    error.value = "";
    const currentUser = authService.getCurrentUser();

    await apiService.updateUser(currentUser.id, editForm.value);

    // Refresh user data
    await fetchUserData();
    isEditing.value = false;
  } catch (err) {
    console.error("Failed to update profile:", err);
    error.value = err.message || "Failed to update profile";
  }
};

const handleLogout = async () => {
  try {
    await authService.logout();
    router.push({ name: "Home" });
  } catch (err) {
    console.error("Logout failed:", err);
    // Still redirect even if logout fails
    router.push({ name: "Home" });
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  if (user.value) {
    editForm.value = {
      username: user.value.username || user.value.name || "",
      email: user.value.email || "",
      phone_number: user.value.phone_number || "",
    };
  }
};

const handleDeleteAccount = async () => {
  try {
    const currentUser = authService.getCurrentUser();
    await apiService.deleteUser(currentUser.id);

    // Clear user data and redirect to home
    await authService.logout();
    router.push({ name: "Home" });
  } catch (err) {
    console.error("Failed to delete account:", err);
    error.value = err.message || "Failed to delete account";
  } finally {
    showDeleteConfirm.value = false;
  }
};

const isAdmin = () => {
  return user.value?.role === "admin";
};

onMounted(() => {
  fetchUserData();
});
</script>

<template>
  <div class="min-h-[calc(100dvh-var(--nav-h))] py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="mb-8 pt-4">
        <h1
          class="bg-gradient-to-r from-snow to-snow-dim bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
        >
          Account
        </h1>
        <p class="text-snow-dim text-sm mt-2">Manage your profile</p>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="glass-card p-6 animate-pulse">
        <div class="h-5 bg-asphalt-light rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-asphalt-light rounded w-1/2 mb-3"></div>
        <div class="h-4 bg-asphalt-light rounded w-2/5 mb-3"></div>
        <div class="h-4 bg-asphalt-light rounded w-1/4"></div>
      </div>

      <!-- Error State -->
      <ErrorMessage
        v-else-if="error && !user"
        title="Error loading account"
        :message="error"
        hint="We couldn't load your profile. Please try again."
        retry-label="Try again"
        @retry="fetchUserData"
      />

      <!-- Account Information -->
      <div v-else-if="user">
        <div class="glass-card">
          <!-- View Mode -->
          <div v-if="!isEditing" class="p-6">
            <div class="flex gap-8">
              <!-- Profile Fields -->
              <div class="flex-1 space-y-5">
                <div>
                  <p class="text-xs text-asphalt-muted mb-1">Name</p>
                  <p class="text-snow">
                    {{ user.username || user.name || "N/A" }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-asphalt-muted mb-1">Email</p>
                  <p class="text-snow">
                    {{ user.email || "N/A" }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-asphalt-muted mb-1">Phone Number</p>
                  <p class="text-snow">
                    {{ user.phone_number || "Not set" }}
                  </p>
                </div>

                <div class="sm:hidden">
                  <p class="text-xs text-asphalt-muted mb-1">ELO Rating</p>
                  <p class="text-snow font-semibold">{{ user.elo ?? 1000 }}</p>
                </div>

                <div v-if="isAdmin()">
                  <p class="text-xs text-asphalt-muted mb-1">Account Type</p>
                  <p class="text-snow capitalize">
                    {{ user.role || "User" }}
                  </p>
                </div>

                <div>
                  <p class="text-xs text-asphalt-muted mb-1">Member Since</p>
                  <p class="text-snow">
                    {{
                      user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "N/A"
                    }}
                  </p>
                </div>
              </div>

              <!-- Avatar + ELO (right side, hidden on small screens) -->
              <div
                class="hidden sm:flex flex-col items-center justify-center px-6 border-l border-white/5 min-w-[160px]"
              >
                <div
                  class="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-violet-grad shadow-glow"
                >
                  <span class="text-2xl font-bold text-white">
                    {{ (user.username || user.name || "?")[0].toUpperCase() }}
                  </span>
                </div>
                <p
                  class="bg-gradient-to-r from-snow to-snow-dim bg-clip-text text-3xl font-extrabold text-transparent"
                >
                  {{ user.elo ?? 1000 }}
                </p>
                <p class="mt-1 text-xs uppercase tracking-wide text-asphalt-muted">
                  ELO Rating
                </p>
              </div>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="p-6">
            <form @submit.prevent="handleUpdateProfile" class="space-y-6">
              <ErrorMessage
                v-if="error"
                title="Update failed"
                :message="error"
                hint="Your changes couldn't be saved. Please try again."
                retry-label="Dismiss"
                retry-icon="times"
                @retry="error = ''"
              />

              <FormInput
                id="username"
                v-model="editForm.username"
                label="Name"
                required
              />
              <FormInput
                id="email"
                v-model="editForm.email"
                label="Email"
                type="email"
                required
              />
              <FormInput
                id="phone_number"
                v-model="editForm.phone_number"
                label="Phone Number"
                type="tel"
              />

              <div class="flex gap-3 border-t border-white/5 pt-5">
                <button type="submit" class="btn-violet">
                  <FontAwesomeIcon icon="save" />
                  Save
                </button>
                <button type="button" @click="cancelEdit" class="btn-glass">
                  <FontAwesomeIcon icon="times" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Action Buttons Below Card -->
        <div v-if="!isEditing" class="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <button @click="isEditing = true" class="btn-violet">
            <FontAwesomeIcon icon="edit" />
            Edit Profile
          </button>
          <button
            @click="handleLogout"
            class="btn-glass text-danger hover:text-danger"
          >
            <FontAwesomeIcon icon="sign-out-alt" />
            Logout
          </button>
          <button
            @click="showDeleteConfirm = true"
            :disabled="isAdmin()"
            :class="[
              'text-xs',
              isAdmin()
                ? 'text-snow-dim cursor-not-allowed'
                : 'text-snow-dim hover:text-danger',
            ]"
            :title="
              isAdmin()
                ? 'Admins cannot delete their own account'
                : 'Delete account'
            "
          >
            Delete Account
          </button>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <DeleteConfirmModal
        :visible="showDeleteConfirm"
        @confirm="handleDeleteAccount"
        @cancel="showDeleteConfirm = false"
      />
    </div>
  </div>
</template>
