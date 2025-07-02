import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
console.log(BASE_URL);

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error) {
    // Backend error format'ına uygun handling
    const errorData = error.response?.data;
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      throw errorData.errors.join(', ');
    }
    throw errorData?.message || "Giriş başarısız";
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // Backend error format'ına uygun handling
    const errorData = error.response?.data;
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      throw errorData.errors.join(', ');
    }
    throw errorData?.message || "Kayıt başarısız";
  }
};

export const checkAuth = async () => {
  try {
    const response = await api.get("/api/auth/check");
    return response.data; // { isAuthenticated: true, user: {...} } formatında döndür
  } catch (error) {
    console.error("checkAuth error:", error.response?.data || error.message);
    return { isAuthenticated: false, user: null }; // Hata durumunda false döndür
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    console.error("logoutUser error:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchCategorys = async () => {
  try {
    const response = await api.get("/api/categories/");
    return response.data;
  } catch (error) {
    console.error(
      "fetchCategorys error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const fetchProducts = async (params = {}) => {
  try {
    const response = await api.get("/api/products/", { params });
    return response.data;
  } catch (error) {
    console.log("fetchProducts error:", error.response?.data || error.message);
    throw error;
  }
};

export default api;

// Email verification functions
export const sendVerificationEmail = async () => {
  try {
    const response = await api.post("/api/email/send-verification");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Email verification failed";
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/api/email/verify?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Email verification failed";
  }
};

// Password reset functions
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/api/email/request-reset", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Password reset request failed";
  }
};

export const validateResetToken = async (token) => {
  try {
    const response = await api.get(`/api/email/validate-reset-token?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Token validation failed";
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post("/api/email/reset-password", { token, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Password reset failed";
  }
};

// Metrics API functions
export const getDashboardOverview = async () => {
  try {
    const response = await api.get("/api/metrics/overview");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Dashboard metrics failed";
  }
};

export const getUserMetrics = async () => {
  try {
    const response = await api.get("/api/metrics/users");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "User metrics failed";
  }
};

export const getProductMetrics = async () => {
  try {
    const response = await api.get("/api/metrics/products");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Product metrics failed";
  }
};

export const getOrderMetrics = async () => {
  try {
    const response = await api.get("/api/metrics/orders");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Order metrics failed";
  }
};

export const getDailyOrdersChart = async () => {
  try {
    const response = await api.get("/api/metrics/charts/daily-orders");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Daily orders chart failed";
  }
};

export const getTopSellingProducts = async () => {
  try {
    const response = await api.get("/api/metrics/charts/top-products");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Top products failed";
  }
};

// Order functions
export const getUserOrders = async () => {
  try {
    const response = await api.get("/api/orders/my-orders");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "User orders failed";
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Order details failed";
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/api/orders", orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Order creation failed";
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/api/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Order status update failed";
  }
};

// Product functions
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Product details failed";
  }
};

export const searchProducts = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    const response = await api.get(`/api/products/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Product search failed";
  }
};

// Cart functions
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post("/api/cart/add", { productId, quantity });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Add to cart failed";
  }
};

export const getCart = async () => {
  try {
    const response = await api.get("/api/cart");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Get cart failed";
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await api.patch(`/api/cart/${cartItemId}`, { quantity });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Update cart item failed";
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    const response = await api.delete(`/api/cart/${cartItemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Remove from cart failed";
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete("/api/cart/clear");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Clear cart failed";
  }
};
