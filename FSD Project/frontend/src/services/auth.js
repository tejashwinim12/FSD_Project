// src/services/auth.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Login
export const loginUser = async ({ email, password }) => {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return res.data; // { token: "...", message: "Login successful" }
  } catch (err) {
    return { message: err.response?.data?.message || "Login failed" };
  }
};

// Register
export const registerUser = async ({ name, email, password }) => {
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
    return res.data; // { token: "...", message: "User registered" }
  } catch (err) {
    return { message: err.response?.data?.message || "Registration failed" };
  }
};

// Fetch protected route
export const fetchProtected = async (path, token) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};
