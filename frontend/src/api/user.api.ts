import apiClient from './axios.config';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'RANGER' | 'TOURIST';
    createdAt: string;
}

export const userApi = {
    // Get all users (Admin only)
    getAllUsers: () => apiClient.get<User[]>('/api/users'),

    // Create user (Admin only - for creating staff)
    createUser: (userData: { email: string; password: string; firstName: string; lastName: string; phone: string; role: string }) =>
        apiClient.post<User>('/api/users', userData),

    // Update user role (Admin only)
    updateUserRole: (id: string, role: string) => apiClient.put<User>(`/api/users/${id}/role`, { role }),

    // Delete user (Admin only)
    deleteUser: (id: string) => apiClient.delete(`/api/users/${id}`),
};
