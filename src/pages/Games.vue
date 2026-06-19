<script setup>
import { computed, onMounted, ref } from "vue";
import gamesService from "@/services/gamesService.js";
import playersService from "@/services/playersService.js";
import apiService from "@/services/apiService.js";
import orgService from "@/services/orgService.js";
import { useApiRequest } from "@/composables/useApiRequest.js";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import EmptyState from "@/components/EmptyState.vue";
import FormInput from "@/components/FormInput.vue";
import ParticipantsList from "@/components/ParticipantsList.vue";
import { formatDate } from "@/utils/formatters.js";

const expandedGameIds = ref(new Set());
const schedulesByGameId = ref({});
const loadingDetailsFor = ref(null);
const processResult = ref(null);
const actionLoadingByGameId = ref({});
const processingGame = ref(false);
let processCloseTimer = null;
const historyGames = ref([]);
const historyLoading = ref(false);
const historyError = ref("");
const isReadOnly = computed(() => orgService.isInactive.value);

const {
  data: games,
  loading,
  error,
  execute: fetchGames,
} = useApiRequest(() => gamesService.listAllGames(), {
  immediate: true,
  maxRetries: 1,
});

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

const actionKey = (gameId, action) => `${gameId}:${action}`;

const setActionLoading = (gameId, action, value) => {
  actionLoadingByGameId.value = {
    ...actionLoadingByGameId.value,
    [actionKey(gameId, action)]: value,
  };
};

const isActionLoading = (gameId, action) =>
  !!actionLoadingByGameId.value[actionKey(gameId, action)];

const toIsoDateTime = (value) => {
  if (!value) return undefined;
  const normalizedValue = value.length === 16 ? `${value}:00` : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Choose a valid planned date and time.");
  }
  return date.toISOString();
};

const replaceGame = (gameId, patch) => {
  games.value = (games.value || []).map((game) =>
    game.id === gameId ? { ...game, ...patch } : game,
  );
  historyGames.value = (historyGames.value || []).map((game) =>
    game.id === gameId ? { ...game, ...patch } : game,
  );
};

const fetchHistoryGames = async () => {
  historyLoading.value = true;
  historyError.value = "";
  try {
    const response = await apiService.getHistoricalGames();
    const rawGames = response?.games || response || [];
    historyGames.value = rawGames.filter((game) =>
      ["ended", "processed"].includes((game.status || "").toLowerCase()),
    );
  } catch (err) {
    historyError.value = err.message || "Failed to load games history";
  } finally {
    historyLoading.value = false;
  }
};

const refreshAllGames = async () => {
  await Promise.all([fetchGames(), fetchHistoryGames()]);
};

const refreshGameDetails = async (gameId) => {
  loadingDetailsFor.value = gameId;
  try {
    const [details, schedule] = await Promise.all([
      gamesService.getGameDetails(gameId),
      gamesService.getGameSchedule(gameId).catch(() => null),
    ]);
    replaceGame(gameId, {
      ...details,
      signupCount: details.participants?.length ?? details.signupCount,
    });
    if (schedule) {
      schedulesByGameId.value = {
        ...schedulesByGameId.value,
        [gameId]: schedule,
      };
    }
    return details;
  } finally {
    loadingDetailsFor.value = null;
  }
};

const toggleExpand = async (game) => {
  const set = new Set(expandedGameIds.value);
  if (set.has(game.id)) {
    set.delete(game.id);
  } else {
    set.add(game.id);
    await refreshGameDetails(game.id).catch((err) => {
      showToast("error", err.message || "Failed to load game details");
    });
  }
  expandedGameIds.value = set;
};

const openCreateModal = () => {
  if (isReadOnly.value) {
    showToast("error", "Organization is inactive. Complete payment to reactivate before making changes.");
    return;
  }

  createForm.value = { name: "", description: "", plannedAt: "" };
  showCreateModal.value = true;
};

const submitCreate = async () => {
  if (isReadOnly.value) {
    showToast("error", "Organization is inactive. Complete payment to reactivate before making changes.");
    return;
  }

  try {
    const plannedAt = toIsoDateTime(createForm.value.plannedAt);
    const payload = {
      name: createForm.value.name || undefined,
      description: createForm.value.description || undefined,
      ...(plannedAt ? { plannedAt } : {}),
    };
    await gamesService.createGame(payload);
    showCreateModal.value = false;
    showToast("success", "Game created");
    await refreshAllGames();
  } catch (err) {
    showToast("error", err.message || "Failed to create game");
  }
};

