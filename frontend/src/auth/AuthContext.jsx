import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("token");
    if (token) {
      apiFetch("/auth/me")
        .then(userData => setUser(userData))
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { token, user: userData } = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem("token", token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Login failed" };
    }
  };

  const register = async (tenantName, subdomain, email, password, fullName) => {
    try {
      const { token, tenant } = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ tenantName, subdomain, email, password, fullName })
      });

      localStorage.setItem("token", token);
      
      // Get user info
      const userData = await apiFetch("/auth/me");
      setUser(userData);
      
      return { success: true, tenant };
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);