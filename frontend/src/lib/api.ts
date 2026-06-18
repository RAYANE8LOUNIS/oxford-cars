import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('oxford_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('oxford_token');
      localStorage.removeItem('oxford_user');
    }
    return Promise.reject(error);
  }
);

// Vehicles
export const vehiclesApi = {
  getAll: (params?: Record<string, string>) => api.get('/vehicles', { params }),
  getOne: (id: string) => api.get(`/vehicles/${id}`),
  getAvailability: (id: string, month: number, year: number) =>
    api.get(`/vehicles/${id}/availability`, { params: { month, year } }),
  create: (data: FormData) => api.post('/vehicles', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/vehicles/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

// Reservations
export const reservationsApi = {
  checkAvailability: (data: { vehicle_id: string; pickup_date: string; return_date: string }) =>
    api.post('/reservations/check-availability', data),
  create: (data: object) => api.post('/reservations', data),
  getMy: () => api.get('/reservations/my'),
  getOne: (id: string) => api.get(`/reservations/${id}`),
  cancel: (id: string) => api.put(`/reservations/${id}/cancel`),
  // Admin
  getAll: (params?: Record<string, string>) => api.get('/reservations', { params }),
  updateStatus: (id: string, status: string, admin_notes?: string) =>
    api.put(`/reservations/${id}/status`, { status, admin_notes }),
};

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: object) => api.put('/auth/me', data),
  changePassword: (data: object) => api.put('/auth/change-password', data),
};

// Admin
export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics'),
  getCustomers: (params?: Record<string, string>) => api.get('/admin/customers', { params }),
  getReviews: () => api.get('/admin/reviews'),
  updateReview: (id: string, data: object) => api.put(`/admin/reviews/${id}`, data),
  getMessages: () => api.get('/admin/messages'),
  markMessageRead: (id: string) => api.put(`/admin/messages/${id}/read`),
};

// Contact
export const contactApi = {
  send: (data: object) => api.post('/contact', data),
};

// Reviews
export const reviewsApi = {
  create: (data: object) => api.post('/reviews', data),
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-DZ', { style: 'decimal', maximumFractionDigits: 0 }).format(price) + ' DA';
