<script setup>
import { computed, ref } from "vue";
import playersService from "@/services/playersService.js";
import gamesService from "@/services/gamesService.js";
import apiService from "@/services/apiService.js";
import { useApiRequest } from "@/composables/useApiRequest.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import EmptyState from "@/components/EmptyState.vue";
import FormInput from "@/components/FormInput.vue";
import DeleteConfirmModal from "@/components/DeleteConfirmModal.vue";
import { formatDate } from "@/utils/formatters.js";

const search = ref("");
const sortBy = ref("elo");
const sortDir = ref("desc");
const currentPage = ref(1);
const pageSize = ref(10);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showHistoryModal = ref(false);
const selectedPlayer = ref(null);
const historyLoading = ref(false);
const historyError = ref("");
const selectedPlayerEloHistory = ref(null);
const selectedPlayerGames = ref([]);

const createForm = ref({
  email: "",
  username: "",
  password: "",
});

const editForm = ref({
  email: "",
  username: "",
  role: "user",
});

const {
  data: users,
  loading,
  error,
  execute: fetchPlayers,
} = useApiRequest(() => playersService.listUsers(), {
  immediate: true,
  maxRetries: 1,
});

const toast = ref(null);
const showToast = (type, message) => {
  toast.value = { type, message };
  setTimeout(() => {
    toast.value = null;
  }, 3000);
};

const filteredPlayers = computed(() => {
  const term = search.value.trim().toLowerCase();
  let list = (users.value || []).map((u, index) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role || "user",
    elo: u.elo ?? 1000,
    createdAt: u.createdAt,
    rank: index + 1,
  }));

  if (term) {
    list = list.filter((p) =>
      [p.name, p.email, p.role].some((value) =>
        value?.toLowerCase().includes(term),
      ),
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
    email: player.email || "",
    username: player.name,
    role: player.role || "user",
  };
  showEditModal.value = true;
};

const submitEdit = async () => {
  if (!selectedPlayer.value) return;
  try {
    await playersService.updatePlayer(selectedPlayer.value.id, {
      email: editForm.value.email || undefined,
      username: editForm.value.username || undefined,
      role: editForm.value.role || undefined,
    });

    showEditModal.value = false;
    showToast("success", "Player updated");
    await fetchPlayers();
  } catch (err) {
    showToast("error", err.message || "Failed to update player");
  }
};

