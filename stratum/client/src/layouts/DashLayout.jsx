import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Activity, Bell, Map,
  Settings, LogOut, Menu, X, Cpu, Wifi, WifiOff,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import useSensorStore from "../store/sensorStore";
import { toast } from "react-hot-toast";
import StatusDot from "../components/ui/StatusDot";

const NAV = [
  { path: "/",          label: "OVERVIEW",  icon: LayoutDashboard },
  { path: "/sensors",   label: "SENSORS",   icon: Cpu },
  { path: "/alerts",    label: "ALERTS",    icon: Bell },
  { path: "/floor-map", label: "FLOOR MAP", icon: Map },
  { path: "/analytics", label: "ANALYTICS", icon: Activity },
  { path: "/settings",  label: "SETTINGS",  icon: Settings },
];

const NavItem = ({ path, label, icon: Icon, onClick, alertCount }) => (
  <NavLink to={path} end={path === "/"} onClick={onClick}
    style={({ isActive }) => ({
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 14px", borderRadius: "var(--radius-md)",
      color: isActive ? "var(--color-bright)" : "var(--color-text-muted)",
      background: isActive ? "rgba(20,101,91,0.2)" : "transparent",
      fontFamily: "var(--font-display)", fontWeight: isActive ? 600 : 400,
      fontSize: "10px", letterSpacing: "0.15em",
      textDecoration: "none", transition: "all var(--t-fast)",
      borderLeft: isActive ? "2px solid var(--color-mid)" : "2px solid transparent",
      position: "relative",
    })}
  >
    <Icon size={14} />
    {label}
    {alertCount > 0 && (
      <span style={{
        marginLeft: "auto",
        padding: "1px 6px",
        background: "var(--color-critical)",
        color: "#fff",
        borderRadius: "10px",
        fontSize: "9px", fontWeight: 700,
        fontFamily: "var(--font-mono)",
        animation: "blink 2s ease-in-out infinite",
      }}>
        {alertCount}
      </span>
    )}
  </NavLink>
);

const DashLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { wsConnected, alerts, stats, lastUpdate } = useSensorStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE").length;

  const handleLogout = () => {
    logout();
    toast.success("Session terminated");
    navigate("/login");
  };

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0" }}>
      {/* Logo */}
      <div style={{
        padding: "20px 16px",
        borderBottom: "1px solid var(--color-border)",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="8" fill="#002b36"/>
          <rect x="8" y="44" width="48" height="4" rx="1" fill="#14655b"/>
          <rect x="8" y="34" width="36" height="4" rx="1" fill="#14655b"/>
          <rect x="8" y="24" width="48" height="4" rx="1" fill="#a7ffeb"/>
          <rect x="8" y="14" width="24" height="4" rx="1" fill="#14655b"/>
        </svg>
        <div>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "16px", letterSpacing: "0.2em",
            color: "var(--color-bright)",
          }}>STRATUM</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "8px",
            color: "var(--color-text-muted)", letterSpacing: "0.1em",
          }}>IoT MONITOR v1.0</div>
        </div>
      </div>

      {/* WS Status */}
      <div style={{
        padding: "10px 16px",
        borderBottom: "1px solid var(--color-border)",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        {wsConnected
          ? <Wifi size={12} color="var(--color-online)" />
          : <WifiOff size={12} color="var(--color-critical)" />
        }
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: wsConnected ? "var(--color-online)" : "var(--color-critical)",
          letterSpacing: "0.1em",
        }}>
          {wsConnected ? "LIVE FEED ACTIVE" : "RECONNECTING..."}
        </span>
        {wsConnected && (
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--color-online)",
            animation: "blink 1.5s ease-in-out infinite",
            marginLeft: "auto",
          }} />
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <div style={{
          padding: "6px 14px 8px",
          fontFamily: "var(--font-mono)", fontSize: "8px",
          color: "var(--color-text-muted)", letterSpacing: "0.15em",
        }}>// NAVIGATION</div>
        {NAV.map((item) => (
          <NavItem key={item.path} {...item}
            onClick={() => setMobileOpen(false)}
            alertCount={item.path === "/alerts" ? activeAlerts : 0}
          />
        ))}
      </nav>

      {/* Stats strip */}
      {stats && (
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--color-border)",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}>
          {[
            { label: "ONLINE", value: stats.sensors?.online || 0, color: "var(--color-online)" },
            { label: "ALERTS", value: stats.alerts?.active || 0, color: activeAlerts > 0 ? "var(--color-critical)" : "var(--color-text-muted)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontWeight: 700,
                fontSize: "18px", color,
              }}>{value}</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "8px",
                color: "var(--color-text-muted)", letterSpacing: "0.1em",
              }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* User */}
      <div style={{
        padding: "12px 8px",
        borderTop: "1px solid var(--color-border)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "8px 14px", marginBottom: "4px",
          background: "var(--color-bg-raised)",
          borderRadius: "var(--radius-md)",
        }}>
          <StatusDot status="ONLINE" size={6} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              color: "var(--color-bright)", fontWeight: 700,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{user?.displayName || user?.email}</p>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "8px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
            }}>{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{
            width: "100%", padding: "8px 14px",
            display: "flex", alignItems: "center", gap: "8px",
            fontFamily: "var(--font-mono)", fontSize: "10px",
            color: "var(--color-text-muted)", letterSpacing: "0.1em",
            borderRadius: "var(--radius-md)",
            transition: "all var(--t-fast)", background: "none",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-critical)"; e.currentTarget.style.background = "rgba(255,68,68,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "none"; }}
        >
          <LogOut size={12} />
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop sidebar */}
      <aside style={{
        width: "220px", flexShrink: 0,
        background: "var(--color-bg-panel)",
        borderRight: "1px solid var(--color-border)",
        position: "sticky", top: 0, height: "100vh",
        overflowY: "auto",
      }} className="dash-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 200,
        }} />
      )}

      {/* Mobile drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0,
        width: "240px", height: "100vh",
        background: "var(--color-bg-panel)",
        borderRight: "1px solid var(--color-border)",
        zIndex: 201,
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
        overflowY: "auto",
      }}>
        <button onClick={() => setMobileOpen(false)}
          style={{
            position: "absolute", top: 16, right: 16,
            color: "var(--color-text-muted)", padding: "4px",
          }}>
          <X size={16} />
        </button>
        <SidebarContent />
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Mobile topbar */}
        <header style={{
          display: "none",
          alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--color-bg-panel)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky", top: 0, zIndex: 100,
        }} className="dash-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="8" fill="#002b36"/>
              <rect x="8" y="44" width="48" height="4" rx="1" fill="#14655b"/>
              <rect x="8" y="24" width="48" height="4" rx="1" fill="#a7ffeb"/>
            </svg>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: "14px",
              fontWeight: 800, letterSpacing: "0.2em", color: "var(--color-bright)",
            }}>STRATUM</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {activeAlerts > 0 && (
              <span style={{
                padding: "2px 8px",
                background: "var(--color-critical)",
                color: "#fff", borderRadius: "10px",
                fontSize: "10px", fontWeight: 700,
                fontFamily: "var(--font-mono)",
                animation: "blink 1.5s infinite",
              }}>{activeAlerts}</span>
            )}
            <button onClick={() => setMobileOpen(true)}
              style={{
                padding: "8px",
                background: "var(--color-bg-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-bright)",
                display: "flex",
              }}>
              <Menu size={16} />
            </button>
          </div>
        </header>

        {/* Alert ticker */}
        {activeAlerts > 0 && (
          <div style={{
            background: "rgba(255,68,68,0.08)",
            borderBottom: "1px solid rgba(255,68,68,0.2)",
            overflow: "hidden", height: "32px",
            display: "flex", alignItems: "center",
          }}>
            <div style={{
              padding: "0 14px",
              fontFamily: "var(--font-mono)", fontSize: "9px",
              color: "var(--color-critical)", fontWeight: 700,
              letterSpacing: "0.1em", flexShrink: 0,
              borderRight: "1px solid rgba(255,68,68,0.2)",
            }}>
              ⚠ ALERT
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{
                display: "flex", gap: "48px",
                animation: "ticker 30s linear infinite",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-mono)", fontSize: "10px",
                color: "rgba(255,100,100,0.8)", padding: "0 24px",
              }}>
                {/* Ticker content rendered by parent */}
              </div>
            </div>
          </div>
        )}

        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }} className="dash-main">
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dash-sidebar { display: none !important; }
          .dash-topbar  { display: flex !important; }
          .dash-main    { padding: 12px !important; }
        }
      `}</style>
    </div>
  );
};

export default DashLayout;
