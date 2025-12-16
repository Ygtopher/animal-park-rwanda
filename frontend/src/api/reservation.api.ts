import apiClient from './axios.config';

export interface CreateReservationData {
    parkId: string;
    visitDate: string;
    numberOfVisitors: number;
    visitorType?: string;
    specialRequests?: string;
}

export interface Reservation {
    id: string;
    parkId: string;
    visitDate: string;
    numberOfVisitors: number;
    totalAmount: number;
    status: string;
    bookingReference: string;
    specialRequests?: string;
    createdAt: string;
    park: {
        id: string;
        name: string;
        location: string;
        imageUrls: string[];
    };
    payment?: any;
    ticket?: any;
}

export const reservationApi = {
    createReservation: async (data: CreateReservationData) => {
        const response = await apiClient.post('/api/reservations', data);
        return response.data;
    },

    getMyBookings: async (filters?: { status?: string; upcoming?: boolean }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.upcoming !== undefined)
            params.append('upcoming', filters.upcoming.toString());

        const response = await apiClient.get(
            `/api/reservations/my-bookings?${params.toString()}`
        );
        return response.data;
    },

    getReservationById: async (id: string) => {
        const response = await apiClient.get(`/api/reservations/${id}`);
        return response.data;
    },

    cancelReservation: async (id: string) => {
        const response = await apiClient.put(`/api/reservations/${id}/cancel`);
        return response.data;
    },
};
