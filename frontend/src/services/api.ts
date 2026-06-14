import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  signup: (data: { name: string; email: string; password: string; address: string }) =>
    api.post('/auth/signup', data),
};

// User
export const userService = {
  getProfile: () => api.get('/user/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/user/change-password', { currentPassword, newPassword }),
  getStoreOwners: () => api.get('/user/store-owners'),
};

// Admin
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  getUserById: (id: number) => api.get(`/admin/users/${id}`),
  createUser: (data: Record<string, string>) => api.post('/admin/users', data),
  getStores: (params?: Record<string, string>) => api.get('/admin/stores', { params }),
  createStore: (data: Record<string, string | number>) => api.post('/admin/stores', data),
};

// Stores (normal user)
export const storeService = {
  getStores: (params?: Record<string, string>) => api.get('/stores', { params }),
};

// Ratings
export const ratingService = {
  submitRating: (storeId: number, rating: number) =>
    api.post('/ratings', { storeId, rating }),
  updateRating: (id: number, rating: number) =>
    api.put(`/ratings/${id}`, { rating }),
};

// Owner
export const ownerService = {
  getDashboard: () => api.get('/owner/dashboard'),
};

export default api;
