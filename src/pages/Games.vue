<script setup>
import { computed, ref } from "vue";
import gamesService from "@/services/gamesService.js";
import playersService from "@/services/playersService.js";
import { useApiRequest } from "@/composables/useApiRequest.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import EmptyState from "@/components/EmptyState.vue";
import FormInput from "@/components/FormInput.vue";
import ParticipantsList from "@/components/ParticipantsList.vue";

const expandedGameIds = ref(new Set());

const {
  data: games,
  loading,
  error,
  execute: fetchGames,
} = useApiRequest(() => gamesService.listPlannedGames(), {
  immediate: true,
  maxRetries: 1,
});

const {
  data: searchResults,
  loading: searchingPlayers,
  execute: executePlayerSearch,
} = useApiRequest(
  (term) => playersService.searchPlayers(term),
  { immediate: false, maxRetries: 1 },
);

const showCreateModal = ref(false);
const createForm = ref({
  name: "",
  description: "",
  plannedAt: "",
});

const toast = ref(null);
const showToast = (type, message) => {
  toast.value = { type, message };
  setTimeout(() => {
    toast.value = null;
  }, 3000);
};

const toggleExpand = (id) => {
  const set = new Set(expandedGameIds.value);
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  expandedGameIds.value = set;
};

const openCreateModal = () => {
  createForm.value = { name: "", description: "", plannedAt: "" };
  showCreateModal.value = true;
};

const submitCreate = async () => {
  try {
    const payload = {
      name: createForm.value.name || undefined,
      description: createForm.value.description || undefined,
      plannedAt: createForm.value.plannedAt || undefined,
    };
    await gamesService.createGame(payload);
    showCreateModal.value = false;
    showToast("success", "Game created");
    await fetchGames();
  } catch (err) {
    showToast("error", err.message || "Failed to create game");
  }
};

const playerSearchTerm = ref("");
const selectedGameForPlayerChange = ref(null);

const openPlayersForGame = (game) => {
  selectedGameForPlayerChange.value = game;
  playerSearchTerm.value = "";
  searchResults.value = [];
};

const performPlayerSearch = async () => {
  if (!playerSearchTerm.value.trim()) {
    searchResults.value = [];
    return;
  }
  try {
    await executePlayerSearch(playerSearchTerm.value.trim());
  } catch {
    // error surfaced via composable state
  }
};

const addPlayerToGame = async (player) => {
  if (!selectedGameForPlayerChange.value) return;
  try {
    await gamesService.signupUserForGame(
      selectedGameForPlayerChange.value.id,
      player.id,
    );
    showToast("success", `Added ${player.name} to game`);
    await fetchGames();
  } catch (err) {
    showToast("error", err.message || "Failed to add player");
  }
};

const removePlayerFromGame = async (gameId, participant) => {
  try {
    await gamesService.removeUserFromGame(gameId, participant.userId);
    showToast("success", `Removed ${participant.username} from game`);
    await fetchGames();
  } catch (err) {
    showToast("error", err.message || "Failed to remove player");
  }
};

const deleteGame = async (gameId) => {
  try {
    await gamesService.deleteGame(gameId);
    showToast("success", "Game deleted");
    await fetchGames();
  } catch (err) {
    showToast("error", err.message || "Failed to delete game");
  }
};

const sortedGames = computed(() =>
  (games.value || []).slice().sort((a, b) => {
    const aTs = a.plannedAt ? Date.parse(a.plannedAt) : 0;
    const bTs = b.plannedAt ? Date.parse(b.plannedAt) : 0;
    return aTs - bTs;
  }),
);
</script>

