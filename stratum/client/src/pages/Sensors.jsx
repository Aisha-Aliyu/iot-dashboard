import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import SensorCard from "../components/sensors/SensorCard";
import HudCard from "../components/ui/HudCard";
import Spinner from "../components/ui/Spinner";
import useSensorStore from "../store/sensorStore";
import api from "../api/axios";

const TYPES = ["ALL", "TEMPERATURE", "HUMIDITY", "ENERGY", "MOTION", "AIR_QUALITY"];
const STATUSES = ["ALL", "ONLINE", "WARNING", "CRITICAL", "OFFLINE"];

const Sensors = () => {
  const { sensors: liveSensors } = useSensorStore();
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["sensors"],
    queryFn: async () => {
      const { data } = await api.get("/sensors");
      return data.sensors;
    },
    refetchInterval: 10000,
  });

  const sensors = (data || []).map((s) => {
    const live = liveSensors[s.id];
    return live ? { ...live, sensorId: s.id } : { ...s, sensorId: s.id };
  });

  const filtered = sensors.filter((s) => {
    if (typeFilter !== "ALL" && s.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    if (search && !s.name?.toLowerCase().includes(search.toLowerCase()) &&
        !s.location?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const FilterBtn = ({ label, active, onClick }) => (
    <button onClick={onClick}
      style={{
        padding: "5px 12px",
        background: active ? "rgba(20,101,91,0.3)" : "transparent",
        border: `1px solid ${active ? "var(--color-mid)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-mono)", fontSize: "9px",
        color: active ? "var(--color-bright)" : "var(--color-text-muted)",
        letterSpacing: "0.1em", cursor: "pointer",
        transition: "all var(--t-fast)",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ maxWidth: "1400px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.2em", marginBottom: "4px",
        }}>{">"} ALL SENSOR UNITS</div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "20px", color: "var(--color-bright)", letterSpacing: "0.15em",
        }}>SENSOR REGISTRY</h1>
      </div>

      {/* Filters */}
      <HudCard style={{ marginBottom: "20px" }}>
        <div style={{ padding: "14px 18px" }}>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "var(--color-bg-raised)",
            border: "1px solid var(--color-border-mid)",
            borderRadius: "var(--radius-md)",
            padding: "8px 14px", marginBottom: "14px",
          }}>
            <Search size={13} color="var(--color-text-muted)" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH SENSORS..."
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent",
                fontFamily: "var(--font-mono)", fontSize: "11px",
                color: "var(--color-bright)", letterSpacing: "0.08em",
              }}
            />
          </div>

          {/* Type filter */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "8px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
              alignSelf: "center", marginRight: "4px",
            }}>TYPE:</span>
            {TYPES.map((t) => (
              <FilterBtn key={t} label={t.replace("_", " ")}
                active={typeFilter === t}
                onClick={() => setTypeFilter(t)}
              />
            ))}
          </div>

          {/* Status filter */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "8px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
              alignSelf: "center", marginRight: "4px",
            }}>STATUS:</span>
            {STATUSES.map((s) => (
              <FilterBtn key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
            ))}
          </div>
        </div>
      </HudCard>

      {/* Count */}
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "9px",
        color: "var(--color-text-muted)", letterSpacing: "0.12em",
        marginBottom: "16px",
      }}>
        SHOWING {filtered.length} OF {sensors.length} UNITS
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner size={28} />
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "14px",
        }}>
          {filtered.map((sensor) => (
            <SensorCard key={sensor.sensorId} sensor={sensor} />
          ))}
          {filtered.length === 0 && (
            <div style={{
              gridColumn: "1/-1", textAlign: "center", padding: "48px",
              fontFamily: "var(--font-mono)", fontSize: "11px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
            }}>
              NO SENSORS MATCH FILTER
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sensors;
