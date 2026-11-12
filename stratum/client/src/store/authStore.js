import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// A sleeping server takes about a minute to wake, so sign-in waits longer than other calls
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 90000 });

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const { data } = await api.post("/auth/login", { email, password });
          if (!data?.token || !data?.user) {
            return { success: false, message: "The server is still starting. Try again in a moment." };
          }
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return { success: true };
        } catch (err) {
          // No answer, or the host's own error while the server starts
          if (!err.response || [502, 503, 504].includes(err.response.status)) {
            return {
              success: false,
              message: "Can't reach the server yet. It may be waking up, so try again in a minute.",
            };
          }
          return { success: false, message: err.response.data?.message || "Login failed" };
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
