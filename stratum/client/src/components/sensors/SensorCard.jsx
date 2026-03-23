import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { SENSOR_TYPES, getStatusColor } from "../../config/sensorConfig";
import StatusDot from "../ui/StatusDot";
import HudCard from "../ui/HudCard";
import useSensorStore from "../../store/sensorStore";

const SensorCard = ({ sensor }) => {
  const navigate = useNavigate();
  const { history } = useSensorStore();
  const config = SENSOR_TYPES[sensor.type] || {};
  const sensorHistory = history[sensor.sensorId] || [];
  const isCritical = sensor.status === "CRITICAL";
  const isWarning = sensor.status === "WARNING";

  const formatValue = (v) => {
    if (v === undefined || v === null) return "---";
    return typeof v === "number" ? v.toFixed(1) : v;
  };

  return (
    <HudCard
      glow={isCritical}
      style={{
        cursor: "pointer",
        transition: "all var(--t-base)",
        borderColor: isCritical
          ? "rgba(255,68,68,0.3)"
          : isWarning
          ? "rgba(255,204,0,0.2)"
          : "var(--color-border)",
      }}
      onClick={() => navigate(`/sensors/${sensor.sensorId}`)}
    >
      <div style={{ padding: "16px" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", marginBottom: "12px",
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "9px",
              color: "var(--color-text-muted)", letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: "3px",
            }}>
              {config.label} · {sensor.zone}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "11px",
              color: "var(--color-text-sec)", fontWeight: 700,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {sensor.name}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, marginLeft: "8px" }}>
            <StatusDot status={sensor.status} size={7} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "8px",
              color: getStatusColor(sensor.status), letterSpacing: "0.08em",
            }}>
              {sensor.status}
            </span>
          </div>
        </div>

        {/* Value */}
        <div style={{
          display: "flex", alignItems: "baseline", gap: "6px",
          marginBottom: "12px",
        }}>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: "32px", color: config.color || "var(--color-bright)",
            lineHeight: 1,
            textShadow: `0 0 20px ${config.color || "var(--color-bright)"}40`,
          }}>
            {formatValue(sensor.value)}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "12px",
            color: "var(--color-text-muted)",
          }}>
            {sensor.unit}
          </span>
        </div>

        {/* Sparkline */}
        <div style={{ height: "40px", margin: "0 -4px" }}>
          {sensorHistory.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensorHistory}>
                <defs>
                  <linearGradient id={`grad-${sensor.sensorId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={config.chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={config.chartColor}
                  strokeWidth={1.5}
                  fill={`url(#grad-${sensor.sensorId})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: "100%", display: "flex", alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)", fontSize: "9px",
              color: "var(--color-text-muted)",
            }}>
              AWAITING DATA...
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "10px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "8px",
            color: "var(--color-text-muted)", letterSpacing: "0.08em",
          }}>
            {sensor.location}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "8px",
            color: "var(--color-text-muted)",
          }}>
            {sensor.timestamp
              ? new Date(sensor.timestamp).toLocaleTimeString("en-US", { hour12: false })
              : "--:--:--"}
          </span>
        </div>
      </div>
    </HudCard>
  );
};

export default SensorCard;
