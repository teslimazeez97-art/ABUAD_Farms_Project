const API_BASE = 'http://localhost:5001';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  
  // Handle empty responses
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP ${response.status}`);
  }

  return data;
};

// Auth API functions
export const authAPI = {
  login: (credentials) => apiFetch('/api/auth/login', {
    method: 'POST',
    body: credentials
  }),
  
  register: (userData) => apiFetch('/api/auth/register', {
    method: 'POST',
    body: userData
  }),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
  
  getCurrentUser: () => apiFetch('/api/auth/me'),
  
  refreshToken: () => apiFetch('/api/auth/refresh', {
    method: 'POST'
  })
};

// Products API functions
export const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/api/products${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiFetch(`/api/products/${id}`),
  
  getFeatured: () => apiFetch('/api/products/featured'),
  
  search: (query, filters = {}) => {
    const params = { search: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/api/products/search?${queryString}`);
  },
  
  create: (productData) => apiFetch('/api/products', {
    method: 'POST',
    body: productData
  }),
  
  update: (id, productData) => apiFetch(`/api/products/${id}`, {
    method: 'PUT',
    body: productData
  }),
  
  delete: (id) => apiFetch(`/api/products/${id}`, {
    method: 'DELETE'
  }),
  
  updateStock: (id, quantity) => apiFetch(`/api/products/${id}/stock`, {
    method: 'PATCH',
    body: { quantity }
  }),
  
  toggleFeatured: (id) => apiFetch(`/api/products/${id}/featured`, {
    method: 'PATCH'
  })
};

// Orders API functions
export const ordersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/api/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiFetch(`/api/orders/${id}`),
  
  getMyOrders: () => apiFetch('/api/orders/my'),
  
  create: (orderData) => apiFetch('/api/orders', {
    method: 'POST',
    body: orderData
  }),
  
  updateStatus: (id, status) => apiFetch(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: { status }
  }),
  
  cancel: (id) => apiFetch(`/api/orders/${id}/cancel`, {
    method: 'PUT'
  }),
  
  getOrderItems: (id) => apiFetch(`/api/orders/${id}/items`),
  
  getStats: () => apiFetch('/api/orders/stats'),
  
  getRecentOrders: (limit = 10) => apiFetch(`/api/orders/recent?limit=${limit}`)
};

// Cart API functions (if you want server-side cart)
export const cartAPI = {
  get: () => apiFetch('/api/cart'),
  
  add: (productId, quantity = 1) => apiFetch('/api/cart/add', {
    method: 'POST',
    body: { productId, quantity }
  }),
  
  update: (productId, quantity) => apiFetch('/api/cart/update', {
    method: 'PUT',
    body: { productId, quantity }
  }),
  
  remove: (productId) => apiFetch('/api/cart/remove', {
    method: 'DELETE',
    body: { productId }
  }),
  
  clear: () => apiFetch('/api/cart/clear', {
    method: 'DELETE'
  }),
  
  getCount: () => apiFetch('/api/cart/count')
};

// Payment API functions
export const paymentAPI = {
  initializePayment: (orderData) => apiFetch('/api/payments/initialize', {
    method: 'POST',
    body: orderData
  }),
  
  verifyPayment: (reference) => apiFetch('/api/payments/verify', {
    method: 'POST',
    body: { reference }
  }),
  
  getPaymentMethods: () => apiFetch('/api/payments/methods'),
  
  processPayment: (paymentData) => apiFetch('/api/payments/process', {
    method: 'POST',
    body: paymentData
  })
};

// Admin API functions
export const adminAPI = {
  getDashboardStats: () => apiFetch('/api/admin/dashboard'),
  
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  
  updateUserRole: (userId, role) => apiFetch(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    body: { role }
  }),
  
  deleteUser: (userId) => apiFetch(`/api/admin/users/${userId}`, {
    method: 'DELETE'
  }),
  
  getSystemLogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/api/admin/logs${queryString ? `?${queryString}` : ''}`);
  },
  
  backupDatabase: () => apiFetch('/api/admin/backup', {
    method: 'POST'
  }),
  
  getAnalytics: (period = '30d') => apiFetch(`/api/admin/analytics?period=${period}`)
};

// Categories API functions (if you add categories later)
export const categoriesAPI = {
  getAll: () => apiFetch('/api/categories'),
  
  getById: (id) => apiFetch(`/api/categories/${id}`),
  
  create: (categoryData) => apiFetch('/api/categories', {
    method: 'POST',
    body: categoryData
  }),
  
  update: (id, categoryData) => apiFetch(`/api/categories/${id}`, {
    method: 'PUT',
    body: categoryData
  }),
  
  delete: (id) => apiFetch(`/api/categories/${id}`, {
    method: 'DELETE'
  }),
  
  getProducts: (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/api/categories/${id}/products${queryString ? `?${queryString}` : ''}`);
  }
};

// File upload API functions
export const uploadAPI = {
  uploadImage: (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    
    return apiFetch('/api/upload/image', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData
    });
  },
  
  uploadMultiple: (files, folder = 'products') => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('folder', folder);
    
    return apiFetch('/api/upload/multiple', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData
    });
  },
  
  deleteImage: (imageUrl) => apiFetch('/api/upload/delete', {
    method: 'DELETE',
    body: { imageUrl }
  })
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
    // Return user-friendly error message
    return error.message || 'Something went wrong. Please try again.';
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  },
  
  // Check if current user is admin
  isAdmin: () => {
    const user = apiUtils.getCurrentUser();
    return user.role === 'admin';
  },
  
  // Format API response for consistent handling
  formatResponse: (data) => {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  },
  
  // Create query string from object
  createQueryString: (params) => {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    return new URLSearchParams(filtered).toString();
  }
};

// Export everything as default for easy importing
export default {
  apiFetch,
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  cart: cartAPI,
  payment: paymentAPI,
  admin: adminAPI,
  categories: categoriesAPI,
  upload: uploadAPI,
  utils: apiUtils
};