const openHistoryModal = async (player) => {
  selectedPlayer.value = player;
  showHistoryModal.value = true;
  historyLoading.value = true;
  historyError.value = "";
  selectedPlayerEloHistory.value = null;
  selectedPlayerGames.value = [];

  try {
    const [eloHistory, games] = await Promise.all([
      apiService.getHistoricalEloByUserId(player.id),
      gamesService.listAdminGames(),
    ]);

    const gamesForPlayer = (games || [])
      .filter((game) =>
        (game.participants || []).some(
          (participant) => Number(participant.userId) === Number(player.id),
        ),
      )
      .map((game) => {
        const participant = (game.participants || []).find(
          (entry) => Number(entry.userId) === Number(player.id),
        );
        return {
          ...game,
          userScore: participant?.score ?? null,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.endedAt || b.startedAt || b.createdAt || 0) -
          new Date(a.endedAt || a.startedAt || a.createdAt || 0),
      );

    selectedPlayerEloHistory.value = eloHistory;
    selectedPlayerGames.value = gamesForPlayer;
  } catch (err) {
    historyError.value = err.message || "Failed to load player history";
  } finally {
    historyLoading.value = false;
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
          Manage accounts, roles, and leaderboard data.
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
            placeholder="Search by name, email, or role"
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
                  Email
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-asphalt-muted">
                  Role
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-asphalt-muted">
                  ELO
                </th>
                <th class="px-4 py-2 text-left text-xs font-medium text-asphalt-muted">
                  Created
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
                <td class="px-4 py-2 text-snow-dim">
                  {{ player.email || "-" }}
                </td>
                <td class="px-4 py-2">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="player.role === 'admin' ? 'bg-racket/20 text-racket' : 'bg-asphalt text-snow-dim'"
                  >
                    {{ player.role }}
                  </span>
                </td>
                <td class="px-4 py-2 text-snow-dim tabular-nums">
                  {{ player.elo }}
                </td>
                <td class="px-4 py-2 text-snow-dim whitespace-nowrap">
                  {{ formatDate(player.createdAt) || "-" }}
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="inline-flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded bg-asphalt px-2 py-1 text-snow hover:bg-asphalt-light"
                      @click="openHistoryModal(player)"
                    >
                      <font-awesome-icon icon="chart-line" />
                      History
                    </button>
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
          <div>
            <label for="edit-role" class="block text-sm font-medium text-snow">
              Role
            </label>
            <select
              id="edit-role"
              v-model="editForm.role"
              class="mt-1 block w-full rounded-md border border-asphalt-light bg-asphalt px-3 py-2 text-snow shadow-sm focus:border-racket focus:outline-none focus:ring-racket"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
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

    <!-- Player history modal -->
    <div
      v-if="showHistoryModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-court/80"
      @click.self="showHistoryModal = false"
    >
      <div class="w-full max-w-3xl rounded-lg bg-charcoal p-5 border border-asphalt-light max-h-[85vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-snow mb-4">
          {{ selectedPlayer?.name }} - History
        </h3>

        <div v-if="historyLoading" class="py-12 flex justify-center">
          <LoadingSpinner size="6" />
        </div>

        <ErrorMessage
          v-else-if="historyError"
          :title="'Failed to load history'"
          :message="historyError"
        />

        <div v-else class="space-y-5">
          <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
            <p class="text-xs uppercase tracking-wide text-asphalt-muted">Current ELO</p>
            <p class="mt-1 text-2xl font-semibold text-snow tabular-nums">
              {{ selectedPlayerEloHistory?.currentElo ?? selectedPlayer?.elo ?? 1000 }}
            </p>
          </div>

          <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
            <p class="text-sm font-semibold text-snow mb-3">Historical ELO</p>
            <div v-if="!(selectedPlayerEloHistory?.history || []).length" class="text-sm text-snow-dim">
              No ELO history entries yet.
            </div>
            <ul v-else class="space-y-2 text-sm">
              <li
                v-for="entry in selectedPlayerEloHistory.history"
                :key="entry.id"
                class="flex items-center justify-between rounded bg-charcoal px-3 py-2"
              >
                <div>
                  <p class="text-snow">{{ entry.gameName || `Game #${entry.gameId}` }}</p>
                  <p class="text-xs text-snow-dim">{{ formatDate(entry.recordedAt) || "-" }}</p>
                </div>
                <p class="font-semibold text-snow tabular-nums">{{ entry.elo }}</p>
              </li>
            </ul>
          </div>

          <div class="rounded-lg border border-asphalt-light bg-asphalt p-4">
            <p class="text-sm font-semibold text-snow mb-3">
              Games ({{ selectedPlayerGames.length }})
            </p>
            <div v-if="!selectedPlayerGames.length" class="text-sm text-snow-dim">
              No games found for this player.
            </div>
            <ul v-else class="space-y-2 text-sm">
              <li
                v-for="game in selectedPlayerGames"
                :key="game.id"
                class="rounded bg-charcoal px-3 py-2"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="font-medium text-snow">{{ game.name || `Game #${game.id}` }}</p>
                  <span class="text-xs capitalize text-snow-dim">{{ game.status || "-" }}</span>
                </div>
                <p class="text-xs text-snow-dim mt-1">
                  {{ formatDate(game.endedAt || game.startedAt || game.createdAt) || "-" }}
                  <span v-if="game.userScore !== null"> • Score: {{ game.userScore }}</span>
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-5 flex justify-end">
          <button
            type="button"
            class="rounded bg-asphalt-light px-3 py-2 text-xs text-snow hover:bg-asphalt"
            @click="showHistoryModal = false"
          >
            Close
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

