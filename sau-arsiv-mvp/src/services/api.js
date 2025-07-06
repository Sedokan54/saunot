const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Bir hata oluştu');
  }

  return data;
};

// Auth Service
export const authService = {
  // Kayıt ol - Firebase Auth kullanarak
  register: async (userData) => {
    const { registerWithFirebase } = await import('./firebase-auth');
    return registerWithFirebase(userData);
  },

  // Giriş yap - Firebase Auth kullanarak
  login: async (credentials) => {
    const { loginWithFirebase } = await import('./firebase-auth');
    const data = await loginWithFirebase(credentials.email, credentials.password);
    
    // Token'ı localStorage'a kaydet
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  // Şifremi unuttum
  forgotPassword: async (email) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Şifre sıfırla
  resetPassword: async (token, email, password) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, email, password })
    });
  },

  // Email doğrula
  verifyEmail: async (token, email) => {
    return apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token, email })
    });
  },

  // Çıkış yap
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Kullanıcı bilgilerini al
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Token kontrolü
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Export default
export default {
  authService
};