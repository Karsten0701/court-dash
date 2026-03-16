import apiService, { BASE_URL } from "./apiService.js";

/**
 * High-level games admin service built on top of apiService.
 */
class GamesService {
  async listPlannedGames() {
    const games = await apiService.getGames();

    // Enrich each game with participants by fetching full details
    const withParticipants = await Promise.all(
      games.map(async (game) => {
        try {
          const full = await apiService.getGameById(game.id);
          return { ...game, participants: full.participants || [] };
        } catch {
          return { ...game, participants: [] };
        }
      }),
    );

    return withParticipants;
  }

  async getGameDetails(id) {
    return apiService.getGameById(id);
  }

  async createGame(payload) {
    return apiService.createGame(payload);
  }

  async signupUserForGame(gameId, userId) {
    // Admin endpoint to add arbitrary user to a game
    const url = `${BASE_URL}/games/${encodeURIComponent(
      gameId,
    )}/signup/${encodeURIComponent(userId)}`;
    const response = await apiService.authenticatedFetch(url, {
      method: "POST",
    });
    return apiService.handleResponse(response);
  }

  async removeUserFromGame(gameId, userId) {
    const url = `${BASE_URL}/games/${encodeURIComponent(
      gameId,
    )}/leave/${encodeURIComponent(userId)}`;
    const response = await apiService.authenticatedFetch(url, {
      method: "POST",
    });
    return apiService.handleResponse(response);
  }

  async startGame(gameId) {
    const url = `${BASE_URL}/games/${encodeURIComponent(gameId)}/start`;
    const response = await apiService.authenticatedFetch(url, {
      method: "PUT",
    });
    return apiService.handleResponse(response);
  }

  async endGame(gameId) {
    const url = `${BASE_URL}/games/${encodeURIComponent(gameId)}/end`;
    const response = await apiService.authenticatedFetch(url, {
      method: "PUT",
    });
    return apiService.handleResponse(response);
  }

  async processGame(gameId, payload) {
    const url = `${BASE_URL}/games/${encodeURIComponent(gameId)}/process`;
    const response = await apiService.authenticatedFetch(url, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: apiService.getHeaders(),
    });
    return apiService.handleResponse(response);
  }

  async deleteGame(gameId) {
    // Backend does not expose DELETE /games/:id; surface a clear error.
    throw new Error("Deleting games is not supported by the API");
  }
}

const gamesService = new GamesService();

export default gamesService;

