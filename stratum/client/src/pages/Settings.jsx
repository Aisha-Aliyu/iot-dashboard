import { useState } from "react";
import { toast } from "react-hot-toast";
import HudCard from "../components/ui/HudCard";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import useAuthStore from "../store/authStore";
import useSensorStore from "../store/sensorStore";
import api from "../api/axios";

const Settings = () => {
  const { user } = useAuthStore();
  const { stats, wsConnected, lastUpdate } = useSensorStore();
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (pwForm.newPw.length < 8) {
      toast.error("Min 8 characters");
      return;
    }
    setPwLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.newPw,
      });
      toast.success("Password updated");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setPwLoading(false);
    }
  };

  const Section = ({ title, children }) => (
    <HudCard style={{ marginBottom: "16px" }}>
      <div style={{ padding: "20px 22px" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.15em",
          marginBottom: "16px",
        }}>// {title}</div>
        {children}
      </div>
    </HudCard>
  );

  const Row = ({ label, value, color }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: "1px solid var(--color-border)",
    }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: color || "var(--color-text-sec)", fontWeight: 700 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.2em", marginBottom: "4px",
        }}>{">"} SYSTEM CONFIGURATION</div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "20px", color: "var(--color-bright)", letterSpacing: "0.15em",
        }}>SETTINGS</h1>
      </div>

      {/* Account */}
      <Section title="ACCOUNT INFO">
        <Row label="EMAIL" value={user?.email} />
        <Row label="DISPLAY NAME" value={user?.displayName || "N/A"} />
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "9px 0", borderBottom: "1px solid var(--color-border)",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>ACCESS LEVEL</span>
          <Badge label={user?.role || "VIEWER"} variant={user?.role || "INFO"} />
        </div>
      </Section>

      {/* System status */}
      <Section title="SYSTEM STATUS">
        <Row
          label="WEBSOCKET"
          value={wsConnected ? "CONNECTED" : "DISCONNECTED"}
          color={wsConnected ? "var(--color-online)" : "var(--color-critical)"}
        />
        <Row label="TOTAL SENSORS" value={stats?.sensors?.total ?? "--"} />
        <Row label="ONLINE SENSORS" value={stats?.sensors?.online ?? "--"} color="var(--color-online)" />
        <Row label="ACTIVE ALERTS" value={stats?.alerts?.active ?? "--"}
          color={stats?.alerts?.active > 0 ? "var(--color-critical)" : "var(--color-text-muted)"} />
        <Row label="READINGS (24H)" value={stats?.readings?.last24h?.toLocaleString() ?? "--"} />
        <Row
          label="LAST UPDATE"
          value={lastUpdate ? lastUpdate.toLocaleTimeString("en-US", { hour12: false }) : "N/A"}
        />
      </Section>

      {/* Change password, only for LOCAL auth */}
      <Section title="CHANGE ACCESS KEY">
        <form onSubmit={handlePwChange} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: "CURRENT KEY", name: "current", value: pwForm.current, onChange: (v) => setPwForm((p) => ({ ...p, current: v })) },
            { label: "NEW KEY", name: "newPw", value: pwForm.newPw, onChange: (v) => setPwForm((p) => ({ ...p, newPw: v })) },
            { label: "CONFIRM NEW KEY", name: "confirm", value: pwForm.confirm, onChange: (v) => setPwForm((p) => ({ ...p, confirm: v })) },
          ].map(({ label, name, value, onChange }) => (
            <div key={name}>
              <label style={{
                display: "block", fontFamily: "var(--font-mono)",
                fontSize: "9px", color: "var(--color-text-muted)",
                letterSpacing: "0.12em", marginBottom: "5px",
              }}>{label}</label>
              <input
                type="password" value={value} onChange={(e) => onChange(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--color-bg-raised)",
                  border: "1px solid var(--color-border-mid)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-bright)",
                  fontFamily: "var(--font-mono)", fontSize: "13px",
                  outline: "none",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-mid)"}
                onBlur={(e) => e.target.style.borderColor = "var(--color-border-mid)"}
              />
            </div>
          ))}
          <button type="submit" disabled={pwLoading}
            style={{
              padding: "10px 22px", alignSelf: "flex-start",
              background: "linear-gradient(135deg, #002b36, #14655b)",
              border: "1px solid var(--color-border-act)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-bright)",
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "10px", letterSpacing: "0.15em",
              cursor: pwLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
            {pwLoading && <Spinner size={14} />}
            UPDATE ACCESS KEY
          </button>
        </form>
      </Section>

      {/* About */}
      <Section title="SYSTEM INFO">
        <Row label="APPLICATION" value="STRATUM IoT Monitor" />
        <Row label="VERSION" value="v1.0.0" />
        <Row label="BUILT BY" value="BLOODLINE Studios" />
        <Row label="STACK" value="Node.js · PostgreSQL · Redis · React" />
      </Section>
    </div>
  );
};

export default Settings;
