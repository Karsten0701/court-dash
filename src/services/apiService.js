import appConfig from "@/config/appConfig";

const BASE_URL = appConfig.apiBaseUrl;
class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Gets the headers for a fetch request
   *
   * @param {boolean} isMultipart - Whether the request is multipart
   * @returns {Object} - The headers object
   */
  getHeaders(isMultipart = false) {
    const headers = {};

    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  /**
   * Handles the response from a fetch request
   *
   * @async
   * @param {Response} response - The fetch response
   * @returns {Promise<any>} - The parsed response data
   * @throws {Error} - If the request fails or the response is not successful
   */
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));

      const validationDetails = Array.isArray(error.errors)
        ? error.errors
            .map((item) =>
              item.field ? `${item.field}: ${item.message}` : item.message,
            )
            .filter(Boolean)
            .join("; ")
        : "";
      const errorMessage =
        response.status === 403
          ? "Admin permission required. Log in with an admin account."
          : [error.message, validationDetails].filter(Boolean).join(" - ") ||
            `HTTP error! status: ${response.status}`;
      const err = new Error(errorMessage);
      err.status = response.status;
      err.details = error.errors || null;
      throw err;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return response;
  }

  /**
   * Fetches data from a protected endpoint with automatic token refresh on 401
   *
   * @async
   * @requires Authentication - The user must be logged in to access protected endpoints.
   * @param {string} url - The API endpoint URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} - The fetch response
   * @throws {Error} - If the request fails or the response is not successful
   */
  async authenticatedFetch(url, options = {}) {
    const defaultOptions = {
      credentials: "include", // Send HTTP-only cookies
      headers: this.getHeaders(),
      ...options,
    };

    let response = await fetch(url, defaultOptions);

    // If 401 Unauthorized, try to refresh the token
    if (response.status === 401) {
      try {
        const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: this.getHeaders(),
        });

        if (refreshResponse.ok) {
          // Token refreshed successfully, retry the original request
          response = await fetch(url, defaultOptions);
        } else {
          // Refresh failed, throw 401 error
          const err = new Error("Unauthorized");
          err.status = 401;
          throw err;
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        const err = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }
    }

    return response;
  }

  // ========== AUTH ENDPOINTS ==========

  /**
   * Login a user with email and password
   *
   * @async
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Login response with user data
   * @throws {Error} - If the request fails or the response is not successful
   */
  async login(email, password) {
    return await this.managerLogin({ email, password });
  }

  async managerLogin({ orgId, email, password }) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: this.getHeaders(),
      body: JSON.stringify({ orgId, email, password }),
    });
    return await this.handleResponse(response);
  }

  async adminLogin({ email, password }) {
    const response = await fetch(`${this.baseURL}/auth/admin/login`, {
      method: "POST",
      credentials: "include",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return await this.handleResponse(response);
  }

  /**
   * Logout the current user
   *
   * @async
   * @returns {Promise<Object>} - Logout response
   * @throws {Error} - If the request fails or the response is not successful
   */
  async logout() {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: this.getHeaders(),
    });
    return await this.handleResponse(response);
  }

  /**
   * Refresh the access token using the refresh token cookie
   *
   * @async
   * @returns {Promise<Object>} - New token data
   * @throws {Error} - If the request fails or the response is not successful
   */
  async refreshAccessToken() {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: this.getHeaders(),
    });
    return await this.handleResponse(response);
  }

  /**
   * Get the authenticated user's profile
   *
   * @async
   * @requires Authentication - The user must be logged in to view their profile.
   * @returns {Promise<Object>} - User profile data
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getProfile() {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/auth/profile`,
      {
        method: "GET",
      },
    );
    return await this.handleResponse(response);
  }

  // ========== ORGANIZATION ENDPOINTS ==========

  async createOrg(payload) {
    const response = await fetch(`${this.baseURL}/orgs`, {
      method: "POST",
      credentials: "include",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return await this.handleResponse(response);
  }

  async simulateOrgPayment(orgId, sessionId) {
    const response = await fetch(
      `${this.baseURL}/orgs/${encodeURIComponent(orgId)}/payment/simulate`,
      {
        method: "POST",
        credentials: "include",
        headers: this.getHeaders(),
        body: JSON.stringify({ sessionId }),
      },
    );
    return await this.handleResponse(response);
  }

  async listOrgs() {
    const response = await fetch(`${this.baseURL}/orgs`, {
      method: "GET",
      credentials: "include",
      headers: this.getHeaders(),
    });
    return await this.handleResponse(response);
  }

  async searchOrgs(query) {
    const response = await fetch(
      `${this.baseURL}/orgs/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        credentials: "include",
        headers: this.getHeaders(),
      },
    );
    return await this.handleResponse(response);
  }

  async getMyOrg() {
    const response = await this.authenticatedFetch(`${this.baseURL}/orgs/me`, {
      method: "GET",
    });
    return await this.handleResponse(response);
  }

  async updateMyOrg(payload) {
    const response = await this.authenticatedFetch(`${this.baseURL}/orgs/me`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return await this.handleResponse(response);
  }

  async reactivateMyOrg() {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/orgs/me/reactivate`,
      { method: "POST" },
    );
    return await this.handleResponse(response);
  }

  // ========== PLATFORM ADMIN ENDPOINTS ==========

  async getAdminOrgs() {
    const response = await this.authenticatedFetch(`${this.baseURL}/admin/orgs`, {
      method: "GET",
    });
    return await this.handleResponse(response);
  }

  async getAdminOrg(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/orgs/${encodeURIComponent(id)}`,
      { method: "GET" },
    );
    return await this.handleResponse(response);
  }

  async updateAdminOrg(id, payload) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/orgs/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
    return await this.handleResponse(response);
  }

  async deactivateAdminOrg(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/orgs/${encodeURIComponent(id)}/deactivate`,
      { method: "POST" },
    );
    return await this.handleResponse(response);
  }

  async reactivateAdminOrg(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/orgs/${encodeURIComponent(id)}/reactivate`,
      { method: "POST" },
    );
    return await this.handleResponse(response);
  }

  async deleteAdminOrg(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/orgs/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return await this.handleResponse(response);
  }

  async getAdminOrgManagers(orgId) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/orgs/${encodeURIComponent(orgId)}/managers`,
      { method: "GET" },
    );
    return await this.handleResponse(response);
  }

  async createAdminOrgManager(orgId, payload) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/orgs/${encodeURIComponent(orgId)}/managers`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    return await this.handleResponse(response);
  }

  async updateAdminOrgManager(orgId, managerId, payload) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/orgs/${encodeURIComponent(orgId)}/managers/${encodeURIComponent(managerId)}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
    return await this.handleResponse(response);
  }

  async deleteAdminOrgManager(orgId, managerId) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/orgs/${encodeURIComponent(orgId)}/managers/${encodeURIComponent(managerId)}`,
      { method: "DELETE" },
    );
    return await this.handleResponse(response);
  }

  async getPlatformAdmins() {
    const response = await this.authenticatedFetch(`${this.baseURL}/admin/admins`, {
      method: "GET",
    });
    return await this.handleResponse(response);
  }

  async createPlatformAdmin(payload) {
    const response = await this.authenticatedFetch(`${this.baseURL}/admin/admins`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return await this.handleResponse(response);
  }

  async deletePlatformAdmin(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/admin/admins/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return await this.handleResponse(response);
  }

  // ========== GAMES ENDPOINTS ==========

  /**
   * Get all games
   *
   * @async
   * @returns {Promise<Array>} - List of all games
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getGames() {
    const response = await fetch(`${this.baseURL}/games`, {
      method: "GET",
      credentials: "include",
      headers: this.getHeaders(),
    });

    return await this.handleResponse(response);
  }

  /**
   * Get a specific game details by ID
   *
   * @async
   * @param {number} id - Game ID
   * @returns {Promise<Object>} - Game details
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getGameById(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/${id}`,
      {
        method: "GET",
      },
    );

    return await this.handleResponse(response);
  }

  async getGameSchedule(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/${encodeURIComponent(id)}/schedule`,
      {
        method: "GET",
      },
    );

    return await this.handleResponse(response);
  }

  /**
   * Signs up the current user for a game with the specified ID.
   *
   * @async
   * @requires Authentication - The user must be logged in to sign up for a game.
   * @param {string|number} id - The unique identifier of the game to sign up for.
   * @returns {Promise<any>} The response data from the server after handling the signup request.
   * @throws {Error} If the request fails or the response is not successful.
   */
  async signupGame(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/${id}/signup`,
      {
        method: "POST",
      },
    );

    return await this.handleResponse(response);
  }

  /**
   * Creates a new game with the provided game data.
   *
   * @async
   * @requires Admin - The user must be logged as admin in to create a game.
   * @param {Object} gameData - An object containing the details of the game to be created.
   * @returns {Promise<any>} The response data from the server after handling the create game request.
   * @throws {Error} If the request fails or the response is not successful.
   */
  async createGame(gameData) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/create`,
      {
        method: "POST",
        body: JSON.stringify(gameData),
      },
    );

    return await this.handleResponse(response);
  }

  /**
   * Leave a game the current user is signed up for
   *
   * @async
   * @requires Authentication - The user must be logged in to leave a game.
   * @param {string|number} id - The unique identifier of the game to leave.
   * @returns {Promise<any>} The response data from the server.
   * @throws {Error} If the request fails or the response is not successful.
   */
  async leaveGame(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/${id}/leave`,
      {
        method: "POST",
      },
    );

    return await this.handleResponse(response);
  }

  async signupUserForGame(gameId, userId) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/${encodeURIComponent(
        gameId,
      )}/signup/${encodeURIComponent(userId)}`,
      {
        method: "POST",
      },
    );

    return await this.handleResponse(response);
  }

  async removeUserFromGame(gameId, userId) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/${encodeURIComponent(
        gameId,
      )}/leave/${encodeURIComponent(userId)}`,
      {
        method: "POST",
      },
    );

    return await this.handleResponse(response);
  }

  async startGame(gameId) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/${encodeURIComponent(gameId)}/start`,
      {
        method: "PUT",
      },
    );

    return await this.handleResponse(response);
  }

  async endGame(gameId) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/${encodeURIComponent(gameId)}/end`,
      {
        method: "PUT",
      },
    );

    return await this.handleResponse(response);
  }

  async processGame(gameId, payload) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/games/${encodeURIComponent(gameId)}/process`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );

    return await this.handleResponse(response);
  }

  // ========== HISTORY ENDPOINTS ==========

  /**
   * Get the games-history for the current user
   *
   * @async
   * @requires Authentication - The user must be logged in to view their game history.
   * @returns {Promise<Array>} - List of user's historical games
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getHistoricalGames() {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/history/games`,
      {
        method: "GET",
      },
    );

    return await this.handleResponse(response);
  }

  /**
   * Get a specific game from the user's history by ID
   *
   * @async
   * @requires Authentication - The user must be logged in to view their game history.
   * @param {number} id - Game ID
   * @returns {Promise<Object>} - Game details
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getHistoricalGameById(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/history/games/${id}`,
      {
        method: "GET",
      },
    );

    return await this.handleResponse(response);
  }

  /**
   * Get the historical ELO ratings for the current user
   *
   * @async
   * @requires Authentication - The user must be logged in to view their historical ELO ratings.
   * @returns {Promise<Array>} - List of historical ELO ratings
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getHistoricalElo() {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/history/elo`,
      {
        method: "GET",
      },
    );

    return await this.handleResponse(response);
  }

  /**
   * Get historical ELO ratings for a specific user by ID
   *
   * @async
   * @requires Authentication - The user must be logged in to view historical ELO ratings.
   * @param {string|number} userId - The user ID to get ELO history for
   * @returns {Promise<Array>} - List of historical ELO ratings
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getHistoricalEloByUserId(userId) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/history/elo/${userId}`,
      {
        method: "GET",
      },
    );

    return await this.handleResponse(response);
  }

  // ========== PLAYER ENDPOINTS ==========

  /**
   * Get the public player leaderboard
   *
   * @async
   * @returns {Promise<Array>} - Top players ordered by ELO
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getLeaderboard() {
    const response = await fetch(`${this.baseURL}/player/leaderboard`, {
      method: "GET",
      credentials: "include",
      headers: this.getHeaders(),
    });

    return await this.handleResponse(response);
  }

  /**
   * Search for players by username
   *
   * @async
   * @requires Authentication - The user must be logged in to search for players.
   * @param {string} username - The username to search for
   * @returns {Promise<Array>} - List of players matching the search criteria
   * @throws {Error} - If the request fails or the response is not successful
   */
  async searchPlayers(username) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/player/search/${encodeURIComponent(username)}`,
      {
        method: "GET",
      },
    );

    return await this.handleResponse(response);
  }

  /**
   * Get player profile by ID
   *
   * @async
   * @requires Authentication - The user must be logged in to view player profiles.
   * @param {number} id - Player ID
   * @returns {Promise<Object>} - Player profile details
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getPlayerProfile(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/player/profile/${encodeURIComponent(id)}`,
      {
        method: "GET",
      },
    );

    return await this.handleResponse(response);
  }

  // ========== USERS ENDPOINTS ==========

  /**
   * Get all users (admin only)
   *
   * @async
   * @requires Authentication - Admin role required.
   * @returns {Promise<Array>} - List of users
   * @throws {Error}
   */
  async getUsers() {
    const response = await this.authenticatedFetch(`${this.baseURL}/users`, {
      method: "GET",
    });

    return await this.handleResponse(response);
  }

  /**
   * Register a new user (POST /api/auth/register)
   *
   * @async
   * @param {Object} userData - { email, password, username? }
   * @returns {Promise<Object>} - Created user details
   * @throws {Error} - If the request fails or the response is not successful
   */
  async registerUser({ email, password, username }) {
    const body = { email, password };
    const trimmedUsername = username?.trim();
    if (trimmedUsername) {
      body.username = trimmedUsername;
    }

    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    return await this.handleResponse(response);
  }

  /**
   * Get user by ID (view own account)
   *
   * @async
   * @requires Authentication - The user must be logged in to view their account details.
   * @param {number} id - User ID
   * @returns {Promise<Object>} - User details
   * @throws {Error} - If the request fails or the response is not successful
   */
  async getUserById(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/users/${id}`,
      {
        method: "GET",
      },
    );

    return await this.handleResponse(response);
  }

  /**
   * Update user by ID (update own account)
   *
   * @async
   * @requires Authentication - The user must be logged in to update their account.
   * @param {number} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} - Update response
   * @throws {Error} - If the request fails or the response is not successful
   */
  async updateUser(id, userData) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/users/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(userData),
      },
    );

    return await this.handleResponse(response);
  }

  /**
   * Delete user by ID (delete own account)
   *
   * @async
   * @requires Authentication - The user must be logged in to delete their account.
   * @param {number} id - User ID
   * @returns {Promise<Object>} - Delete response
   * @throws {Error} - If the request fails or the response is not successful
   */
  async deleteUser(id) {
    const response = await this.authenticatedFetch(
      `${this.baseURL}/users/${id}`,
      {
        method: "DELETE",
      },
    );

    return await this.handleResponse(response);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export { BASE_URL };
export default apiService;
