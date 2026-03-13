<script setup>
import { computed, ref } from "vue";
import playersService from "@/services/playersService.js";
import { useApiRequest } from "@/composables/useApiRequest.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import EmptyState from "@/components/EmptyState.vue";
import FormInput from "@/components/FormInput.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";

const search = ref("");
const sortBy = ref("elo");
const sortDir = ref("desc");
const currentPage = ref(1);
const pageSize = ref(10);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedPlayer = ref(null);

const createForm = ref({
  email: "",
  username: "",
  password: "",
});

const editForm = ref({
  email: "",
  username: "",
});

const {
  data: leaderboard,
  loading,
  error,
  execute: fetchPlayers,
} = useApiRequest(() => playersService.listLeaderboard(), {
  immediate: true,
  maxRetries: 1,
});

const {
  execute: searchPlayers,
  loading: searching,
} = useApiRequest(
  (term) => playersService.searchPlayers(term),
  { immediate: false, maxRetries: 1 },
);

const toast = ref(null);
const showToast = (type, message) => {
  toast.value = { type, message };
  setTimeout(() => {
    toast.value = null;
  }, 3000);
};

const filteredPlayers = computed(() => {
  const term = search.value.trim().toLowerCase();
  let list = leaderboard.value || [];

  if (term) {
    list = list.filter((p) =>
      p.name?.toLowerCase().includes(term),
    );
  }

  const sorted = [...list].sort((a, b) => {
    const dir = sortDir.value === "asc" ? 1 : -1;
    if (sortBy.value === "elo") {
      return (a.elo - b.elo) * dir;
    }
    if (sortBy.value === "name") {
      return a.name.localeCompare(b.name) * dir;
    }
    if (sortBy.value === "rank") {
      return (a.rank - b.rank) * dir;
    }
    return 0;
  });

  return sorted;
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPlayers.value.length / pageSize.value)),
);

const paginatedPlayers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredPlayers.value.slice(start, start + pageSize.value);
});

const setSort = (field) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDir.value = "desc";
  }
};

const openCreateModal = () => {
  createForm.value = { email: "", username: "", password: "" };
  showCreateModal.value = true;
};

const submitCreate = async () => {
  try {
    await playersService.createPlayer(createForm.value);
    showCreateModal.value = false;
    showToast("success", "Player created");
    await fetchPlayers();
  } catch (err) {
    showToast("error", err.message || "Failed to create player");
  }
};

const openEditModal = async (player) => {
  selectedPlayer.value = player;
  editForm.value = {
    email: "",
    username: player.name,
  };
  showEditModal.value = true;
};

const submitEdit = async () => {
  if (!selectedPlayer.value) return;
  try {
    await playersService.updatePlayer(selectedPlayer.value.id, {
      email: editForm.value.email || undefined,
      username: editForm.value.username || undefined,
    });
    showEditModal.value = false;
    showToast("success", "Player updated");
    await fetchPlayers();
  } catch (err) {
    showToast("error", err.message || "Failed to update player");
  }
};

const openDeleteModal = (player) => {
  selectedPlayer.value = player;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!selectedPlayer.value) return;
  try {
    await playersService.deletePlayer(selectedPlayer.value.id);
    showDeleteModal.value = false;
    showToast("success", "Player deleted");
    await fetchPlayers();
  } catch (err) {
    showToast("error", err.message || "Failed to delete player");
  }
};
</script>

