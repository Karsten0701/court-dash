import apiService from "./apiService.js";
import authService from "./authService.js";

/**
 * High-level players admin service built on top of apiService.
 * Uses /player and /users endpoints for listing and CRUD.
 */
class PlayersService {
  async listLeaderboard() {
    return apiService.getLeaderboard();
  }

  async listUsers() {
    return apiService.getUsers();
  }

  async searchPlayers(username) {
    if (!username) return [];
    return apiService.searchPlayers(username);
  }

  async getPlayerProfile(id) {
    return apiService.getPlayerProfile(id);
  }

  async createPlayer({ email, password, username }) {
    const orgId = authService.getCurrentUser()?.orgId;

    if (!orgId) {
      throw new Error("Cannot create a user without an organization.");
    }

    return apiService.registerUser({ orgId, email, password, username });
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
