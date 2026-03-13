import apiService, { BASE_URL } from "./apiService.js";

/**
 * High-level games admin service built on top of apiService.
 */
class GamesService {
  async listPlannedGames() {
    return apiService.getGames();
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
    // Not formally documented; implemented defensively with error handling in UI.
    const url = `${BASE_URL}/games/${encodeURIComponent(gameId)}`;
    const response = await apiService.authenticatedFetch(url, {
      method: "DELETE",
    });
    return apiService.handleResponse(response);
  }
}

const gamesService = new GamesService();

export default gamesService;

