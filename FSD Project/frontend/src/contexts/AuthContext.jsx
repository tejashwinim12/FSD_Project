// src/contexts/AuthContext.js
import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser, fetchProtected } from "../services/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile whenever token changes
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await fetchProtected("/users/profile", token);
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            logout(); // Invalid token, logout
          }
        } catch (err) {
          console.error(err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      return { ok: true };
    } else {
      return { ok: false, error: data.message || "Login failed" };
    }
  };

  const register = async (credentials) => {
    const data = await registerUser(credentials);
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      return { ok: true };
    } else {
      return { ok: false, error: data.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
