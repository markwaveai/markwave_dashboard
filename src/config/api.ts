export const API_CONFIG = {
  getBaseUrl: () => {
    const productionUrl = 'https://animalkart-stagging-612299373064.asia-south1.run.app';

    // Use local backend when running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'https://animalkart-stagging-612299373064.asia-south1.run.app';
    } else {
      const corsUrl = 'https://cors-612299373064.asia-south1.run.app';
      return `${corsUrl}/${productionUrl}`;
    }
  }
};

export const API_ENDPOINTS = {
  sendOtp: () => `${API_CONFIG.getBaseUrl()}/otp/send-whatsapp`,
  getUsers: () => `${API_CONFIG.getBaseUrl()}/users/customers`,
  getReferrals: () => `${API_CONFIG.getBaseUrl()}/users/referrals`,
  createUser: () => `${API_CONFIG.getBaseUrl()}/users/referral-signup`,
  getUserDetails: (mobile: string) => `${API_CONFIG.getBaseUrl()}/users/customers/${mobile}`,
  verifyUser: () => `${API_CONFIG.getBaseUrl()}/users/verify`,
  updateUser: (mobile: string) => `${API_CONFIG.getBaseUrl()}/users/${mobile}`,
  getProducts: () => `${API_CONFIG.getBaseUrl()}/products`,
  addProduct: () => `${API_CONFIG.getBaseUrl()}/products`,
  updateProduct: (id: string) => `${API_CONFIG.getBaseUrl()}/products/${id}`,
  deleteProduct: (id: string) => `${API_CONFIG.getBaseUrl()}/products/${id}`,
  health: () => `${API_CONFIG.getBaseUrl()}/health`,
  getPendingUnits: () => `${API_CONFIG.getBaseUrl()}/purchases/admin/units/pending`,
  approveUnit: () => `${API_CONFIG.getBaseUrl()}/purchases/admin/units/approve`,
  rejectUnit: () => `${API_CONFIG.getBaseUrl()}/purchases/admin/units/reject`,
  getAcfPendingEmis: () => `${API_CONFIG.getBaseUrl()}/purchases/admin/units/emis/pending`,
  approveAcfEmi: () => `${API_CONFIG.getBaseUrl()}/purchases/admin/units/approve-emi`,
  rejectAcfEmi: () => `${API_CONFIG.getBaseUrl()}/purchases/admin/units/reject-emi`,
  getEmiDetails: () => `${API_CONFIG.getBaseUrl()}/purchases/units/emi-details`,
  getInvoice: () => `${API_CONFIG.getBaseUrl()}/purchases/invoice`,
  getOrderDetails: (orderId: string) => `${API_CONFIG.getBaseUrl()}/purchases/units/order-details?orderId=${encodeURIComponent(orderId)}`,

  uploadProductImage: (id: string) => `${API_CONFIG.getBaseUrl()}/products/${id}/images`,
  getOrderStatus: () => `${API_CONFIG.getBaseUrl()}/order-tracking/stages`,
  updateOrderStatus: () => `${API_CONFIG.getBaseUrl()}/order-tracking/update-status`,
  deactivateRequestOtp: () => `${API_CONFIG.getBaseUrl()}/users/deactivate/request-otp`,
  deactivateConfirm: () => `${API_CONFIG.getBaseUrl()}/users/deactivate/confirm`,
  requestReactivationOtp: () => `${API_CONFIG.getBaseUrl()}/users/reactivate/request-otp`,
  confirmReactivation: () => `${API_CONFIG.getBaseUrl()}/users/reactivate/confirm`,
  getFarms: () => `${API_CONFIG.getBaseUrl()}/farms/`,
  addFarm: () => `${API_CONFIG.getBaseUrl()}/farms/`,
  updateFarm: (id: string) => `${API_CONFIG.getBaseUrl()}/farms/${id}`,
  getSelfBenefits: () => `${API_CONFIG.getBaseUrl()}/self-benefits/`,
  updateSelfBenefit: (id: string) => `${API_CONFIG.getBaseUrl()}/self-benefits/${id}`,
  getReferralMilestones: () => `${API_CONFIG.getBaseUrl()}/referral-benefits/milestones`,
  updateReferralMilestone: (id: string) => `${API_CONFIG.getBaseUrl()}/referral-benefits/milestones/${encodeURIComponent(id)}`,
  getReferralConfig: () => `${API_CONFIG.getBaseUrl()}/referral-benefits/config`,
  updateReferralConfig: () => `${API_CONFIG.getBaseUrl()}/referral-benefits/config`,
  getRoleChangeRequests: () => `${API_CONFIG.getBaseUrl()}/users/role-change-requests`,
  actionRoleChangeRequest: (id: string) => `${API_CONFIG.getBaseUrl()}/users/role-change-requests/${encodeURIComponent(id)}`,
  getAchievedBenefits: () => `${API_CONFIG.getBaseUrl()}/self-benefits/admin/achieved`,
  getAchievedReferralMilestones: () => `${API_CONFIG.getBaseUrl()}/referral-benefits/admin/achieved-milestones`,
  verifyOtp: () => `${API_CONFIG.getBaseUrl()}/otp/verify`,
  getProcurementRoster: () => `${API_CONFIG.getBaseUrl()}/order-tracking/procurement/roster`,
  procurementAction: () => `${API_CONFIG.getBaseUrl()}/order-tracking/procurement/action`,
  getAdmins: () => `${API_CONFIG.getBaseUrl()}/users/admins/list`,
  addAdmin: () => `${API_CONFIG.getBaseUrl()}/users/superadmin/add-user`,
  assignAdminToFarm: (farmId: string) => `${API_CONFIG.getBaseUrl()}/farms/${farmId}/admin`,
};
