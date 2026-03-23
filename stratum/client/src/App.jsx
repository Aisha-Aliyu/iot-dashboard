import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Spinner from "./components/ui/Spinner";
import DashLayout from "./layouts/DashLayout";

const Login        = lazy(() => import("./pages/Login"));
const Overview     = lazy(() => import("./pages/Overview"));
const Sensors      = lazy(() => import("./pages/Sensors"));
const SensorDetail = lazy(() => import("./pages/SensorDetail"));
const FloorMap     = lazy(() => import("./pages/FloorMap"));
const Alerts       = lazy(() => import("./pages/Alerts"));
const Analytics    = lazy(() => import("./pages/Analytics"));
const Settings     = lazy(() => import("./pages/Settings"));

const Loader = () => (
  <div style={{
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "var(--color-bg)", flexDirection: "column", gap: "16px",
  }}>
    <Spinner size={32} />
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: "10px",
      color: "var(--color-text-muted)", letterSpacing: "0.2em",
      animation: "blink 1.5s ease-in-out infinite",
    }}>
      LOADING STRATUM...
    </div>
  </div>
);

const Protected = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Public = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const Wrap = ({ children }) => (
  <Protected><DashLayout>{children}</DashLayout></Protected>
);

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/login"        element={<Public><Login /></Public>} />
        <Route path="/"             element={<Wrap><Overview /></Wrap>} />
        <Route path="/sensors"      element={<Wrap><Sensors /></Wrap>} />
        <Route path="/sensors/:id"  element={<Wrap><SensorDetail /></Wrap>} />
        <Route path="/floor-map"    element={<Wrap><FloorMap /></Wrap>} />
        <Route path="/alerts"       element={<Wrap><Alerts /></Wrap>} />
        <Route path="/analytics"    element={<Wrap><Analytics /></Wrap>} />
        <Route path="/settings"     element={<Wrap><Settings /></Wrap>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
