import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to build API URLs consistently
  const getApiBase = useCallback(() => {
    const base = import.meta.env.VITE_API_BASE || '';
    return base.replace(/\/+$/g, '');
  }, []);

  // Sync state with localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        console.error("AuthContext: Session recovery failed", e);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  /**
   * ✅ UPDATED LOGIN LOGIC (Same as Student)
   * Accepts: { email, password, captcha_input, captcha_hash }
   * Uses Stateless Verification to avoid "Captcha Expired" cookie issues.
   */
  const login = async (credentialsPayload) => {
    const loginUrl = `${getApiBase()}/api/admin/login`; 

    try {
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // credentials: 'include' is kept for security best practices, 
        // but we now primarily rely on the captcha_hash in the body.
        credentials: 'include', 
        body: JSON.stringify(credentialsPayload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Robust error parsing for FastAPI structured errors
        let errorMessage = 'Login failed';
        if (data.detail) {
          errorMessage = Array.isArray(data.detail) 
            ? data.detail[0].msg 
            : data.detail;
        }
        throw new Error(errorMessage);
      }

      // Map backend response to local user object
      const receivedToken = data.access_token || data.token;
      const userData = {
        id: data.user_id,
        name: data.user_name,
        role: data.user_role?.toLowerCase(),
        school: data.school_name,
        department: data.department_name,
        ...data
      };

      // Persist to storage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', receivedToken);
      
      setUser(userData);
      setToken(receivedToken);

      return { user: userData, token: receivedToken };
    } catch (err) {
      console.error("AuthContext Login Error:", err.message);
      throw err;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }, []);

  /**
   * ✅ AUTHORIZED FETCH
   * Automatically attaches JWT Bearer token to requests
   */
  const authFetch = useCallback((url, options = {}) => {
    const activeToken = token || localStorage.getItem('token');
    const fullUrl = url.startsWith('http') ? url : `${getApiBase()}${url}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${activeToken}`
    };
    
    return fetch(fullUrl, { ...options, headers, credentials: 'include' });
  }, [token, getApiBase]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authFetch, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};