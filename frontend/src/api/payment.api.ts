import apiClient from './axios.config';

export interface Payment {
    id: string;
    reservationId: string;
    amount: number;
    method: string;
    status: string;
    transactionId: string;
    paidAt?: string;
}

export const paymentApi = {
    initiatePayment: async (data: { reservationId: string; method: string; phoneNumber?: string }) => {
        const response = await apiClient.post('/api/payments/initiate', data);
        return response.data;
    },

    simulatePayment: async (transactionId: string) => {
        const response = await apiClient.post(`/api/payments/${transactionId}/simulate`);
        return response.data;
    },

    getPaymentStatus: async (transactionId: string) => {
        const response = await apiClient.get(`/api/payments/${transactionId}/status`);
        return response.data;
    },
};
