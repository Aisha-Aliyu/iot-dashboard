const Spinner = ({ size = 20, color = "var(--color-bright)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    style={{ animation: "spin 0.8s linear infinite" }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeOpacity="0.15" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default Spinner;
