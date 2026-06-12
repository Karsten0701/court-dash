import apiService from "./apiService.js";

/**
 * High-level games admin service built on top of apiService.
 */
class GamesService {
  async listAdminGames() {
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

  async listAllGames() {
    return this.listAdminGames();
  }

  async listPlannedGames() {
    return this.listAllGames();
  }

  async getGameDetails(id) {
    return apiService.getGameById(id);
  }

  async getGameSchedule(id) {
    return apiService.getGameSchedule(id);
  }

  async createGame(payload) {
    return apiService.createGame(payload);
  }

  async signupUserForGame(gameId, userId) {
    return apiService.signupUserForGame(gameId, userId);
  }

  async removeUserFromGame(gameId, userId) {
    return apiService.removeUserFromGame(gameId, userId);
  }

  async startGame(gameId) {
    return apiService.startGame(gameId);
  }

  async endGame(gameId) {
    return apiService.endGame(gameId);
  }

  async processGame(gameId, payload) {
    return apiService.processGame(gameId, payload);
  }
}

const gamesService = new GamesService();

export default gamesService;

