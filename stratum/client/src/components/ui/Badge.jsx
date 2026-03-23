const VARIANTS = {
  ONLINE:      { bg: "rgba(167,255,235,0.1)", color: "var(--color-online)",   border: "rgba(167,255,235,0.2)" },
  OFFLINE:     { bg: "rgba(50,50,70,0.3)",    color: "#556",                  border: "rgba(50,50,80,0.4)" },
  WARNING:     { bg: "rgba(255,204,0,0.1)",   color: "var(--color-warning)",  border: "rgba(255,204,0,0.25)" },
  CRITICAL:    { bg: "rgba(255,68,68,0.1)",   color: "var(--color-critical)", border: "rgba(255,68,68,0.25)" },
  ACTIVE:      { bg: "rgba(255,68,68,0.1)",   color: "var(--color-critical)", border: "rgba(255,68,68,0.25)" },
  ACKNOWLEDGED:{ bg: "rgba(255,204,0,0.1)",   color: "var(--color-warning)",  border: "rgba(255,204,0,0.2)" },
  RESOLVED:    { bg: "rgba(167,255,235,0.08)",color: "var(--color-text-sec)", border: "rgba(167,255,235,0.15)" },
  INFO:        { bg: "rgba(77,184,255,0.1)",  color: "var(--color-info)",     border: "rgba(77,184,255,0.2)" },
  ADMIN:       { bg: "rgba(192,132,252,0.1)", color: "#c084fc",               border: "rgba(192,132,252,0.2)" },
  OPERATOR:    { bg: "rgba(167,255,235,0.08)",color: "var(--color-text-sec)", border: "var(--color-border)" },
};

const Badge = ({ label, variant = "INFO" }) => {
  const s = VARIANTS[variant] || VARIANTS.INFO;
  return (
    <span style={{
      padding: "2px 10px",
      borderRadius: "var(--radius-sm)",
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: "10px", fontWeight: 700,
      fontFamily: "var(--font-mono)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      display: "inline-flex", alignItems: "center",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
};

export default Badge;
