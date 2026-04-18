import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getUserFriendlyMessageFromPayload } from "../utils/errorHandling";

export const StudentAuthContext = createContext();

export const useStudentAuth = () => useContext(StudentAuthContext);

export const StudentAuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [studentToken, setStudentToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync state with sessionStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const stored = sessionStorage.getItem("studentUser");
      const storedToken = sessionStorage.getItem("studentToken");

      if (stored && stored !== "undefined") {
        try {
          setStudent(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse stored user");
          sessionStorage.removeItem("studentUser");
        }
      }

      if (storedToken) setStudentToken(storedToken);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const getUrl = useCallback((path) => {
    const rawBase = import.meta.env.VITE_API_BASE || "";
    const API_BASE = rawBase.replace(/\/+$/g, "");
    return API_BASE ? `${API_BASE}${path}` : path;
  }, []);

  // ✅ FIXED: Now accepts 'turnstile_token' and removes old captcha fields
  const login = async ({ identifier, password, turnstile_token }) => {
    const url = getUrl("/api/students/login");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      // ✅ FIXED: Sends the correct payload to backend
      body: JSON.stringify({
        identifier,
        password,
        turnstile_token,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = getUserFriendlyMessageFromPayload(
        data,
        response.status,
        "Unable to sign in right now. Please try again.",
      );
      throw new Error(message);
    }

    const userData = data.student || data.user || data;
    const receivedToken = data.access_token || data.token || data.accessToken;

    setStudent(userData);
    setStudentToken(receivedToken);

    sessionStorage.setItem("studentUser", JSON.stringify(userData));
    if (receivedToken) {
      sessionStorage.setItem("studentToken", receivedToken);
    }

    return userData;
  };

  const register = async (payload) => {
    const url = getUrl("/api/students/register");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        getUserFriendlyMessageFromPayload(
          data,
          res.status,
          "Unable to register right now. Please try again.",
        ),
      );
    }

    const userData = data.student || data.user;
    const receivedToken = data.token || data.access_token; // Handle standard token response

    if (userData) {
      setStudent(userData);
      sessionStorage.setItem("studentUser", JSON.stringify(userData));
    }
    if (receivedToken) {
      setStudentToken(receivedToken);
      sessionStorage.setItem("studentToken", receivedToken);
    }
    return data;
  };

  const logout = useCallback(() => {
    setStudent(null);
    setStudentToken(null);
    sessionStorage.removeItem("studentUser");
    sessionStorage.removeItem("studentToken");
  }, []);

  const value = {
    student,
    token: studentToken,
    loading,
    login,
    register,
    logout,
  };

  return (
    <StudentAuthContext.Provider value={value}>
      {!loading && children}
    </StudentAuthContext.Provider>
  );
};

export default StudentAuthProvider;
