import axios from 'axios';

export const FARMVEST_API_CONFIG = {
    getBaseUrl: () => {
        const productionUrl = process.env.REACT_APP_FARMVEST_PRODUCTION_URL || 'https://farmvest-live-apis-jn6cma3vvq-el.a.run.app';

        // Only use CORS proxy in local development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return productionUrl;
        }
        return productionUrl;
    },
    getApiKey: () => process.env.REACT_APP_FARMVEST_API_KEY || 'bWFya3dhdmUtZmFybXZlc3QtdGVzdHRpbmctYXBpa2V5'
};

const farmvestApi = axios.create({
    baseURL: FARMVEST_API_CONFIG.getBaseUrl(),
    headers: {
        'Authorization': FARMVEST_API_CONFIG.getApiKey(),
        'Content-Type': 'application/json'
    }
});

export const farmvestService = {
    getEmployees: async () => {
        try {
            const response = await farmvestApi.get('/api/employee/get_all_employees');
            return response.data;
        } catch (error) {
            console.error('Error fetching farmvest employees:', error);
            throw error;
        }
    },
    getFarms: async (location: string) => {
        try {
            const response = await farmvestApi.get(`/farms/farms?location=${location}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching farms for ${location}:`, error);
            throw error;
        }
    },
    createEmployee: async (employeeData: any) => {
        try {
            const response = await farmvestApi.post('/api/employee/create_employee', employeeData);
            return response.data;
        } catch (error) {
            console.error('Error creating farmvest employee:', error);
            throw error;
        }
    },
    deleteEmployee: async (id: number) => {
        try {
            const response = await farmvestApi.delete(`/api/employee/delete_employee/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting farmvest employee ${id}:`, error);
            throw error;
        }
    }
};