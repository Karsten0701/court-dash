import apiService from "./apiService.js";

class AdminService {
  listOrgs() {
    return apiService.getAdminOrgs();
  }

  getOrg(id) {
    return apiService.getAdminOrg(id);
  }

  updateOrg(id, payload) {
    return apiService.updateAdminOrg(id, payload);
  }

  deactivateOrg(id) {
    return apiService.deactivateAdminOrg(id);
  }

  reactivateOrg(id) {
    return apiService.reactivateAdminOrg(id);
  }

  deleteOrg(id) {
    return apiService.deleteAdminOrg(id);
  }

  listManagers(orgId) {
    return apiService.getAdminOrgManagers(orgId);
  }

  createManager(orgId, payload) {
    return apiService.createAdminOrgManager(orgId, payload);
  }

  updateManager(orgId, managerId, payload) {
    return apiService.updateAdminOrgManager(orgId, managerId, payload);
  }

  deleteManager(orgId, managerId) {
    return apiService.deleteAdminOrgManager(orgId, managerId);
  }

  listAdmins() {
    return apiService.getPlatformAdmins();
  }

  createAdmin(payload) {
    return apiService.createPlatformAdmin(payload);
  }

  deleteAdmin(id) {
    return apiService.deletePlatformAdmin(id);
  }
}

export default new AdminService();
