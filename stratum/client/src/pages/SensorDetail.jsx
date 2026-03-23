import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Thermometer, Droplets, Zap, Eye, Wind } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import HudCard from "../components/ui/HudCard";
import StatusDot from "../components/ui/StatusDot";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { SENSOR_TYPES } from "../config/sensorConfig";
import useSensorStore from "../store/sensorStore";
import api from "../api/axios";

const TYPE_ICONS = {
  TEMPERATURE: Thermometer,
  HUMIDITY: Droplets,
  ENERGY: Zap,
  MOTION: Eye,
  AIR_QUALITY: Wind,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--color-bg-panel)",
      border: "1px solid var(--color-border-mid)",
      borderRadius: "var(--radius-md)",
      padding: "10px 14px",
    }}>
      <p style={{
        fontFamily: "var(--font-mono)", fontSize: "9px",
        color: "var(--color-text-muted)", marginBottom: "6px",
        letterSpacing: "0.1em",
      }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{
          fontFamily: "var(--font-mono)", fontSize: "12px",
          color: p.color, fontWeight: 700,
        }}>
          {p.dataKey.toUpperCase()}: {Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

const SensorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { history } = useSensorStore();
  const liveHistory = history[id] || [];

  const { data, isLoading } = useQuery({
    queryKey: ["sensor", id],
    queryFn: async () => {
      const { data } = await api.get(`/sensors/${id}?hours=6`);
      return data.sensor;
    },
    refetchInterval: 10000,
  });

  const { data: aggData } = useQuery({
    queryKey: ["sensor-history", id],
    queryFn: async () => {
      const { data } = await api.get(`/sensors/${id}/history?hours=24&buckets=48`);
      return data.data;
    },
    refetchInterval: 30000,
  });

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
      <Spinner size={28} />
    </div>
  );

  if (!data) return (
    <div style={{
      textAlign: "center", padding: "60px",
      fontFamily: "var(--font-mono)", color: "var(--color-text-muted)",
    }}>
      SENSOR NOT FOUND
    </div>
  );

  const config = SENSOR_TYPES[data.type] || {};
  const Icon = TYPE_ICONS[data.type] || Zap;
  const chartData = aggData?.length > 0 ? aggData : liveHistory;
  const latestValue = data.latestReading?.value;

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* Back */}
      <button onClick={() => navigate(-1)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          fontFamily: "var(--font-mono)", fontSize: "10px",
          color: "var(--color-text-muted)", letterSpacing: "0.12em",
          marginBottom: "20px", background: "none",
          transition: "color var(--t-fast)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-bright)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
      >
        <ArrowLeft size={14} />
        BACK TO OVERVIEW
      </button>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.2em", marginBottom: "6px",
        }}>
          {">"} {data.type.replace("_", " ")} · {data.location} · FLOOR {data.floor}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: 44, height: 44,
            background: `${config.color}15`,
            borderRadius: "var(--radius-md)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: config.color,
          }}>
            <Icon size={22} />
          </div>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "20px", color: "var(--color-bright)",
              letterSpacing: "0.1em",
            }}>{data.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <StatusDot status={data.status} size={7} />
              <Badge label={data.status} variant={data.status} />
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "9px",
                color: "var(--color-text-muted)",
              }}>
                {data.zone}
              </span>
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: "40px", color: config.color,
              lineHeight: 1,
              textShadow: `0 0 30px ${config.color}40`,
            }}>
              {latestValue !== undefined ? Number(latestValue).toFixed(1) : "--"}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "12px",
              color: "var(--color-text-muted)",
            }}>{data.unit}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <HudCard style={{ marginBottom: "20px" }}>
        <div style={{ padding: "20px 20px 12px" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "9px",
            color: "var(--color-text-muted)", letterSpacing: "0.15em",
            marginBottom: "16px",
          }}>
            // 24H TIME SERIES
          </div>
          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.chartColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={config.chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,255,235,0.05)" />
                <XAxis
                  dataKey={chartData === aggData ? "timestamp" : "time"}
                  tick={{ fontFamily: "Space Mono", fontSize: 9, fill: "var(--color-text-muted)" }}
                  tickFormatter={(v) => {
                    try { return new Date(v).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }); }
                    catch { return v; }
                  }}
                  interval="preserveStartEnd"
                  stroke="var(--color-border)"
                />
                <YAxis
                  tick={{ fontFamily: "Space Mono", fontSize: 9, fill: "var(--color-text-muted)" }}
                  stroke="var(--color-border)"
                />
                <Tooltip content={<CustomTooltip />} />
                {data.maxThreshold && (
                  <ReferenceLine
                    y={data.maxThreshold}
                    stroke="var(--color-critical)"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                    label={{ value: "MAX", position: "right", fill: "var(--color-critical)", fontSize: 9, fontFamily: "Space Mono" }}
                  />
                )}
                {data.minThreshold && (
                  <ReferenceLine
                    y={data.minThreshold}
                    stroke="var(--color-warning)"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                    label={{ value: "MIN", position: "right", fill: "var(--color-warning)", fontSize: 9, fontFamily: "Space Mono" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey={chartData === aggData ? "avg" : "value"}
                  stroke={config.chartColor}
                  strokeWidth={2}
                  fill="url(#chartGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
                {chartData === aggData && (
                  <>
                    <Area type="monotone" dataKey="max" stroke={config.chartColor}
                      strokeWidth={1} strokeOpacity={0.3} fill="none" dot={false} isAnimationActive={false} />
                    <Area type="monotone" dataKey="min" stroke={config.chartColor}
                      strokeWidth={1} strokeOpacity={0.3} fill="none" dot={false} isAnimationActive={false} />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </HudCard>

      {/* Info + metadata */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "20px",
      }} className="detail-grid">
        {/* Thresholds */}
        <HudCard>
          <div style={{ padding: "18px 20px" }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "9px",
              color: "var(--color-text-muted)", letterSpacing: "0.15em", marginBottom: "14px",
            }}>
              // THRESHOLDS
            </div>
            {[
              { label: "MIN THRESHOLD", value: data.minThreshold ?? "N/A", color: "var(--color-warning)" },
              { label: "MAX THRESHOLD", value: data.maxThreshold ?? "N/A", color: "var(--color-critical)" },
              { label: "CURRENT VALUE", value: latestValue !== undefined ? `${Number(latestValue).toFixed(2)} ${data.unit}` : "N/A", color: config.color },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid var(--color-border)",
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color, fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </HudCard>

        {/* Metadata */}
        <HudCard>
          <div style={{ padding: "18px 20px" }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "9px",
              color: "var(--color-text-muted)", letterSpacing: "0.15em", marginBottom: "14px",
            }}>
              // DEVICE INFO
            </div>
            {[
              { label: "MODEL", value: data.model || "N/A" },
              { label: "FIRMWARE", value: data.firmware || "N/A" },
              { label: "FLOOR", value: `FLOOR ${data.floor}` },
              { label: "ZONE", value: data.zone },
              { label: "INSTALLED", value: new Date(data.installedAt).toLocaleDateString() },
              { label: "LAST SEEN", value: data.lastSeenAt ? new Date(data.lastSeenAt).toLocaleTimeString("en-US", { hour12: false }) : "N/A" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid var(--color-border)",
              }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-sec)", fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </HudCard>
      </div>

      {/* Recent readings table */}
      <HudCard>
        <div style={{ padding: "18px 20px" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "9px",
            color: "var(--color-text-muted)", letterSpacing: "0.15em", marginBottom: "14px",
          }}>
            // RECENT READINGS
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["TIMESTAMP", "VALUE", "UNIT", "QUALITY"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "8px 12px",
                      fontFamily: "var(--font-mono)", fontSize: "8px",
                      color: "var(--color-text-muted)", letterSpacing: "0.15em",
                      borderBottom: "1px solid var(--color-border)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.history || []).slice(-10).reverse().map((r, i) => (
                  <tr key={i}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-bg-raised)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)" }}>
                      {new Date(r.timestamp).toLocaleString("en-US", { hour12: false })}
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "11px", color: config.color, fontWeight: 700 }}>
                      {Number(r.value).toFixed(2)}
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)" }}>
                      {r.unit}
                    </td>
                    <td style={{ padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "10px", color: r.quality >= 90 ? "var(--color-online)" : r.quality >= 70 ? "var(--color-warning)" : "var(--color-critical)" }}>
                      {r.quality}%
                    </td>
                  </tr>
                ))}
                {(!data.history || data.history.length === 0) && (
                  <tr>
                    <td colSpan={4} style={{ padding: "24px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)" }}>
                      NO READINGS YET
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </HudCard>

      <style>{`
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default SensorDetail;
