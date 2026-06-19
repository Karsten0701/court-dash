import { computed, ref } from "vue";
import apiService from "./apiService.js";

const currentOrg = ref(null);
const loading = ref(false);
const error = ref(null);
const reactivating = ref(false);
const updating = ref(false);

class OrgService {
  org = currentOrg;
  loading = loading;
  error = error;
  reactivating = reactivating;
  updating = updating;

  isInactive = computed(() => currentOrg.value?.status === "inactive");

  clear() {
    currentOrg.value = null;
    error.value = null;
    loading.value = false;
    reactivating.value = false;
    updating.value = false;
  }

  async loadMyOrg() {
    loading.value = true;
    error.value = null;

    try {
      currentOrg.value = await apiService.getMyOrg();
      return currentOrg.value;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async reactivateMyOrg() {
    reactivating.value = true;
    error.value = null;

    try {
      const response = await apiService.reactivateMyOrg();
      currentOrg.value = response.org || response;
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      reactivating.value = false;
    }
  }

  async updateMyOrg(payload) {
    updating.value = true;
    error.value = null;

    try {
      currentOrg.value = await apiService.updateMyOrg(payload);
      return currentOrg.value;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      updating.value = false;
    }
  }
}

export default new OrgService();
