import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE = process.env.EXPO_PUBLIC_API_URL;

const authHeaders = async () => {
  const token = await SecureStore.getItemAsync("jwt");
  return { Authorization: `Bearer ${token}` };
};

// ── Sessions ──────────────────────────────────────────────────────────────────
export const startSession = async (plannedDurationMinutes = 25, note = "") => {
  const headers = await authHeaders();
  const res = await axios.post(
    `${BASE}/api/sessions/start`,
    { plannedDurationMinutes, note },
    { headers }
  );
  return res.data;
};

export const endSession = async (status, interruptions = 0) => {
  const headers = await authHeaders();
  const res = await axios.post(
    `${BASE}/api/sessions/end`,
    { status, interruptions },
    { headers }
  );
  return res.data;
};

export const getActiveSession = async () => {
  const headers = await authHeaders();
  const res = await axios.get(`${BASE}/api/sessions/active`, { headers });
  return res.data;
};

export const getSessionHistory = async (page = 1) => {
  const headers = await authHeaders();
  const res = await axios.get(`${BASE}/api/sessions/history?page=${page}`, { headers });
  return res.data;
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getOverview = async () => {
  const headers = await authHeaders();
  const res = await axios.get(`${BASE}/api/stats/overview`, { headers });
  return res.data;
};

export const getWeeklyStats = async () => {
  const headers = await authHeaders();
  const res = await axios.get(`${BASE}/api/stats/weekly`, { headers });
  return res.data;
};

export const getTodayStats = async () => {
  const headers = await authHeaders();
  const res = await axios.get(`${BASE}/api/stats/today`, { headers });
  return res.data;
};

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const getGlobalLeaderboard = async () => {
  const headers = await authHeaders();
  const res = await axios.get(`${BASE}/api/leaderboard/global`, { headers });
  return res.data;
};

export const getWeeklyLeaderboard = async () => {
  const headers = await authHeaders();
  const res = await axios.get(`${BASE}/api/leaderboard/weekly`, { headers });
  return res.data;
};

// ── User ──────────────────────────────────────────────────────────────────────
export const updateProfile = async (fields) => {
  const headers = await authHeaders();
  const res = await axios.put(`${BASE}/api/users/profile`, fields, { headers });
  return res.data;
};
