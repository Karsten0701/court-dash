import apiService from "./apiService.js";

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isLoggedIn = false;
    this.loadUserFromStorage();
  }

  setCurrentUser(user) {
    this.currentUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    this.isLoggedIn = true;
    localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
  }

  clearSession() {
    this.currentUser = null;
    this.isLoggedIn = false;
    localStorage.removeItem("currentUser");
  }

  /**
   * Load user data from localStorage if available
   *
   * @returns {void}
   * @throws {Error} - If there is an error parsing the user data from localStorage, it will be removed to prevent future errors.
   */
  loadUserFromStorage() {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.isLoggedIn = true;
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("currentUser");
      }
    }
  }

  /**
   * Login a user with email and password
   *
   * @async
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data
   * @throws {Error} - If the login request fails or the response is not successful, an error will be thrown.
   */
  async login(email, password) {
    try {
      const response = await apiService.login(email, password);

      if (!response.user) {
        throw new Error("Login response missing user data.");
      }

      this.setCurrentUser(response.user);

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      this.clearSession();
      throw error;
    }
  }

  /**
   * Logout the current user
   *
   * @async
   * @requires Authentication - The user must be logged in to log out.
   * @returns {Promise<Object>} - Logout response
   * @throws {Error} - If the logout request fails, an error will be thrown. Local user data will be cleared regardless of API call success to ensure the user is logged out on the client side.
   */
  async logout() {
    try {
      await apiService.logout();
      this.clearSession();
      return { message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      // Clear local data even if API call fails
      this.clearSession();
      throw error;
    }
  }

  /**
   * Check if user is authenticated (client-side only).
   * This only checks local state and may be out of sync with the server.
   * For critical actions, use verifyAuthentication() to check with the server.
   *
   * @returns {boolean} - True if authenticated (client-side state)
   * @throws {Error} - If there is an error accessing localStorage, it will be caught and logged, and the function will return false to indicate the user is not authenticated.
   */
  isAuthenticated() {
    return this.isLoggedIn && this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser?.role === "admin";
  }

  /**
   * Check if user is logged in with JWT token validation.
   * Attempts to validate token, refresh if needed, or redirect to login.
   *
   * @async
   * @requires Authentication - The user must be logged in to check token validity.
   * @returns {Promise<boolean>} - True if authenticated with valid token
   * @throws {Error} - If there is an error during token validation or refresh, it will be caught and logged, and the function will return false to indicate the user is not authenticated.
   */
  async isLoggedInWithTokenCheck() {
    try {
      return await this.verifyAuthentication();
    } catch (error) {
      console.error("Token validation failed:", error);
    }

    this.clearSession();
    return false;
  }

  async requireAdminSession() {
    const authenticated = await this.isLoggedInWithTokenCheck();
    return authenticated && this.isAdmin();
  }

  /**
   * Verify authentication status with the server.
   * Makes a request to the server to confirm session validity.
   *
   * @async
   * @requires Authentication - The user must be logged in to verify authentication.
   * @returns {Promise<boolean>} - True if authenticated (server-side)
   * @throws {Error} - If there is an error during the authentication verification process, it will be caught and logged, and the function will return false to indicate the user is not authenticated.
   */
  async verifyAuthentication() {
    try {
      // Validate the JWT token by fetching the user's profile
      const userData = await apiService.getProfile();

      if (userData && userData.id) {
        this.setCurrentUser(userData);
        return true;
      } else {
        this.clearSession();
        return false;
      }
    } catch (error) {
      console.error("Authentication verification failed:", error);
      // Don't clear state here - let the caller decide
      throw error;
    }
  }

  /**
   * Get current user data
   *
   * @requires Authentication - The user must be logged in to access current user data.
   * @returns {Object|null} - Current user data or null
   * @throws {Error} - If there is an error accessing localStorage, it will be caught and logged, and the function will return null to indicate that the user data is not available.
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Refresh access token
   *
   * @async
   * @requires Authentication - The user must be logged in to refresh the token.
   * @returns {Promise<Object>} - New token data
   * @throws {Error} - If there is an error during the token refresh process, it will be caught and logged, the user will be logged out, and the error will be re-thrown to indicate that the token refresh failed.
   */
  async refreshToken() {
    try {
      return await apiService.refreshAccessToken();
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearSession();
      throw error;
    }
  }
}

export default new AuthService();
