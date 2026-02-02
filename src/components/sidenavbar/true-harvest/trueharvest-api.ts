/**
 * API Configuration and Endpoints
 * Swagger URL: https://trueharvest-backend-staging-services-612299373064.asia-south2.run.app/docs
 */

export const API_CONFIG = {
    getBaseUrl: () => {
        const productionUrl = 'https://trueharvest-backend-staging-services-612299373064.asia-south2.run.app';

        // Only use CORS proxy in local development environments if needed
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return productionUrl;
        } else {
            const corsUrl = 'https://cors-612299373064.asia-south1.run.app';
            return `${corsUrl}/${productionUrl}`;
        }
    }
};

export const API_ENDPOINTS = {
    // Auth - Users
    sendOtp: () => `${API_CONFIG.getBaseUrl()}/users/send-otp`,
    verifyOtp: () => `${API_CONFIG.getBaseUrl()}/users/verify-otp`,
    disableUser: () => `${API_CONFIG.getBaseUrl()}/users/disable`,
};
