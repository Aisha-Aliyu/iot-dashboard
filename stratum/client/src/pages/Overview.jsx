import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Cpu, AlertTriangle, Zap } from "lucide-react";
import { useWebSocket } from "../hooks/useWebSocket";
import useSensorStore from "../store/sensorStore";
import SensorCard from "../components/sensors/SensorCard";
import HudCard from "../components/ui/HudCard";
import Spinner from "../components/ui/Spinner";
import api from "../api/axios";

const StatBlock = ({ icon: Icon, label, value, sub, color }) => (
  <HudCard>
    <div style={{ padding: "18px 20px", display: "flex", gap: "14px", alignItems: "center" }}>
      <div style={{
        width: 44, height: 44,
        borderRadius: "var(--radius-md)",
        background: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, flexShrink: 0,
        boxShadow: `0 0 20px ${color}20`,
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "26px", color, lineHeight: 1,
        }}>{value ?? "--"}</div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.12em",
          textTransform: "uppercase", marginTop: "2px",
        }}>{label}</div>
        {sub && (
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "9px",
            color, marginTop: "2px",
          }}>{sub}</div>
        )}
      </div>
    </div>
  </HudCard>
);

const Overview = () => {
  const {
    sensors, alerts, stats, updateSensors,
    setAlerts, setStats, setWsConnected,
  } = useSensorStore();

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const { data } = await api.get("/dashboard/overview");
      return data;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (initialData) {
      if (initialData.sensors) {
        const mapped = initialData.sensors.map((s) => ({
          sensorId: s.id,
          name: s.name,
          type: s.type,
          location: s.location,
          zone: s.zone,
          floor: s.floor,
          posX: s.posX,
          posY: s.posY,
          value: s.latestReading?.value,
          unit: s.unit,
          status: s.status,
          timestamp: s.latestReading?.timestamp || s.lastSeenAt,
        }));
        updateSensors(mapped);
      }
      if (initialData.alerts) setAlerts(initialData.alerts);
      if (initialData.stats) setStats(initialData.stats);
    }
  }, [initialData]);

  const handleWsMessage = useCallback((msg) => {
    switch (msg.type) {
      case "SENSOR_UPDATE":
        updateSensors(msg.payload);
        break;
      case "ALERT":
        setAlerts((prev) => [msg.payload, ...(prev || [])]);
        break;
      case "INITIAL_STATE":
        if (msg.payload.stats) setStats(msg.payload.stats);
        if (msg.payload.alerts) setAlerts(msg.payload.alerts);
        break;
    }
  }, [updateSensors, setAlerts, setStats]);

  const { connected } = useWebSocket(handleWsMessage);

  useEffect(() => { setWsConnected(connected); }, [connected, setWsConnected]);

  const sensorList = Object.values(sensors);
  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "CRITICAL");

  // Group sensors by type
  const grouped = sensorList.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {});

  if (isLoading && sensorList.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.2em",
          marginBottom: "4px",
        }}>
          {">"} SYSTEM OVERVIEW // {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "22px", color: "var(--color-bright)",
          letterSpacing: "0.15em",
        }}>
          MONITORING DASHBOARD
        </h1>
      </div>

      {/* Stat blocks */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "14px", marginBottom: "28px",
      }}>
        <StatBlock
          icon={Cpu} label="Total Sensors"
          value={stats?.sensors?.total ?? sensorList.length}
          sub={`${stats?.sensors?.online ?? 0} online`}
          color="var(--color-bright)"
        />
        <StatBlock
          icon={Activity} label="Online"
          value={stats?.sensors?.online ?? 0}
          sub={`${stats?.sensors?.offline ?? 0} offline`}
          color="var(--color-online)"
        />
        <StatBlock
          icon={AlertTriangle} label="Active Alerts"
          value={activeAlerts.length}
          sub={criticalAlerts.length > 0 ? `${criticalAlerts.length} critical` : "all clear"}
          color={activeAlerts.length > 0 ? "var(--color-critical)" : "var(--color-text-muted)"}
        />
        <StatBlock
          icon={Zap} label="Readings/hr"
          value={stats?.readings?.lastHour ?? "--"}
          sub="last hour"
          color="var(--color-energy)"
        />
      </div>

      {/* Active alerts strip */}
      {activeAlerts.length > 0 && (
        <div style={{
          marginBottom: "24px",
          background: "rgba(255,68,68,0.06)",
          border: "1px solid rgba(255,68,68,0.15)",
          borderRadius: "var(--radius-lg)",
          padding: "14px 18px",
        }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "9px",
            color: "var(--color-critical)", letterSpacing: "0.15em",
            marginBottom: "10px", fontWeight: 700,
          }}>
            ⚠ ACTIVE ALERTS ({activeAlerts.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {activeAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "8px 12px",
                background: "rgba(255,68,68,0.04)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255,68,68,0.1)",
              }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "9px",
                  color: alert.severity === "CRITICAL" ? "var(--color-critical)" : "var(--color-warning)",
                  fontWeight: 700, letterSpacing: "0.1em", flexShrink: 0,
                }}>
                  [{alert.severity}]
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "10px",
                  color: "var(--color-text-sec)", flex: 1,
                }}>
                  {alert.title}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "9px",
                  color: "var(--color-text-muted)", flexShrink: 0,
                }}>
                  {new Date(alert.createdAt).toLocaleTimeString("en-US", { hour12: false })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sensor groups */}
      {Object.entries(grouped).map(([type, typeSensors]) => (
        <div key={type} style={{ marginBottom: "28px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            marginBottom: "14px",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "9px",
              color: "var(--color-text-muted)", letterSpacing: "0.2em",
            }}>
              // {type.replace("_", " ")} SENSORS
            </div>
            <div style={{
              flex: 1, height: "1px",
              background: "var(--color-border)",
            }} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "9px",
              color: "var(--color-text-muted)",
            }}>
              {typeSensors.length} UNIT{typeSensors.length !== 1 ? "S" : ""}
            </span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "14px",
          }}>
            {typeSensors.map((sensor) => (
              <SensorCard key={sensor.sensorId} sensor={sensor} />
            ))}
          </div>
        </div>
      ))}

      {sensorList.length === 0 && !isLoading && (
        <div style={{
          textAlign: "center", padding: "60px",
          fontFamily: "var(--font-mono)", fontSize: "12px",
          color: "var(--color-text-muted)", letterSpacing: "0.1em",
        }}>
          NO SENSORS DETECTED // RUN db:seed TO INITIALIZE
        </div>
      )}
    </div>
  );
};

export default Overview;
