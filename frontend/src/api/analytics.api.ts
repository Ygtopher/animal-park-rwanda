import apiClient from './axios.config';

export const analyticsApi = {
    getRangerAnalytics: async () => {
        const response = await apiClient.get('/api/analytics/ranger');
        return response.data;
    },

    getAdminAnalytics: async () => {
        const response = await apiClient.get('/api/analytics/admin');
        return response.data;
    },
};
