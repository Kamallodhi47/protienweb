import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('protein_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle global 401 unauth
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto logout logic if needed
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Endpoints Export
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

export const ingredientsAPI = {
  getAll: (params) => api.get('/ingredients', { params }),
  getById: (id) => api.get(`/ingredients/${id}`),
  create: (data) => api.post('/ingredients', data),
  update: (id, data) => api.put(`/ingredients/${id}`, data),
  delete: (id) => api.delete(`/ingredients/${id}`),
  refill: (data) => api.post('/ingredients/refill', data)
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getJuices: (params) => api.get('/products/juices', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getAllAdmin: (params) => api.get('/orders', { params }),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (id, data) => api.put(`/orders/${id}/payment-status`, data)
};

export const subscriptionsAPI = {
  // Plans CRUD
  getPlans: () => api.get('/subscriptions/plans'),
  createPlan: (data) => api.post('/subscriptions/plans', data),
  updatePlan: (id, data) => api.put(`/subscriptions/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/subscriptions/plans/${id}`),

  // Subscription client operations
  getMySubscriptions: () => api.get('/subscriptions/my-subscriptions'),
  getById: (id) => api.get(`/subscriptions/${id}`),
  create: (data) => api.post('/subscriptions', data),
  pause: (id, data) => api.post(`/subscriptions/${id}/pause`, data),
  resume: (id) => api.post(`/subscriptions/${id}/resume`),
  cancel: (id, data) => api.post(`/subscriptions/${id}/cancel`, data),
  getCalendar: (id) => api.get(`/meals/calendar/${id}`),

  // Meals
  getUpcomingMeals: () => api.get('/meals/upcoming'),
  getTomorrowMeal: () => api.get('/meals/tomorrow'),
  customizeMeal: (mealScheduleId, data) => api.post(`/meals/${mealScheduleId}/customize`, data),

  // Payments
  createPaymentOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getPaymentHistory: () => api.get('/payments/history'),

  // Admin Operations
  getAllAdmin: (params) => api.get('/subscriptions/admin/all', { params }),
  updateAdminSubscription: (id, data) => api.put(`/subscriptions/admin/${id}/update`, data),
  getAdminMeals: (params) => api.get('/meals/admin/all', { params }),
  updateMealStatus: (id, status) => api.put(`/meals/admin/${id}/status`, { status }),
  getAdminPayments: () => api.get('/payments/admin/all')
};

export const customerAPI = {
  getAnalytics: () => api.get('/customer/analytics'),
  getAddresses: () => api.get('/customer/addresses'),
  addAddress: (data) => api.post('/customer/addresses', data),
  deleteAddress: (id) => api.delete(`/customer/addresses/${id}`)
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getCustomers: () => api.get('/admin/customers'),
  getInventoryLogs: () => api.get('/admin/inventory-logs'),
  getReports: (type) => api.get('/admin/reports', { params: { type } })
};

export const cmsAPI = {
  getAll: () => api.get('/cms'),
  getByKey: (key) => api.get(`/cms/${key}`),
  updateKey: (key, data) => api.put(`/cms/${key}`, data)
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
};

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
  delete: (id) => api.delete(`/contact/${id}`)
};

export const newsletterAPI = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
  getAll: () => api.get('/newsletter'),
  delete: (id) => api.delete(`/newsletter/${id}`)
};

export const sproutsAPI = {
  // Categories
  getCategories: (params) => api.get('/sprouts/categories', { params }),
  getCategoryById: (id) => api.get(`/sprouts/categories/${id}`),
  createCategory: (data) => api.post('/sprouts/categories', data),
  updateCategory: (id, data) => api.put(`/sprouts/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/sprouts/categories/${id}`),

  // Ingredients
  getIngredients: (params) => api.get('/sprouts/ingredients', { params }),
  getIngredientById: (id) => api.get(`/sprouts/ingredients/${id}`),
  createIngredient: (data) => api.post('/sprouts/ingredients', data),
  updateIngredient: (id, data) => api.put(`/sprouts/ingredients/${id}`, data),
  deleteIngredient: (id) => api.delete(`/sprouts/ingredients/${id}`)
};

export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

export default api;
