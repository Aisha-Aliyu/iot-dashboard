import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./styles/global.css";

if (import.meta.env.DEV === false) {
  import("https://cdn.jsdelivr.net/npm/eruda").then(() => eruda.init());
}


const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 30, retry: 1, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{
          duration: 3500,
          style: {
            background: "var(--color-bg-card)",
            color: "var(--color-bright)",
            border: "1px solid var(--color-border-mid)",
            fontFamily: "var(--font-mono)", fontSize: "12px",
            boxShadow: "var(--shadow-glow)",
            borderRadius: "var(--radius-md)",
            letterSpacing: "0.05em",
          },
          success: { iconTheme: { primary: "var(--color-bright)", secondary: "#000" } },
          error:   { iconTheme: { primary: "var(--color-critical)", secondary: "#000" } },
        }} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
