// src/services/api.js
const API_BASE = process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://abuad-farms-project.onrender.com');

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;

  // copy options so we can modify safely
  const opts = { ...options };
  opts.headers = { ...(opts.headers || {}) };

  // attach token automatically if present
  const token = localStorage.getItem("token");
  if (token) {
    opts.headers.Authorization = `Bearer ${token}`;
  }

  // For JSON bodies, ensure correct header and stringify
  if (opts.body && !(opts.body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, opts);
  if (!res.ok) {
    // try to parse json error
    let err = {};
    try {
      err = await res.json();
    } catch {}
    throw new Error(err.error || `HTTP ${res.status} ${res.statusText}`);
  }

  // if no content
  if (res.status === 204) return null;
  return res.json();
};

// Product API functions
export const getProducts = (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach((k) => {
    const v = filters[k];
    if (v !== "" && v !== null && v !== undefined) params.append(k, v);
  });
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/api/products${qs}`);
};

export const getProduct = (id) => apiFetch(`/api/products/${id}`);

export const createProduct = (productData) =>
  apiFetch("/api/products", { method: "POST", body: productData });

export const updateProduct = (id, productData) =>
  apiFetch(`/api/products/${id}`, { method: "PUT", body: productData });

export const deleteProduct = (id) =>
  apiFetch(`/api/products/${id}`, { method: "DELETE" });

export const getFeaturedProducts = () => apiFetch("/api/products/featured");

// Upload image (multipart/form-data) — returns { url }
export const uploadImage = async (file) => {
  if (!file) throw new Error("No file provided");
  const fd = new FormData();
  fd.append("image", file);

  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API_BASE}/api/products/upload`, {
    method: "POST",
    body: fd,
    headers,
  });
  if (!res.ok) {
    let err = {};
    try {
      err = await res.json();
    } catch {}
    throw new Error(err.error || `Upload failed: HTTP ${res.status}`);
  }
  return res.json(); // { url }
};

// categories
export const getCategories = () => apiFetch("/api/categories");

// Auth
export const register = (userData) =>
  apiFetch("/api/auth/register", { method: "POST", body: userData });

export const login = async (credentials) => {
  const res = await apiFetch("/api/auth/login", { method: "POST", body: credentials });
  // expected response: { success, token, user }
  if (res && res.token) {
    localStorage.setItem("token", res.token);
  }
  return res;
};

// Orders
export const createOrder = (orderData) =>
  apiFetch("/api/orders", { method: "POST", body: orderData });

export const getOrders = () => apiFetch("/api/orders");
export const getOrder = (orderNumber) => apiFetch(`/api/orders/${orderNumber}`);