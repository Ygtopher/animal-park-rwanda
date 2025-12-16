import apiClient from './axios.config';

export interface Park {
    id: string;
    name: string;
    description: string;
    location: string;
    province: string;
    district: string;
    capacity: number;
    openingTime: string;
    closingTime: string;
    basePrice: number;
    imageUrls: string[];
    amenities: string[];
    status: string;
    averageRating: number;
    reviewCount: number;
    animals?: Animal[];
}

export interface Animal {
    id: string;
    name: string;
    species: string;
    description: string;
    count: number;
    imageUrl: string;
    endangered: boolean;
}

export const parkApi = {
    getAllParks: async (filters?: {
        province?: string;
        status?: string;
        search?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters?.province) params.append('province', filters.province);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.search) params.append('search', filters.search);

        const response = await apiClient.get(`/api/parks?${params.toString()}`);
        return response.data;
    },

    getParkById: async (id: string) => {
        const response = await apiClient.get(`/api/parks/${id}`);
        return response.data;
    },

    checkAvailability: async (parkId: string, date: string) => {
        const response = await apiClient.get(
            `/api/parks/${parkId}/availability?date=${date}`
        );
        return response.data;
    },

    getAnimals: async (parkId: string) => {
        const response = await apiClient.get(`/api/parks/${parkId}/animals`);
        return response.data;
    },
};