<template>
  <section class="space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs uppercase tracking-wide text-asphalt-muted">
          Players
        </p>
        <p class="text-sm text-snow-dim">
          Manage players, update details, and maintain the leaderboard.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-md bg-racket px-3 py-2 text-xs font-medium text-white hover:bg-racket-hover"
          @click="openCreateModal"
        >
          <font-awesome-icon icon="user-plus" />
          New player
        </button>
      </div>
    </div>

    <div
      v-if="toast"
      class="fixed right-4 top-20 z-50 max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg"
      :class="toast.type === 'success' ? 'bg-turf text-snow' : 'bg-danger-surface text-danger'"
    >
      {{ toast.message }}
    </div>

    <div class="bg-charcoal rounded-xl border border-asphalt-light p-4 space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex-1 max-w-xs">
          <FormInput
            id="player-search"
            v-model="search"
            label="Search players"
            placeholder="Search by name"
          />
        </div>

        <div class="flex items-center gap-2 text-xs text-asphalt-muted">
          <span>Sort by:</span>
          <button
            type="button"
            class="rounded-full px-3 py-1 border border-asphalt-light"
            :class="sortBy === 'elo' ? 'bg-asphalt text-snow' : 'text-snow-dim'"
            @click="setSort('elo')"
          >
            ELO
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 border border-asphalt-light"
            :class="sortBy === 'name' ? 'bg-asphalt text-snow' : 'text-snow-dim'"
            @click="setSort('name')"
          >
            Name
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 border border-asphalt-light"
            :class="sortBy === 'rank' ? 'bg-asphalt text-snow' : 'text-snow-dim'"
            @click="setSort('rank')"
          >
            Rank
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-12 flex justify-center">
        <LoadingSpinner size="6" />
      </div>

      <ErrorMessage
        v-else-if="error"
        :title="'Failed to load players'"
        :message="error.message"
        retry-label="Retry"
        @retry="fetchPlayers"
      />

      <div v-else>
        <div v-if="!filteredPlayers.length">
          <EmptyState
            icon="users"
            title="No players found"
            message="Create the first player to get started."
            action-label="Create player"
            action-icon="user-plus"
            @action="openCreateModal"
          />
        </div>

        <div v-else class="overflow-x-auto rounded-lg border border-asphalt-light">
          <table class="min-w-full divide-y divide-asphalt-light text-sm">
            <thead class="bg-asphalt">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-asphalt-muted">
                  Rank
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-asphalt-muted">
                  Name
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-asphalt-muted">
                  ELO
                </th>
                <th class="px-4 py-2 text-right text-xs font-medium text-asphalt-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-asphalt-light bg-charcoal">
              <tr v-for="player in paginatedPlayers" :key="player.id">
                <td class="px-4 py-2 text-snow-dim tabular-nums">
                  {{ player.rank }}
                </td>
                <td class="px-4 py-2 text-snow">
                  {{ player.name }}
                </td>
                <td class="px-4 py-2 text-snow-dim tabular-nums">
                  {{ player.elo }}
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="inline-flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded bg-asphalt px-2 py-1 text-snow hover:bg-asphalt-light"
                      @click="openEditModal(player)"
                    >
                      <font-awesome-icon icon="pen" />
                      Edit
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded bg-danger-surface px-2 py-1 text-danger hover:bg-danger-hover"
                      @click="openDeleteModal(player)"
                    >
                      <font-awesome-icon icon="trash" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="filteredPlayers.length"
          class="mt-3 flex items-center justify-between text-xs text-asphalt-muted"
        >
          <p>
            Page
            <span class="font-mono text-snow">{{ currentPage }}</span>
            of
            <span class="font-mono text-snow">{{ totalPages }}</span>
          </p>
          <div class="inline-flex items-center gap-2">
            <button
              type="button"
              class="rounded px-2 py-1 bg-asphalt text-snow disabled:opacity-40"
              :disabled="currentPage === 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              Prev
            </button>
            <button
              type="button"
              class="rounded px-2 py-1 bg-asphalt text-snow disabled:opacity-40"
              :disabled="currentPage === totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create player modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-court/80"
      @click.self="showCreateModal = false"
    >
      <div class="w-full max-w-md rounded-lg bg-charcoal p-5 border border-asphalt-light">
        <h3 class="text-lg font-semibold text-snow mb-4">
          Create player
        </h3>
        <div class="space-y-3">
          <FormInput
            id="create-email"
            v-model="createForm.email"
            label="Email"
            type="email"
            required
          />
          <FormInput
            id="create-username"
            v-model="createForm.username"
            label="Username"
            required
          />
          <FormInput
            id="create-password"
            v-model="createForm.password"
            label="Password"
            type="password"
            required
          />
        </div>
        <div class="mt-5 flex justify-end gap-2 text-xs">
          <button
            type="button"
            class="rounded bg-asphalt-light px-3 py-2 text-snow hover:bg-asphalt"
            @click="showCreateModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded bg-racket px-3 py-2 text-white hover:bg-racket-hover"
            @click="submitCreate"
          >
            <font-awesome-icon icon="check" />
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- Edit player modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-court/80"
      @click.self="showEditModal = false"
    >
      <div class="w-full max-w-md rounded-lg bg-charcoal p-5 border border-asphalt-light">
        <h3 class="text-lg font-semibold text-snow mb-4">
          Edit player
        </h3>
        <div class="space-y-3">
          <FormInput
            id="edit-username"
            v-model="editForm.username"
            label="Username"
          />
          <FormInput
            id="edit-email"
            v-model="editForm.email"
            label="Email"
            type="email"
          />
        </div>
        <div class="mt-5 flex justify-end gap-2 text-xs">
          <button
            type="button"
            class="rounded bg-asphalt-light px-3 py-2 text-snow hover:bg-asphalt"
            @click="showEditModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded bg-racket px-3 py-2 text-white hover:bg-racket-hover"
            @click="submitEdit"
          >
            <font-awesome-icon icon="check" />
            Save changes
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation -->
    <DeleteConfirmModal
      :visible="showDeleteModal"
      title="Delete player"
      :message="`Are you sure you want to delete '${selectedPlayer?.name}'? This cannot be undone.`"
      confirm-label="Delete player"
      @cancel="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </section>
</template>

