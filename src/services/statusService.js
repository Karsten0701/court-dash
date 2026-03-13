import { BASE_URL } from "./apiService.js";

class StatusService {
  async getApiHealth() {
    const startedAt = performance.now();

    try {
      const response = await fetch(`${BASE_URL}/health`, {
        method: "GET",
        credentials: "include",
      });

      const duration = performance.now() - startedAt;

      const json = await response
        .json()
        .catch(() => ({ message: response.statusText }));

      return {
        ok: response.ok,
        status: response.status,
        duration,
        payload: json,
      };
    } catch (error) {
      const duration = performance.now() - startedAt;
      return {
        ok: false,
        status: null,
        duration,
        payload: { message: error.message || "Network error" },
      };
    }
  }
}

const statusService = new StatusService();

export default statusService;

