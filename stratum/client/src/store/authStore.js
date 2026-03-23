import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const { data } = await api.post("/auth/login", { email, password });
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return { success: true };
        } catch (err) {
          return { success: false, message: err.response?.data?.message || "Login failed" };
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "stratum_session",
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAuthStore;
