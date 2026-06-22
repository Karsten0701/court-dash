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
      orgId: user.orgId ?? null,
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

  async login(email, password) {
    return await this.managerLogin({ email, password });
  }

  async managerLogin({ orgId, email, password }) {
    try {
      const response = await apiService.managerLogin({ orgId, email, password });

      if (!response.user) {
        throw new Error("Login response missing user data.");
      }

      this.setCurrentUser(response.user);

      if (!this.isManager()) {
        await this.logout().catch(() => {});
        throw new Error("Manager access is required for this dashboard.");
      }

      return response;
    } catch (error) {
      console.error("Manager login failed:", error);
      this.clearSession();
      throw error;
    }
  }

  async adminLogin({ email, password }) {
    try {
      const response = await apiService.adminLogin({ email, password });

      if (!response.user) {
        throw new Error("Login response missing user data.");
      }

      this.setCurrentUser(response.user);

      if (!this.isAdmin()) {
        await this.logout().catch(() => {});
        throw new Error("Admin access is required for this dashboard.");
      }

      return response;
    } catch (error) {
      console.error("Admin login failed:", error);
      this.clearSession();
      throw error;
    }
  }

  async logout() {
    try {
      await apiService.logout();
      this.clearSession();
      return { message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      this.clearSession();
      throw error;
    }
  }

  isAuthenticated() {
    return this.isLoggedIn && this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser?.role === "admin";
  }

  isManager() {
    return this.currentUser?.role === "manager";
  }

  canAccessDashboard() {
    return this.isManager() || this.isAdmin();
  }

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

  async requireDashboardSession() {
    const authenticated = await this.isLoggedInWithTokenCheck();
    return authenticated && this.canAccessDashboard();
  }

  async verifyAuthentication() {
    try {
      const userData = await apiService.getProfile();

      if (userData && userData.id) {
        this.setCurrentUser(userData);
        return true;
      }

      this.clearSession();
      return false;
    } catch (error) {
      console.error("Authentication verification failed:", error);
      throw error;
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

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