const playerSearchByGameId = ref({});
const playerResultsByGameId = ref({});
const playerSearchLoadingByGameId = ref({});
const playerSearchErrorByGameId = ref({});

const setPlayerSearch = (gameId, value) => {
  playerSearchByGameId.value = {
    ...playerSearchByGameId.value,
    [gameId]: value,
  };
};

const isPlayerInGame = (game, playerId) =>
  (game.participants || []).some((participant) => participant.userId === playerId);

const performPlayerSearch = async (game) => {
  const term = (playerSearchByGameId.value[game.id] || "").trim();
  if (!term) {
    playerResultsByGameId.value = {
      ...playerResultsByGameId.value,
      [game.id]: [],
    };
    return;
  }

  playerSearchLoadingByGameId.value = {
    ...playerSearchLoadingByGameId.value,
    [game.id]: true,
  };
  playerSearchErrorByGameId.value = {
    ...playerSearchErrorByGameId.value,
    [game.id]: null,
  };

  try {
    const results = await playersService.searchPlayers(term);
    playerResultsByGameId.value = {
      ...playerResultsByGameId.value,
      [game.id]: results,
    };
  } catch (err) {
    playerSearchErrorByGameId.value = {
      ...playerSearchErrorByGameId.value,
      [game.id]: err.message || "Failed to search players",
    };
  } finally {
    playerSearchLoadingByGameId.value = {
      ...playerSearchLoadingByGameId.value,
      [game.id]: false,
    };
  }
};

const addPlayerToGame = async (game, player) => {
  if (isPlayerInGame(game, player.id)) return;
  if (isReadOnly.value) {
    showToast("error", "Organization is inactive. Complete payment to reactivate before making changes.");
    return;
  }

  try {
    await gamesService.signupUserForGame(game.id, player.id);
    showToast("success", `Added ${player.name} to game`);
    await refreshGameDetails(game.id);
  } catch (err) {
    showToast("error", err.message || "Failed to add player");
  }
};

const removePlayerFromGame = async (gameId, participant) => {
  if (isReadOnly.value) {
    showToast("error", "Organization is inactive. Complete payment to reactivate before making changes.");
    return;
  }

  try {
    await gamesService.removeUserFromGame(gameId, participant.userId);
    showToast("success", `Removed ${participant.username} from game`);
    await refreshGameDetails(gameId);
  } catch (err) {
    showToast("error", err.message || "Failed to remove player");
  }
};

const runLifecycleAction = async (game, action) => {
  if (isReadOnly.value) {
    showToast("error", "Organization is inactive. Complete payment to reactivate before making changes.");
    return;
  }

  setActionLoading(game.id, action, true);
  try {
    const actionMap = {
      start: gamesService.startGame.bind(gamesService),
      end: gamesService.endGame.bind(gamesService),
    };
    const updated = await actionMap[action](game.id);
    replaceGame(game.id, updated);
    await refreshGameDetails(game.id).catch(() => {});
    await fetchHistoryGames();
    showToast("success", `Game ${action === "start" ? "started" : "ended"}`);
  } catch (err) {
    showToast("error", err.message || `Failed to ${action} game`);
  } finally {
    setActionLoading(game.id, action, false);
  }
};

const showProcessModal = ref(false);
const processForm = ref({
  game: null,
  winnerId: "",
  scores: [],
});

