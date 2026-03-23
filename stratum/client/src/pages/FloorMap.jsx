import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HudCard from "../components/ui/HudCard";
import useSensorStore from "../store/sensorStore";
import { SENSOR_TYPES, getStatusColor } from "../config/sensorConfig";

const FLOORS = [0, 1, 2];
const FLOOR_LABELS = { 0: "BASEMENT / PARKING", 1: "GROUND FLOOR", 2: "UPPER FLOOR" };

const SensorNode = ({ sensor, onClick }) => {
  const config = SENSOR_TYPES[sensor.type] || {};
  const color = getStatusColor(sensor.status);
  const isCritical = sensor.status === "CRITICAL";
  const isWarning = sensor.status === "WARNING";
  const isOffline = sensor.status === "OFFLINE";

  return (
    <g
      onClick={() => onClick(sensor.sensorId)}
      style={{ cursor: "pointer" }}
      transform={`translate(${sensor.posX}%, ${sensor.posY}%)`}
    >
      {/* Pulse ring for active sensors */}
      {!isOffline && (
        <>
          <circle r="16" fill="none" stroke={color} strokeOpacity="0.2"
            style={{ animation: "pulse-ring 2s ease-out infinite" }} />
          <circle r="12" fill="none" stroke={color} strokeOpacity="0.15"
            style={{ animation: "pulse-ring 2s ease-out infinite 0.5s" }} />
        </>
      )}

      {/* Main node */}
      <circle
        r="8"
        fill={`${color}20`}
        stroke={color}
        strokeWidth={isCritical ? "2" : "1.5"}
        style={{
          filter: isCritical ? `drop-shadow(0 0 6px ${color})` : "none",
          animation: isCritical ? "blink 1s ease-in-out infinite" : "none",
        }}
      />

      {/* Type icon text */}
      <text
        textAnchor="middle" dy="0.35em"
        fontSize="6" fill={color}
        style={{ fontFamily: "Space Mono", userSelect: "none", pointerEvents: "none" }}
      >
        {config.icon || "●"}
      </text>

      {/* Label */}
      <text
        y="16" textAnchor="middle"
        fontSize="7" fill={color} fillOpacity="0.8"
        style={{ fontFamily: "Space Mono", userSelect: "none", pointerEvents: "none" }}
      >
        {sensor.name?.split(" ").slice(-1)[0]}
      </text>

      {/* Value badge */}
      {sensor.value !== undefined && !isOffline && (
        <g transform="translate(10, -10)">
          <rect x="-14" y="-7" width="28" height="12" rx="3"
            fill="var(--color-bg-panel)" stroke={color} strokeWidth="0.8" strokeOpacity="0.6" />
          <text textAnchor="middle" dy="0.35em" fontSize="6"
            fill={color} style={{ fontFamily: "Space Mono", fontWeight: "bold" }}>
            {Number(sensor.value).toFixed(1)}
          </text>
        </g>
      )}
    </g>
  );
};

