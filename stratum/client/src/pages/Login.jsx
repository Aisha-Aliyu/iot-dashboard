import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuthStore from "../store/authStore";
import HudCard from "../components/ui/HudCard";
import Spinner from "../components/ui/Spinner";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success("Access granted");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      position: "relative",
    }}>
      {/* Scan line animation */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent, var(--color-bright), transparent)",
        animation: "scan 4s linear infinite",
        opacity: 0.3,
        zIndex: 100,
      }} />

      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "16px",
            marginBottom: "12px",
          }}>
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="8" fill="#002b36"/>
              <rect x="8" y="44" width="48" height="4" rx="1" fill="#14655b"/>
              <rect x="8" y="34" width="36" height="4" rx="1" fill="#14655b"/>
              <rect x="8" y="24" width="48" height="4" rx="1" fill="#a7ffeb"/>
              <rect x="8" y="14" width="24" height="4" rx="1" fill="#14655b"/>
            </svg>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "32px", fontWeight: 800,
              color: "var(--color-bright)",
              letterSpacing: "0.2em",
            }}>STRATUM</h1>
          </div>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px", color: "var(--color-text-muted)",
            letterSpacing: "0.15em", textTransform: "uppercase",
          }}>
            IoT Monitoring System // v1.0.0
          </p>
        </div>

        <HudCard>
          <div style={{ padding: "32px" }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px", color: "var(--color-text-muted)",
              letterSpacing: "0.15em", marginBottom: "24px",
            }}>
              {">"} AUTHENTICATION REQUIRED
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "EMAIL_ADDRESS", name: "email", type: "email", placeholder: "operator@stratum.io" },
                { label: "ACCESS_KEY", name: "password", type: "password", placeholder: "••••••••••••" },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name}>
                  <label style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px", fontWeight: 700,
                    letterSpacing: "0.15em", color: "var(--color-text-muted)",
                    textTransform: "uppercase", marginBottom: "6px",
                  }}>{label}</label>
                  <input
                    type={type} name={name} value={form[name]}
                    onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                    placeholder={placeholder}
                    autoComplete={name === "email" ? "email" : "current-password"}
                    style={{
                      width: "100%", padding: "11px 14px",
                      background: "var(--color-bg-raised)",
                      border: "1px solid var(--color-border-mid)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--color-bright)",
                      fontFamily: "var(--font-mono)", fontSize: "13px",
                      outline: "none", transition: "border-color var(--t-fast)",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--color-mid)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--color-border-mid)"}
                  />
                </div>
              ))}

              <button
                type="submit" disabled={loading}
                style={{
                  marginTop: "8px",
                  padding: "13px",
                  background: loading ? "var(--color-bg-raised)" : "linear-gradient(135deg, #002b36, #14655b)",
                  border: "1px solid var(--color-border-act)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-bright)",
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  boxShadow: "var(--shadow-glow)",
                  transition: "all var(--t-fast)",
                }}
              >
                {loading ? <Spinner size={16} /> : null}
                {loading ? "AUTHENTICATING..." : "INITIATE ACCESS"}
              </button>
            </form>

            <div style={{
              marginTop: "20px",
              padding: "12px",
              background: "var(--color-bg-raised)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                // DEMO CREDENTIALS
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-sec)" }}>
                admin@stratum.io / Stratum@Admin1!
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-sec)" }}>
                operator@stratum.io / Stratum@Op1!
              </p>
            </div>
          </div>
        </HudCard>
      </div>
    </div>
  );
};

export default Login;
