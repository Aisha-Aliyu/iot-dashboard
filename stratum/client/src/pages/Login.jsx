import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuthStore from "../store/authStore";
import HudCard from "../components/ui/HudCard";
import Spinner from "../components/ui/Spinner";
import { DEMO_ACCOUNT, HEALTH_URL } from "../config/demo";

const WAKE_CHECK_MS = 5000;
const WAKE_ATTEMPTS = 24;

const SERVER_STATUS = {
  checking: "Checking the server...",
  waking: "Waking the server. After a quiet spell this takes about a minute.",
  online: "Server online",
  offline: "The server isn't answering right now. Try again in a few minutes.",
};

// The free server sleeps when nobody uses it, so start waking it as soon as the page opens
const useServerStatus = () => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    let attempts = 0;

    const check = async () => {
      try {
        const res = await fetch(HEALTH_URL, { cache: "no-store" });
        if (res.ok) {
          if (!cancelled) setStatus("online");
          return;
        }
      } catch {
        // Still asleep or starting up
      }
      if (cancelled) return;
      attempts += 1;
      if (attempts >= WAKE_ATTEMPTS) {
        setStatus("offline");
        return;
      }
      setStatus("waking");
      timer = setTimeout(check, WAKE_CHECK_MS);
    };

    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return status;
};

const labelStyle = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: "9px", fontWeight: 700,
  letterSpacing: "0.15em", color: "var(--color-text-muted)",
  textTransform: "uppercase", marginBottom: "6px",
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(null);
  const serverStatus = useServerStatus();

  const signIn = async (email, password, source) => {
    setLoading(source);
    const result = await login(email, password);
    setLoading(null);
    if (result.success) {
      toast.success("Access granted");
      navigate("/");
    } else {
      toast.error(result.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(form.email, form.password, "form");
  };

  const handleDemo = () => {
    setForm(DEMO_ACCOUNT);
    signIn(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password, "demo");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      position: "relative",
    }}>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: "2px",
        background: "linear-gradient(90deg, transparent, var(--color-bright), transparent)",
        animation: "scan 4s linear infinite",
        opacity: 0.3,
        zIndex: 100,
      }} />

      <div style={{ width: "100%", maxWidth: "420px" }}>
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
            <section aria-labelledby="demo-access" style={{
              padding: "18px",
              marginBottom: "28px",
              background: "var(--color-bg-raised)",
              border: "1px solid var(--color-border-act)",
              borderRadius: "var(--radius-md)",
            }}>
              <h2 id="demo-access" style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px", fontWeight: 700, color: "var(--color-bright)",
                letterSpacing: "0.15em", margin: "0 0 8px",
              }}>
                {">"} DEMO ACCESS
              </h2>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: "12px",
                color: "var(--color-text-sec)", lineHeight: 1.6, margin: "0 0 14px",
              }}>
                Sign in as the demo operator to explore the live dashboard. No sign-up needed.
              </p>

              <button
                type="button" onClick={handleDemo} disabled={loading !== null}
                style={{
                  width: "100%", padding: "13px",
                  background: "var(--color-mid)",
                  border: "1px solid var(--color-border-bright)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-bright)",
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase",
                  cursor: loading !== null ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                }}
              >
                {loading === "demo" ? <Spinner size={16} /> : null}
                {loading === "demo" ? "SIGNING IN..." : "TRY THE DEMO"}
              </button>

              <dl style={{
                display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 12px",
                margin: "14px 0 0",
                fontFamily: "var(--font-mono)", fontSize: "11px",
              }}>
                <dt style={{ color: "var(--color-text-muted)" }}>EMAIL</dt>
                <dd style={{ margin: 0, color: "var(--color-text-sec)", overflowWrap: "anywhere" }}>
                  {DEMO_ACCOUNT.email}
                </dd>
                <dt style={{ color: "var(--color-text-muted)" }}>PASSWORD</dt>
                <dd style={{ margin: 0, color: "var(--color-text-sec)" }}>{DEMO_ACCOUNT.password}</dd>
              </dl>

              <p role="status" style={{
                display: "flex", alignItems: "center", gap: "8px",
                fontFamily: "var(--font-mono)", fontSize: "11px", lineHeight: 1.5,
                color: serverStatus === "offline" ? "var(--color-critical)" : "var(--color-text-sec)",
                margin: "14px 0 0",
              }}>
                {serverStatus === "online" ? (
                  <span aria-hidden="true" style={{
                    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                    background: "var(--color-online)",
                  }} />
                ) : serverStatus !== "offline" ? <Spinner size={12} /> : null}
                {SERVER_STATUS[serverStatus]}
              </p>
            </section>

            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px", color: "var(--color-text-muted)",
              letterSpacing: "0.15em", marginBottom: "24px",
            }}>
              {">"} OR SIGN IN WITH YOUR ACCOUNT
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "EMAIL_ADDRESS", name: "email", type: "email", placeholder: "operator@stratum.io" },
                { label: "ACCESS_KEY", name: "password", type: "password", placeholder: "••••••••••••" },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name}>
                  <label htmlFor={`login-${name}`} style={labelStyle}>{label}</label>
                  <input
                    id={`login-${name}`}
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
                type="submit" disabled={loading !== null}
                style={{
                  marginTop: "8px",
                  padding: "13px",
                  background: loading === "form" ? "var(--color-bg-raised)" : "linear-gradient(135deg, #002b36, #14655b)",
                  border: "1px solid var(--color-border-act)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-bright)",
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase",
                  cursor: loading !== null ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  boxShadow: "var(--shadow-glow)",
                  transition: "all var(--t-fast)",
                }}
              >
                {loading === "form" ? <Spinner size={16} /> : null}
                {loading === "form" ? "AUTHENTICATING..." : "INITIATE ACCESS"}
              </button>
            </form>
          </div>
        </HudCard>
      </div>
    </div>
  );
};

export default Login;
