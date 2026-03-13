import apiService from "./apiService.js";

/**
 * High-level players admin service built on top of apiService.
 * Uses /player and /users endpoints for listing and CRUD.
 */
class PlayersService {
  async listLeaderboard() {
    return apiService.getLeaderboard();
  }

  async searchPlayers(username) {
    if (!username) return [];
    return apiService.searchPlayers(username);
  }

  async getPlayerProfile(id) {
    return apiService.getPlayerProfile(id);
  }

  async createPlayer({ email, password, username }) {
    return apiService.registerUser({ email, password, username });
  }

  async updatePlayer(id, payload) {
    return apiService.updateUser(id, payload);
  }

  async deletePlayer(id) {
    return apiService.deleteUser(id);
  }
}

const playersService = new PlayersService();

export default playersService;

