import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Type': 'application/json',
  },
});

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // 1. Get tokens from TAB-ISOLATED sessionStorage 
    // This allows Student A and Student B to exist in different tabs without conflict
    const studentToken = sessionStorage.getItem('studentToken');
    
    // Admin tokens usually stay in localStorage unless you want admins isolated by tab too
    const adminToken = localStorage.getItem('token') || localStorage.getItem('access_token');

    // 2. Define Public Endpoints (No Token Needed)
    const publicEndpoints = [
      '/api/auth/login', 
      '/api/students/login', 
      '/api/admin/login',
      '/api/students/register', 
      '/api/captcha/generate'
    ];

    const isPublic = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    // 3. Attach Token ONLY if NOT a public endpoint
    if (!isPublic) {
      if (studentToken) {
        config.headers.Authorization = `Bearer ${studentToken}`;
      } else if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }

    // ✅ FIX FOR FILE UPLOADS
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    // Handle Session Expiry (401)
    if (status === 401) {
      const errorMsg = String(detail || "").toLowerCase();
      const isExpired = errorMsg.includes("expired") || errorMsg.includes("login again") || errorMsg.includes("invalid token");

      if (isExpired) {
        window.dispatchEvent(new Event('session-expired'));
        
        // ✅ CLEANUP: Clear sessionStorage (Tab specific) and localStorage
        sessionStorage.removeItem('studentToken');
        sessionStorage.removeItem('studentUser');
        
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;