const getNumericScore = (value) => {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const syncWinnerWithScores = () => {
  const scored = processForm.value.scores
    .map((score) => ({
      userId: Number(score.userId),
      score: getNumericScore(score.score),
    }))
    .filter((entry) => entry.score != null);

  if (!scored.length) return;

  const maxScore = Math.max(...scored.map((entry) => entry.score));
  const leaders = scored.filter((entry) => entry.score === maxScore);
  const currentWinnerId = Number(processForm.value.winnerId);

  if (leaders.some((entry) => entry.userId === currentWinnerId)) return;
  processForm.value.winnerId = String(leaders[0].userId);
};

const openProcessModal = (game) => {
  if (isReadOnly.value) {
    showToast("error", "Organization is inactive. Complete payment to reactivate before making changes.");
    return;
  }

  const participants = game.participants || [];
  if (processCloseTimer) {
    clearTimeout(processCloseTimer);
    processCloseTimer = null;
  }
  processResult.value = null;
  processForm.value = {
    game,
    winnerId: "",
    scores: participants.map((participant) => ({
      userId: participant.userId,
      username: participant.username,
      score: "",
    })),
  };
  syncWinnerWithScores();
  showProcessModal.value = true;
};

const getEloChangeValue = (change) => {
  if (change.change != null) return Number(change.change);
  if (change.oldElo != null && change.newElo != null) {
    return Number(change.newElo) - Number(change.oldElo);
  }
  return 0;
};

const formatEloChange = (change) => {
  const value = getEloChangeValue(change);
  return `${value > 0 ? "+" : ""}${value}`;
};

const eloChangeClass = (change) =>
  getEloChangeValue(change) >= 0 ? "text-status-processed" : "text-danger";

const getParticipantName = (userId) => {
  const score = processForm.value.scores.find(
    (item) => Number(item.userId) === Number(userId),
  );
  return score?.username || `User #${userId}`;
};

const closeProcessModal = () => {
  if (processCloseTimer) {
    clearTimeout(processCloseTimer);
    processCloseTimer = null;
  }
  showProcessModal.value = false;
};

const submitProcessGame = async () => {
  const game = processForm.value.game;
  if (!game) return;
  if (isReadOnly.value) {
    showToast("error", "Organization is inactive. Complete payment to reactivate before making changes.");
    return;
  }

  try {
    processingGame.value = true;
    syncWinnerWithScores();
    if (!processForm.value.winnerId) {
      showToast("error", "Select a winner before processing");
      return;
    }

    const hasMissingScores = processForm.value.scores.some(
      (score) => score.score === "" || Number.isNaN(Number(score.score)),
    );
    if (hasMissingScores) {
      showToast("error", "Enter a score for every participant");
      return;
    }

    const payload = {
      winnerId: Number(processForm.value.winnerId),
      scores: processForm.value.scores.map((score) => ({
        userId: Number(score.userId),
        score: Number(score.score),
      })),
    };
    const result = await gamesService.processGame(game.id, payload);
    processResult.value = result;
    await refreshGameDetails(game.id).catch(() => {});
    replaceGame(game.id, {
      status: "processed",
      winnerUserId: payload.winnerId,
    });
    await fetchHistoryGames();
    showToast("success", "Game processed");
    processCloseTimer = setTimeout(() => {
      showProcessModal.value = false;
      processCloseTimer = null;
    }, 5000);
  } catch (err) {
    showToast("error", err.message || "Failed to process game");
  } finally {
    processingGame.value = false;
  }
};

const statusClasses = (status = "planned") => {
  const normalized = status.toLowerCase();
  if (normalized === "started") return "bg-status-playing-bg text-status-playing";
  if (normalized === "ended") return "bg-status-ended-bg text-status-delivering";
  if (normalized === "processed") return "bg-status-processed-bg text-status-processed";
  return "bg-status-pending-bg text-status-pending";
};

const sortedGames = computed(() =>
  (games.value || []).slice().sort((a, b) => {
    const aTs = Date.parse(a.endedAt || a.startedAt || a.plannedAt || a.createdAt || 0);
    const bTs = Date.parse(b.endedAt || b.startedAt || b.plannedAt || b.createdAt || 0);
    return bTs - aTs;
  }),
);

const sortedHistoryGames = computed(() =>
  (historyGames.value || []).slice().sort((a, b) => {
    const aTs = Date.parse(a.endedAt || a.startedAt || a.plannedAt || a.createdAt || 0);
    const bTs = Date.parse(b.endedAt || b.startedAt || b.plannedAt || b.createdAt || 0);
    return bTs - aTs;
  }),
);

onMounted(() => {
  fetchHistoryGames();
});
</script>

<template>
  <section class="space-y-5">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs uppercase tracking-wide text-asphalt-muted">
          Games
        </p>
        <p class="text-sm text-snow-dim">
          Create games, manage players, run lifecycle, and view full game history.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 btn-violet text-xs"
        :disabled="isReadOnly"
        :title="isReadOnly ? 'Organization is read-only until payment reactivation.' : ''"
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

    <div class="glass-card p-4 space-y-4">
      <div class="flex items-center justify-between text-xs text-asphalt-muted">
        <span>
          {{ sortedGames.length }} game<span v-if="sortedGames.length !== 1">s</span>
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-2 text-snow-dim hover:text-snow"
          @click="refreshAllGames"
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
            title="No games found"
            message="Create a new game to get started. Ended and processed games show here too."
            action-label="Create game"
            action-icon="plus"
            @action="openCreateModal"
          />
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="game in sortedGames"
            :key="game.id"
            class="rounded-lg border border-white/5 bg-charcoal overflow-hidden"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-asphalt-light/60"
              @click="toggleExpand(game)"
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
                  <p class="mt-1 text-[11px] text-asphalt-muted">
                    {{ formatDate(game.plannedAt) || "No planned date" }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-xs text-asphalt-muted">
                <span
                  class="rounded-full px-2 py-0.5 font-medium capitalize"
                  :class="statusClasses(game.status)"
                >
                  {{ game.status || "planned" }}
                </span>
                <span>
                  {{ game.signupCount ?? 0 }} player<span v-if="(game.signupCount ?? 0) !== 1">s</span>
                </span>
              </div>
            </button>

            <div v-if="expandedGameIds.has(game.id)" class="border-t border-white/5">
              <div class="grid gap-4 p-4 lg:grid-cols-[1.1fr,0.9fr]">
                <div class="rounded-lg border border-white/5 bg-asphalt/30 p-3">
                  <p class="text-xs uppercase tracking-wide text-asphalt-muted mb-2">
                    Players in game
                  </p>

                  <ParticipantsList
                    :participants="game.participants || []"
                    :winner-user-id="game.winnerUserId"
                    :show-score="true"
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
                      class="inline-flex items-center gap-1 rounded-full bg-asphalt px-2 py-1 text-snow hover:bg-asphalt-light disabled:cursor-not-allowed disabled:opacity-40"
                      :disabled="isReadOnly"
                      @click="removePlayerFromGame(game.id, participant)"
                    >
                      <font-awesome-icon icon="user-minus" />
                      {{ participant.username }}
                    </button>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="rounded-lg border border-white/5 bg-asphalt/30 p-3">
                    <p class="text-xs uppercase tracking-wide text-asphalt-muted mb-2">
                      Game actions
                    </p>
                    <div class="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        class="btn-violet text-xs disabled:cursor-not-allowed disabled:opacity-40"
                        :disabled="isReadOnly || (game.status || 'planned') !== 'planned' || isActionLoading(game.id, 'start')"
                        @click="runLifecycleAction(game, 'start')"
                      >
                        {{ isActionLoading(game.id, 'start') ? "Starting..." : "Start" }}
                      </button>
                      <button
                        type="button"
                        class="rounded bg-asphalt px-3 py-2 text-snow hover:bg-asphalt-light disabled:cursor-not-allowed disabled:opacity-40"
                        :disabled="isReadOnly || game.status !== 'started' || isActionLoading(game.id, 'end')"
                        @click="runLifecycleAction(game, 'end')"
                      >
                        {{ isActionLoading(game.id, 'end') ? "Ending..." : "End" }}
                      </button>
                      <button
                        type="button"
                        class="rounded bg-turf px-3 py-2 text-white hover:bg-turf-hover disabled:cursor-not-allowed disabled:opacity-40"
                        :disabled="isReadOnly || game.status !== 'ended' || !(game.participants || []).length"
                        @click="openProcessModal(game)"
                      >
                        Process scores
                      </button>
                    </div>
                    <p
                      v-if="game.status === 'processed'"
                      class="mt-2 text-[11px] text-status-processed"
                    >
                      This game is processed. ELO has already been applied.
                    </p>
                    <p
                      v-else-if="(game.status || 'planned') === 'planned'"
                      class="mt-2 text-[11px] text-asphalt-muted"
                    >
                      Start the game when players are ready.
                    </p>
                    <p
                      v-if="loadingDetailsFor === game.id"
                      class="mt-2 text-[11px] text-asphalt-muted"
                    >
                      Loading game details...
                    </p>
                  </div>

                  <div class="rounded-lg border border-white/5 bg-asphalt/30 p-3">
                    <p class="text-xs uppercase tracking-wide text-asphalt-muted mb-2">
                      Add player
                    </p>
                    <FormInput
                      :id="`player-search-game-${game.id}`"
                      :model-value="playerSearchByGameId[game.id] || ''"
                      label="Search by username"
                      placeholder="Type a name and press Enter"
                      @update:model-value="setPlayerSearch(game.id, $event)"
                      @keyup.enter="performPlayerSearch(game)"
                    />
                    <div class="mt-2 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 text-snow-dim hover:text-snow"
                        @click="performPlayerSearch(game)"
                      >
                        <font-awesome-icon icon="magnifying-glass" />
                        Search
                      </button>
                    </div>
                  </div>

                  <div class="border border-white/5 rounded-lg p-2 min-h-[3rem]">
                    <div
                      v-if="playerSearchLoadingByGameId[game.id]"
                      class="flex items-center gap-2 text-xs text-snow-dim"
                    >
                      <LoadingSpinner size="4" />
                      <span>Searching players…</span>
                    </div>

                    <p
                      v-else-if="playerSearchErrorByGameId[game.id]"
                      class="text-[11px] text-danger"
                    >
                      {{ playerSearchErrorByGameId[game.id] }}
                    </p>

                    <div
                      v-else-if="playerResultsByGameId[game.id]?.length"
                      class="space-y-1 text-xs"
                    >
                      <button
                        v-for="player in playerResultsByGameId[game.id]"
                        :key="player.id"
                        type="button"
                        class="flex w-full items-center justify-between rounded px-2 py-1 text-snow hover:bg-asphalt-light disabled:cursor-not-allowed disabled:opacity-50"
                        :disabled="isReadOnly || isPlayerInGame(game, player.id)"
                        @click="addPlayerToGame(game, player)"
                      >
                        <span>{{ player.name }}</span>
                        <span class="text-asphalt-muted tabular-nums">
                          <template v-if="isPlayerInGame(game, player.id)">
                            Already in game
                          </template>
                          <template v-else>
                            {{ player.elo }} ELO
                          </template>
                        </span>
                      </button>
                    </div>

                    <p
                      v-else-if="playerSearchByGameId[game.id]"
                      class="text-[11px] text-asphalt-muted"
                    >
                      No players found for this search.
                    </p>
                    <p v-else class="text-[11px] text-asphalt-muted">
                      Search here to add players to this game.
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-if="schedulesByGameId[game.id]?.rounds?.length"
                class="border-t border-white/5 p-4"
              >
                <p class="mb-3 text-xs uppercase tracking-wide text-asphalt-muted">
                  Schedule
                </p>
                <div class="grid gap-3 md:grid-cols-2">
                  <div
                    v-for="round in schedulesByGameId[game.id].rounds"
                    :key="round.round"
                    class="rounded-lg border border-white/5 bg-asphalt/40 p-3 text-xs"
                  >
                    <p class="mb-2 font-medium text-snow">
                      Round {{ round.round }}
                    </p>
                    <div
                      v-for="match in round.matches"
                      :key="`${round.round}-${match.field}`"
                      class="flex justify-between gap-3 border-t border-white/5 py-2 first:border-t-0 first:pt-0"
                    >
                      <span class="text-snow-dim">Field {{ match.field }}</span>
                      <span class="text-right text-snow">
                        {{ match.playerA?.username }} vs {{ match.playerB?.username }}
                      </span>
                    </div>
                    <p
                      v-if="round.sittingOut?.length"
                      class="mt-2 text-asphalt-muted"
                    >
                      Sitting out:
                      {{ round.sittingOut.map((p) => p.username).join(", ") }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card p-4 space-y-4">
      <div class="flex items-center justify-between text-xs text-asphalt-muted">
        <span>
          Games History ({{ sortedHistoryGames.length }})
        </span>
      </div>

      <div v-if="historyLoading" class="py-12 flex justify-center">
        <LoadingSpinner size="6" />
      </div>

      <ErrorMessage
        v-else-if="historyError"
        :title="'Failed to load games history'"
        :message="historyError"
        retry-label="Retry"
        @retry="fetchHistoryGames"
      />

      <div v-else-if="!sortedHistoryGames.length">
        <EmptyState
          icon="clipboard-list"
          title="No historical games yet"
          message="Ended and processed games appear here."
        />
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="game in sortedHistoryGames"
          :key="`history-${game.id}`"
          class="rounded-lg border border-white/5 bg-charcoal overflow-hidden"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-asphalt-light/60"
            @click="toggleExpand(game)"
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
                <p class="mt-1 text-[11px] text-asphalt-muted">
                  {{ formatDate(game.endedAt || game.startedAt || game.createdAt) || "-" }}
                </p>
              </div>
            </div>
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
              :class="statusClasses(game.status)"
            >
              {{ game.status || "ended" }}
            </span>
          </button>

          <div v-if="expandedGameIds.has(game.id)" class="border-t border-white/5 p-4">
            <p class="text-xs uppercase tracking-wide text-asphalt-muted mb-2">
              Players
            </p>
            <ParticipantsList
              :participants="game.participants || []"
              :winner-user-id="game.winnerUserId"
              :show-score="true"
              display-field="elo"
            />
            <p
              v-if="loadingDetailsFor === game.id"
              class="mt-3 text-[11px] text-asphalt-muted"
            >
              Loading game details...
            </p>
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
      <div class="w-full max-w-md glass-card p-5">
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
            class="inline-flex items-center gap-2 btn-violet text-xs"
            :disabled="isReadOnly"
            @click="submitCreate"
          >
            <font-awesome-icon icon="check" />
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- Process game modal -->
    <div
      v-if="showProcessModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-court/80 px-4"
      @click.self="closeProcessModal"
    >
      <div class="w-full max-w-xl glass-card p-5">
        <h3 class="text-lg font-semibold text-snow mb-1">
          Process scores
        </h3>
        <p class="mb-4 text-sm text-snow-dim">
          Select the winner and enter the final score. The winner gains ELO;
          the other players lose ELO automatically.
        </p>

        <div class="space-y-4">
          <div>
            <label for="winner-id" class="block text-sm font-medium text-snow">
              Winner
            </label>
            <select
              id="winner-id"
              v-model="processForm.winnerId"
              class="mt-1 block w-full rounded-md border border-white/5 bg-asphalt px-3 py-2 text-snow shadow-sm focus:border-racket focus:outline-none focus:ring-racket"
            >
              <option
                v-for="score in processForm.scores"
                :key="score.userId"
                :value="String(score.userId)"
              >
                {{ score.username }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-asphalt-muted">
              Scores
            </p>
            <div
              v-for="score in processForm.scores"
              :key="score.userId"
              class="grid grid-cols-[1fr,7rem] items-center gap-3 rounded border border-white/5 bg-asphalt/40 px-3 py-2"
            >
              <span class="text-sm text-snow">{{ score.username }}</span>
              <input
                v-model="score.score"
                type="number"
                min="0"
                step="1"
                required
                class="rounded-md border border-white/5 bg-asphalt px-3 py-2 text-sm text-snow focus:border-racket focus:outline-none"
                placeholder="0"
                @input="syncWinnerWithScores"
              />
            </div>
          </div>

          <div
            v-if="processResult?.eloChanges?.length"
            class="rounded-lg border border-white/5 bg-asphalt/40 p-3"
          >
            <p class="mb-2 text-xs uppercase tracking-wide text-asphalt-muted">
              ELO changes
            </p>
            <div
              v-for="change in processResult.eloChanges"
              :key="change.userId"
              class="flex justify-between py-1 text-sm"
            >
              <span class="text-snow">{{ getParticipantName(change.userId) }}</span>
              <span
                :class="eloChangeClass(change)"
              >
                {{ formatEloChange(change) }}
                ({{ change.oldElo }} -> {{ change.newElo }})
              </span>
            </div>
          </div>
        </div>

        <div class="mt-5 flex justify-end gap-2 text-xs">
          <button
            type="button"
            class="rounded bg-asphalt-light px-3 py-2 text-snow hover:bg-asphalt"
            @click="closeProcessModal"
          >
            Close
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 btn-violet text-xs disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isReadOnly || processingGame"
            @click="submitProcessGame"
          >
            <font-awesome-icon icon="check" />
            {{ processingGame ? "Processing..." : "Process game" }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
