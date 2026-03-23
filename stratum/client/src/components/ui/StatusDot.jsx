const STATUS_COLORS = {
  ONLINE:      "var(--color-online)",
  OFFLINE:     "var(--color-offline)",
  WARNING:     "var(--color-warning)",
  CRITICAL:    "var(--color-critical)",
  MAINTENANCE: "var(--color-info)",
};

const StatusDot = ({ status, size = 8, pulse = true }) => {
  const color = STATUS_COLORS[status] || "var(--color-text-muted)";
  const shouldPulse = pulse && (status === "ONLINE" || status === "CRITICAL" || status === "WARNING");

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {shouldPulse && (
        <span style={{
          position: "absolute",
          width: size, height: size,
          borderRadius: "50%",
          background: color,
          opacity: 0.4,
          animation: "pulse-ring 2s ease-out infinite",
        }} />
      )}
      <span style={{
        width: size, height: size,
        borderRadius: "50%",
        background: color,
        display: "block",
        boxShadow: `0 0 ${size}px ${color}`,
      }} />
    </span>
  );
};

export default StatusDot;