const FloorMap = () => {
  const { sensors } = useSensorStore();
  const navigate = useNavigate();
  const [activeFloor, setActiveFloor] = useState(1);
  const [hoveredSensor, setHoveredSensor] = useState(null);

  const sensorList = Object.values(sensors);
  const floorSensors = sensorList.filter((s) => s.floor === activeFloor);

  const handleNodeClick = (sensorId) => navigate(`/sensors/${sensorId}`);

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.2em", marginBottom: "4px",
        }}>{">"} SPATIAL SENSOR DISTRIBUTION</div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "20px", color: "var(--color-bright)", letterSpacing: "0.15em",
        }}>FLOOR MAP</h1>
      </div>

      {/* Floor selector */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {FLOORS.map((floor) => (
          <button key={floor} onClick={() => setActiveFloor(floor)}
            style={{
              padding: "8px 18px",
              background: activeFloor === floor ? "rgba(20,101,91,0.3)" : "var(--color-bg-card)",
              border: `1px solid ${activeFloor === floor ? "var(--color-mid)" : "var(--color-border)"}`,
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-mono)", fontSize: "10px",
              color: activeFloor === floor ? "var(--color-bright)" : "var(--color-text-muted)",
              letterSpacing: "0.12em", cursor: "pointer",
              transition: "all var(--t-fast)",
            }}>
            {floor === 0 ? "B1" : `F${floor}`}
          </button>
        ))}
        <span style={{
          alignSelf: "center", marginLeft: "8px",
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.1em",
        }}>
          {FLOOR_LABELS[activeFloor]} · {floorSensors.length} SENSORS
        </span>
      </div>

      {/* Map */}
      <HudCard style={{ marginBottom: "20px" }}>
        <div style={{ padding: "20px" }}>
          <div style={{
            position: "relative",
            background: "var(--color-bg-panel)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--color-border)",
          }}>
            {/* Floor plan SVG */}
            <svg
              viewBox="0 0 100 100"
              style={{ width: "100%", aspectRatio: "16/9", display: "block" }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background */}
              <rect width="100" height="100" fill="var(--color-bg-panel)" />

              {/* Grid lines */}
              {[10,20,30,40,50,60,70,80,90].map((v) => (
                <g key={v}>
                  <line x1={v} y1="0" x2={v} y2="100"
                    stroke="rgba(167,255,235,0.04)" strokeWidth="0.3" />
                  <line x1="0" y1={v} x2="100" y2={v}
                    stroke="rgba(167,255,235,0.04)" strokeWidth="0.3" />
                </g>
              ))}

              {/* Floor plan rooms */}
              {activeFloor === 1 && (
                <>
                  {/* Server Room */}
                  <rect x="8" y="15" width="28" height="35" rx="1"
                    fill="rgba(20,101,91,0.06)" stroke="rgba(167,255,235,0.12)" strokeWidth="0.5" />
                  <text x="22" y="10" textAnchor="middle" fontSize="3.5"
                    fill="rgba(167,255,235,0.25)" style={{ fontFamily: "Space Mono" }}>
                    SERVER ROOM
                  </text>

                  {/* Office A */}
                  <rect x="38" y="8" width="30" height="28" rx="1"
                    fill="rgba(20,101,91,0.04)" stroke="rgba(167,255,235,0.08)" strokeWidth="0.5" />
                  <text x="53" y="6" textAnchor="middle" fontSize="3.5"
                    fill="rgba(167,255,235,0.2)" style={{ fontFamily: "Space Mono" }}>
                    OFFICE A
                  </text>

                  {/* Reception */}
                  <rect x="42" y="52" width="38" height="32" rx="1"
                    fill="rgba(20,101,91,0.04)" stroke="rgba(167,255,235,0.08)" strokeWidth="0.5" />
                  <text x="61" y="50" textAnchor="middle" fontSize="3.5"
                    fill="rgba(167,255,235,0.2)" style={{ fontFamily: "Space Mono" }}>
                    RECEPTION
                  </text>

                  {/* Corridor */}
                  <rect x="8" y="52" width="32" height="12" rx="1"
                    fill="rgba(20,101,91,0.03)" stroke="rgba(167,255,235,0.06)" strokeWidth="0.5" />
                  <text x="24" y="50" textAnchor="middle" fontSize="3"
                    fill="rgba(167,255,235,0.15)" style={{ fontFamily: "Space Mono" }}>
                    CORRIDOR
                  </text>

                  {/* Entrance */}
                  <rect x="35" y="82" width="30" height="15" rx="1"
                    fill="rgba(20,101,91,0.06)" stroke="rgba(167,255,235,0.15)" strokeWidth="0.5" />
                  <text x="50" y="80" textAnchor="middle" fontSize="3.5"
                    fill="rgba(167,255,235,0.3)" style={{ fontFamily: "Space Mono" }}>
                    ENTRANCE
                  </text>
                </>
              )}

              {activeFloor === 2 && (
                <>
                  <rect x="8" y="10" width="40" height="50" rx="1"
                    fill="rgba(20,101,91,0.05)" stroke="rgba(167,255,235,0.1)" strokeWidth="0.5" />
                  <text x="28" y="8" textAnchor="middle" fontSize="3.5"
                    fill="rgba(167,255,235,0.25)" style={{ fontFamily: "Space Mono" }}>
                    OFFICE B
                  </text>

                  <rect x="52" y="10" width="40" height="50" rx="1"
                    fill="rgba(20,101,91,0.04)" stroke="rgba(167,255,235,0.08)" strokeWidth="0.5" />
                  <text x="72" y="8" textAnchor="middle" fontSize="3.5"
                    fill="rgba(167,255,235,0.2)" style={{ fontFamily: "Space Mono" }}>
                    LAB
                  </text>

                  <rect x="15" y="65" width="70" height="25" rx="1"
                    fill="rgba(20,101,91,0.03)" stroke="rgba(167,255,235,0.06)" strokeWidth="0.5" />
                  <text x="50" y="63" textAnchor="middle" fontSize="3.5"
                    fill="rgba(167,255,235,0.15)" style={{ fontFamily: "Space Mono" }}>
                    MEETING ROOMS
                  </text>
                </>
              )}

              {activeFloor === 0 && (
                <>
                  <rect x="5" y="5" width="90" height="90" rx="2"
                    fill="rgba(20,101,91,0.03)" stroke="rgba(167,255,235,0.08)" strokeWidth="0.5" />
                  <text x="50" y="3" textAnchor="middle" fontSize="3.5"
                    fill="rgba(167,255,235,0.2)" style={{ fontFamily: "Space Mono" }}>
                    PARKING / EXTERNAL
                  </text>
                  {/* Parking spaces */}
                  {[15,30,45,60,75].map((x) => (
                    <g key={x}>
                      <rect x={x} y="20" width="10" height="18" rx="1"
                        fill="none" stroke="rgba(167,255,235,0.06)" strokeWidth="0.4" />
                      <rect x={x} y="55" width="10" height="18" rx="1"
                        fill="none" stroke="rgba(167,255,235,0.06)" strokeWidth="0.4" />
                    </g>
                  ))}
                </>
              )}

              {/* Sensor nodes converted to percentage-based coords */}
              {floorSensors.map((sensor) => (
                <g key={sensor.sensorId}
                  transform={`translate(${sensor.posX}, ${sensor.posY})`}
                  onClick={() => handleNodeClick(sensor.sensorId)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Pulse rings */}
                  {sensor.status !== "OFFLINE" && (
                    <>
                      <circle r="4" fill="none"
                        stroke={getStatusColor(sensor.status)}
                        strokeOpacity="0.3"
                        style={{ animation: "pulse-ring 2s ease-out infinite" }}
                      />
                    </>
                  )}
                  {/* Node */}
                  <circle r="2.5"
                    fill={`${getStatusColor(sensor.status)}30`}
                    stroke={getStatusColor(sensor.status)}
                    strokeWidth="0.8"
                    style={{
                      filter: sensor.status === "CRITICAL"
                        ? `drop-shadow(0 0 3px ${getStatusColor(sensor.status)})` : "none",
                    }}
                  />
                  {/* Value */}
                  {sensor.value !== undefined && (
                    <text y="-4" textAnchor="middle" fontSize="2.5"
                      fill={getStatusColor(sensor.status)}
                      style={{ fontFamily: "Space Mono" }}>
                      {Number(sensor.value).toFixed(0)}
                    </text>
                  )}
                  {/* Name */}
                  <text y="5.5" textAnchor="middle" fontSize="2"
                    fill={getStatusColor(sensor.status)} fillOpacity="0.7"
                    style={{ fontFamily: "Space Mono" }}>
                    {sensor.name?.split(" ").pop()}
                  </text>
                </g>
              ))}
            </svg>

            {/* Floor label */}
            <div style={{
              position: "absolute", bottom: "12px", right: "12px",
              fontFamily: "var(--font-mono)", fontSize: "9px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
            }}>
              {FLOOR_LABELS[activeFloor]}
            </div>
          </div>
        </div>
      </HudCard>

      {/* Legend */}
      <HudCard>
        <div style={{ padding: "14px 18px" }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "9px",
            color: "var(--color-text-muted)", letterSpacing: "0.15em", marginBottom: "12px",
          }}>// LEGEND</div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[
              { status: "ONLINE", color: "var(--color-online)" },
              { status: "WARNING", color: "var(--color-warning)" },
              { status: "CRITICAL", color: "var(--color-critical)" },
              { status: "OFFLINE", color: "#334" },
            ].map(({ status, color }) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: `${color}30`, border: `1.5px solid ${color}`,
                  boxShadow: `0 0 6px ${color}40`,
                }} />
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "9px",
                  color: "var(--color-text-muted)", letterSpacing: "0.1em",
                }}>{status}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "9px",
                color: "var(--color-text-muted)",
              }}>CLICK NODE → SENSOR DETAIL</span>
            </div>
          </div>
        </div>
      </HudCard>
    </div>
  );
};

export default FloorMap;
