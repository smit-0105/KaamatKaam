import api from './axios';

export const authApi = {
  register: (data: { name: string; email: string; password: string; phoneNumber: string; gender?: string; dateOfBirth?: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: FormData) =>
    api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getUserProfile: (userId: string) => api.get(`/auth/user/${userId}`),

  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
};
