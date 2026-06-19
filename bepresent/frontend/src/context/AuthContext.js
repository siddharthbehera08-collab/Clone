import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { loginUser, registerUser, fetchMe } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("jwt");
        if (savedToken) {
          const me = await fetchMe(savedToken);
          setUser(me);
          setToken(savedToken);
        }
      } catch {
        // Token expired or invalid — clear it
        await SecureStore.deleteItemAsync("jwt");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    await SecureStore.setItemAsync("jwt", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name, email, password) => {
    const data = await registerUser(name, email, password);
    await SecureStore.setItemAsync("jwt", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("jwt");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
