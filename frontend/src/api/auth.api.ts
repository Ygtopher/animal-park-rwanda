import apiClient from './axios.config';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            role: string;
        };
        accessToken: string;
        refreshToken: string;
    };
    message?: string;
}

export const authApi = {
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await apiClient.post('/api/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await apiClient.post('/api/auth/register', data);
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/api/auth/me');
        return response.data;
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await apiClient.post('/api/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },
};
