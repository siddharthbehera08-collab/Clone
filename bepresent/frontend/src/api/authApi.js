import axios from "axios";

const BASE = process.env.EXPO_PUBLIC_API_URL;

export const loginUser = async (email, password) => {
  const res = await axios.post(`${BASE}/api/auth/login`, { email, password });
  return res.data;
};

export const registerUser = async (name, email, password) => {
  const res = await axios.post(`${BASE}/api/auth/register`, { name, email, password });
  return res.data;
};

export const fetchMe = async (token) => {
  const res = await axios.get(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
