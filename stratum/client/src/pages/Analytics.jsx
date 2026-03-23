import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import HudCard from "../components/ui/HudCard";
import Spinner from "../components/ui/Spinner";
import { SENSOR_TYPES } from "../config/sensorConfig";
import useSensorStore from "../store/sensorStore";
import api from "../api/axios";

const HOURS_OPTIONS = [1, 3, 6, 12, 24];

const Analytics = () => {
  const { sensors } = useSensorStore();
  const [selectedType, setSelectedType] = useState("TEMPERATURE");
  const [hours, setHours] = useState(6);

  const sensorList = Object.values(sensors).filter((s) => s.type === selectedType);
  const config = SENSOR_TYPES[selectedType] || {};

  // Fetch history for each sensor of the selected type
  const historyQueries = useQuery({
    queryKey: ["analytics", selectedType, hours],
    queryFn: async () => {
      const results = await Promise.all(
        sensorList.map((s) =>
          api.get(`/sensors/${s.sensorId}/history?hours=${hours}&buckets=40`)
            .then((r) => ({ sensorId: s.sensorId, name: s.name, data: r.data.data }))
            .catch(() => ({ sensorId: s.sensorId, name: s.name, data: [] }))
        )
      );
      return results;
    },
    enabled: sensorList.length > 0,
    refetchInterval: 30000,
  });

  // Merge all sensor histories into a single time-keyed dataset
  const mergedData = (() => {
    const byTime = {};
    (historyQueries.data || []).forEach(({ sensorId, name, data }) => {
      data.forEach((point) => {
        const key = point.timestamp;
        if (!byTime[key]) byTime[key] = { time: new Date(key).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" }) };
        byTime[key][sensorId] = point.avg;
      });
    });
    return Object.values(byTime).sort((a, b) => a.time.localeCompare(b.time));
  })();

  const CHART_COLORS = ["#a7ffeb", "#4db8ff", "#ffcc00", "#c084fc"];

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.2em", marginBottom: "4px",
        }}>{">"} MULTI-SENSOR ANALYSIS</div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "20px", color: "var(--color-bright)", letterSpacing: "0.15em",
        }}>ANALYTICS</h1>
      </div>

      {/* Controls */}
      <HudCard style={{ marginBottom: "20px" }}>
        <div style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "8px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
              alignSelf: "center", marginRight: "4px",
            }}>SENSOR TYPE:</span>
            {Object.keys(SENSOR_TYPES).map((type) => (
              <button key={type} onClick={() => setSelectedType(type)}
                style={{
                  padding: "5px 12px",
                  background: selectedType === type ? "rgba(20,101,91,0.3)" : "transparent",
                  border: `1px solid ${selectedType === type ? "var(--color-mid)" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-mono)", fontSize: "9px",
                  color: selectedType === type ? "var(--color-bright)" : "var(--color-text-muted)",
                  letterSpacing: "0.08em", cursor: "pointer",
                  transition: "all var(--t-fast)",
                }}>
                {SENSOR_TYPES[type].label.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "8px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
              alignSelf: "center", marginRight: "4px",
            }}>TIME RANGE:</span>
            {HOURS_OPTIONS.map((h) => (
              <button key={h} onClick={() => setHours(h)}
                style={{
                  padding: "5px 12px",
                  background: hours === h ? "rgba(20,101,91,0.3)" : "transparent",
                  border: `1px solid ${hours === h ? "var(--color-mid)" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-mono)", fontSize: "9px",
                  color: hours === h ? "var(--color-bright)" : "var(--color-text-muted)",
                  letterSpacing: "0.08em", cursor: "pointer",
                  transition: "all var(--t-fast)",
                }}>
                {h}H
              </button>
            ))}
          </div>
        </div>
      </HudCard>

      {/* Multi-sensor chart */}
      <HudCard style={{ marginBottom: "20px" }}>
        <div style={{ padding: "20px" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "9px",
            color: "var(--color-text-muted)", letterSpacing: "0.15em", marginBottom: "16px",
          }}>
            // {config.label?.toUpperCase()} SENSORS · {hours}H COMPARISON · AVG VALUES
          </div>
          <div style={{ height: "280px" }}>
            {historyQueries.isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <Spinner size={24} />
              </div>
            ) : mergedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,255,235,0.05)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontFamily: "Space Mono", fontSize: 9, fill: "var(--color-text-muted)" }}
                    stroke="var(--color-border)"
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontFamily: "Space Mono", fontSize: 9, fill: "var(--color-text-muted)" }}
                    stroke="var(--color-border)"
                    unit={` ${config.unit}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-bg-panel)",
                      border: "1px solid var(--color-border-mid)",
                      borderRadius: "var(--radius-md)",
                      fontFamily: "Space Mono", fontSize: "10px",
                      color: "var(--color-text-sec)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontFamily: "Space Mono", fontSize: "9px", color: "var(--color-text-muted)" }}
                  />
                  {(historyQueries.data || []).map(({ sensorId, name }, i) => (
                    <Line
                      key={sensorId}
                      type="monotone"
                      dataKey={sensorId}
                      name={name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: "100%",
                fontFamily: "var(--font-mono)", fontSize: "11px",
                color: "var(--color-text-muted)", letterSpacing: "0.1em",
              }}>
                AWAITING DATA // SIMULATOR BUILDING HISTORY
              </div>
            )}
          </div>
        </div>
      </HudCard>

      {/* Per-sensor stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "14px",
      }}>
        {sensorList.map((sensor, i) => {
          const sensorHistory = (historyQueries.data || []).find((h) => h.sensorId === sensor.sensorId);
          const vals = sensorHistory?.data?.map((p) => p.avg) || [];
          const avg = vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length) : null;
          const max = vals.length ? Math.max(...vals) : null;
          const min = vals.length ? Math.min(...vals) : null;

          return (
            <HudCard key={sensor.sensorId}>
              <div style={{ padding: "16px" }}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "9px",
                  color: "var(--color-text-muted)", letterSpacing: "0.1em", marginBottom: "10px",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {sensor.name}
                </div>
                {[
                  { label: "AVG", value: avg, color: CHART_COLORS[i % 4] },
                  { label: "MAX", value: max, color: "var(--color-critical)" },
                  { label: "MIN", value: min, color: "var(--color-info)" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color, fontWeight: 700 }}>
                      {value !== null ? `${value.toFixed(1)} ${config.unit}` : "---"}
                    </span>
                  </div>
                ))}
              </div>
            </HudCard>
          );
        })}
      </div>
    </div>
  );
};

export default Analytics;