<template>
  <section class="space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs uppercase tracking-wide text-asphalt-muted">
          Games
        </p>
        <p class="text-sm text-snow-dim">
          Create, manage, and assign players to court games.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-racket px-3 py-2 text-xs font-medium text-white hover:bg-racket-hover"
        @click="openCreateModal"
      >
        <font-awesome-icon icon="plus" />
        New game
      </button>
    </div>

    <div
      v-if="toast"
      class="fixed right-4 top-20 z-50 max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg"
      :class="toast.type === 'success' ? 'bg-turf text-snow' : 'bg-danger-surface text-danger'"
    >
      {{ toast.message }}
    </div>

    <div class="bg-charcoal rounded-xl border border-asphalt-light p-4 space-y-4">
      <div class="flex items-center justify-between text-xs text-asphalt-muted">
        <span>
          {{ sortedGames.length }} planned game<span v-if="sortedGames.length !== 1">s</span>
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-2 text-snow-dim hover:text-snow"
          @click="fetchGames"
        >
          <font-awesome-icon icon="arrow-rotate-right" />
          Refresh
        </button>
      </div>

      <div v-if="loading" class="py-12 flex justify-center">
        <LoadingSpinner size="6" />
      </div>

      <ErrorMessage
        v-else-if="error"
        :title="'Failed to load games'"
        :message="error.message"
        retry-label="Retry"
        @retry="fetchGames"
      />

      <div v-else>
        <div v-if="!sortedGames.length">
          <EmptyState
            icon="calendar-days"
            title="No games planned"
            message="Create a new game to start planning your next session."
            action-label="Create game"
            action-icon="plus"
            @action="openCreateModal"
          />
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="game in sortedGames"
            :key="game.id"
            class="rounded-lg border border-asphalt-light bg-charcoal overflow-hidden"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-asphalt-light/60"
              @click="toggleExpand(game.id)"
            >
              <div class="flex items-center gap-3">
                <font-awesome-icon
                  :icon="expandedGameIds.has(game.id) ? 'chevron-down' : 'chevron-right'"
                  class="text-xs text-asphalt-muted"
                />
                <div>
                  <p class="text-sm font-medium text-snow">
                    {{ game.name || "Unnamed Game" }}
                  </p>
                  <p class="text-xs text-asphalt-muted">
                    {{ game.description || "No description" }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-xs text-asphalt-muted">
                <span>
                  {{ game.signupCount ?? 0 }} player<span v-if="(game.signupCount ?? 0) !== 1">s</span>
                </span>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded bg-danger-surface px-2 py-1 text-danger hover:bg-danger-hover"
                  @click.stop="deleteGame(game.id)"
                >
                  <font-awesome-icon icon="trash" />
                  Delete
                </button>
              </div>
            </button>

            <div v-if="expandedGameIds.has(game.id)" class="border-t border-asphalt-light">
              <div class="grid gap-4 p-4 lg:grid-cols-[2fr,1.5fr]">
                <div>
                  <p class="text-xs uppercase tracking-wide text-asphalt-muted mb-2">
                    Players in game
                  </p>

                  <ParticipantsList
                    :participants="game.participants || []"
                    :winner-user-id="game.winnerUserId"
                    :show-score="false"
                    display-field="elo"
                  />

                  <p v-if="!game.participants?.length" class="mt-2 text-xs text-asphalt-muted">
                    Use the search on the right to add players.
                  </p>

                  <div
                    v-if="game.participants?.length"
                    class="mt-3 flex flex-wrap gap-2 text-xs"
                  >
                    <button
                      v-for="participant in game.participants"
                      :key="participant.id"
                      type="button"
                      class="inline-flex items-center gap-1 rounded-full bg-asphalt px-2 py-1 text-snow hover:bg-asphalt-light"
                      @click="removePlayerFromGame(game.id, participant)"
                    >
                      <font-awesome-icon icon="user-minus" />
                      {{ participant.username }}
                    </button>
                  </div>
                </div>

                <div class="space-y-3">
                  <div>
                    <p class="text-xs uppercase tracking-wide text-asphalt-muted mb-2">
                      Add player
                    </p>
                    <FormInput
                      id="player-search-games"
                      v-model="playerSearchTerm"
                      label="Search by username"
                      placeholder="Type a name and press Enter"
                      @keyup.enter="openPlayersForGame(game); performPlayerSearch()"
                    />
                    <div class="mt-2 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 text-snow-dim hover:text-snow"
                        @click="openPlayersForGame(game); performPlayerSearch()"
                      >
                        <font-awesome-icon icon="magnifying-glass" />
                        Search
                      </button>
                    </div>
                  </div>

                  <div class="border border-asphalt-light rounded-lg p-2 min-h-[3rem]">
                    <div v-if="searchingPlayers" class="flex items-center gap-2 text-xs text-snow-dim">
                      <LoadingSpinner size="4" />
                      <span>Searching players…</span>
                    </div>

                    <div
                      v-else-if="searchResults && searchResults.length"
                      class="space-y-1 text-xs"
                    >
                      <button
                        v-for="player in searchResults"
                        :key="player.id"
                        type="button"
                        class="flex w-full items-center justify-between rounded px-2 py-1 hover:bg-asphalt-light text-snow"
                        @click="addPlayerToGame(player)"
                      >
                        <span>{{ player.name }}</span>
                        <span class="text-asphalt-muted tabular-nums">
                          {{ player.elo }} ELO
                        </span>
                      </button>
                    </div>

                    <p
                      v-else
                      class="text-[11px] text-asphalt-muted"
                    >
                      No search results yet. Search to find players to add.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create game modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-court/80"
      @click.self="showCreateModal = false"
    >
      <div class="w-full max-w-md rounded-lg bg-charcoal p-5 border border-asphalt-light">
        <h3 class="text-lg font-semibold text-snow mb-4">
          Create game
        </h3>
        <div class="space-y-3">
          <FormInput
            id="game-name"
            v-model="createForm.name"
            label="Name"
            placeholder="Friday Session"
          />
          <FormInput
            id="game-description"
            v-model="createForm.description"
            label="Description"
            placeholder="Weekly court game"
          />
          <FormInput
            id="game-plannedAt"
            v-model="createForm.plannedAt"
            label="Planned at"
            type="datetime-local"
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
  </section>
</template>

