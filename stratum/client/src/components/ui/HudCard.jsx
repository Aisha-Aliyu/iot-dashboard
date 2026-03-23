const HudCard = ({ children, className = "", glow = false, style = {} }) => (
  <div style={{
    background: "var(--color-bg-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    position: "relative",
    overflow: "hidden",
    boxShadow: glow ? "var(--shadow-glow)" : "var(--shadow-sm)",
    animation: glow ? "glow-pulse 3s ease-in-out infinite" : "none",
    ...style,
  }}>
    {/* Corner accents */}
    <div style={{
      position: "absolute", top: 0, left: 0,
      width: 12, height: 12,
      borderTop: "1.5px solid var(--color-mid)",
      borderLeft: "1.5px solid var(--color-mid)",
    }} />
    <div style={{
      position: "absolute", top: 0, right: 0,
      width: 12, height: 12,
      borderTop: "1.5px solid var(--color-mid)",
      borderRight: "1.5px solid var(--color-mid)",
    }} />
    <div style={{
      position: "absolute", bottom: 0, left: 0,
      width: 12, height: 12,
      borderBottom: "1.5px solid var(--color-mid)",
      borderLeft: "1.5px solid var(--color-mid)",
    }} />
    <div style={{
      position: "absolute", bottom: 0, right: 0,
      width: 12, height: 12,
      borderBottom: "1.5px solid var(--color-mid)",
      borderRight: "1.5px solid var(--color-mid)",
    }} />
    {children}
  </div>
);

export default HudCard;
