import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, AlertTriangle, Filter } from "lucide-react";
import HudCard from "../components/ui/HudCard";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import { getSeverityColor } from "../config/sensorConfig";
import api from "../api/axios";
import useAuthStore from "../store/authStore";

const SEVERITY_FILTERS = ["ALL", "CRITICAL", "WARNING", "INFO"];
const STATUS_FILTERS   = ["ALL", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"];

const Alerts = () => {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const canAct = user?.role === "ADMIN" || user?.role === "OPERATOR";

  const [severity, setSeverity] = useState("ALL");
  const [status, setStatus]     = useState("ACTIVE");
  const [page, setPage]         = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", severity, status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 20 });
      if (severity !== "ALL") params.append("severity", severity);
      if (status   !== "ALL") params.append("status",   status);
      const { data } = await api.get(`/alerts?${params}`);
      return data;
    },
    refetchInterval: 5000,
  });

  const ack = useMutation({
    mutationFn: (id) => api.put(`/alerts/${id}/acknowledge`),
    onSuccess: () => { toast.success("Alert acknowledged"); qc.invalidateQueries({ queryKey: ["alerts"] }); },
    onError: () => toast.error("Failed"),
  });

  const resolve = useMutation({
    mutationFn: (id) => api.put(`/alerts/${id}/resolve`),
    onSuccess: () => { toast.success("Alert resolved"); qc.invalidateQueries({ queryKey: ["alerts"] }); },
    onError: () => toast.error("Failed"),
  });

  const alerts = data?.alerts || [];
  const pages  = data?.pages  || 1;

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
      }}>{label}</button>
  );

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "9px",
          color: "var(--color-text-muted)", letterSpacing: "0.2em", marginBottom: "4px",
        }}>{">"} SYSTEM ALERT LOG</div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "20px", color: "var(--color-bright)", letterSpacing: "0.15em",
        }}>ALERT CENTER</h1>
      </div>

      {/* Filters */}
      <HudCard style={{ marginBottom: "20px" }}>
        <div style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "8px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
              alignSelf: "center", marginRight: "4px",
            }}>SEVERITY:</span>
            {SEVERITY_FILTERS.map((f) => (
              <FilterBtn key={f} label={f} active={severity === f} onClick={() => { setSeverity(f); setPage(1); }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "8px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
              alignSelf: "center", marginRight: "4px",
            }}>STATUS:</span>
            {STATUS_FILTERS.map((f) => (
              <FilterBtn key={f} label={f} active={status === f} onClick={() => { setStatus(f); setPage(1); }} />
            ))}
          </div>
        </div>
      </HudCard>

      {/* Count */}
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "9px",
        color: "var(--color-text-muted)", letterSpacing: "0.12em", marginBottom: "14px",
      }}>
        {data?.total ?? 0} ALERT{data?.total !== 1 ? "S" : ""} FOUND
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Spinner size={28} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {alerts.map((alert) => {
            const sevColor = getSeverityColor(alert.severity);
            return (
              <HudCard key={alert.id}
                style={{
                  borderColor: alert.status === "ACTIVE"
                    ? `${sevColor}30` : "var(--color-border)",
                }}
              >
                <div style={{ padding: "16px 18px" }}>
                  <div style={{
                    display: "flex", alignItems: "flex-start",
                    gap: "14px", flexWrap: "wrap",
                  }}>
                    {/* Severity icon */}
                    <div style={{
                      width: 36, height: 36,
                      borderRadius: "var(--radius-md)",
                      background: `${sevColor}12`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <AlertTriangle size={16} color={sevColor} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
                        <Badge label={alert.severity} variant={alert.severity} />
                        <Badge label={alert.status}   variant={alert.status} />
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: "9px",
                          color: "var(--color-text-muted)",
                        }}>
                          {alert.sensor?.name} · {alert.sensor?.location}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: "var(--font-mono)", fontSize: "12px",
                        color: "var(--color-text-sec)", fontWeight: 700,
                        marginBottom: "4px",
                      }}>{alert.title}</p>
                      <p style={{
                        fontFamily: "var(--font-mono)", fontSize: "10px",
                        color: "var(--color-text-muted)", lineHeight: 1.5,
                      }}>{alert.message}</p>

                      {/* Meta */}
                      <div style={{
                        marginTop: "8px",
                        display: "flex", gap: "16px", flexWrap: "wrap",
                      }}>
                        <span style={{
                          fontFamily: "var(--font-mono)", fontSize: "9px",
                          color: "var(--color-text-muted)",
                        }}>
                          TRIGGERED: {new Date(alert.createdAt).toLocaleString("en-US", { hour12: false })}
                        </span>
                        {alert.acknowledgedAt && (
                          <span style={{
                            fontFamily: "var(--font-mono)", fontSize: "9px",
                            color: "var(--color-warning)",
                          }}>
                            ACK: {new Date(alert.acknowledgedAt).toLocaleString("en-US", { hour12: false })}
                          </span>
                        )}
                        {alert.resolvedAt && (
                          <span style={{
                            fontFamily: "var(--font-mono)", fontSize: "9px",
                            color: "var(--color-online)",
                          }}>
                            RESOLVED: {new Date(alert.resolvedAt).toLocaleString("en-US", { hour12: false })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {canAct && alert.status !== "RESOLVED" && (
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        {alert.status === "ACTIVE" && (
                          <button
                            onClick={() => ack.mutate(alert.id)}
                            disabled={ack.isPending}
                            title="Acknowledge"
                            style={{
                              padding: "7px 12px",
                              background: "rgba(255,204,0,0.08)",
                              border: "1px solid rgba(255,204,0,0.2)",
                              borderRadius: "var(--radius-md)",
                              color: "var(--color-warning)",
                              fontFamily: "var(--font-mono)", fontSize: "9px",
                              letterSpacing: "0.08em", cursor: "pointer",
                              display: "flex", alignItems: "center", gap: "5px",
                            }}>
                            <CheckCircle size={11} /> ACK
                          </button>
                        )}
                        <button
                          onClick={() => resolve.mutate(alert.id)}
                          disabled={resolve.isPending}
                          title="Resolve"
                          style={{
                            padding: "7px 12px",
                            background: "rgba(167,255,235,0.06)",
                            border: "1px solid rgba(167,255,235,0.15)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-online)",
                            fontFamily: "var(--font-mono)", fontSize: "9px",
                            letterSpacing: "0.08em", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "5px",
                          }}>
                          <XCircle size={11} /> RESOLVE
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </HudCard>
            );
          })}

          {alerts.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px",
              fontFamily: "var(--font-mono)", fontSize: "11px",
              color: "var(--color-text-muted)", letterSpacing: "0.1em",
            }}>
              NO ALERTS MATCH FILTER // SYSTEM NOMINAL
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
          {[...Array(Math.min(pages, 10))].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{
                width: 32, height: 32,
                borderRadius: "var(--radius-md)",
                background: page === i + 1 ? "rgba(20,101,91,0.4)" : "var(--color-bg-card)",
                color: page === i + 1 ? "var(--color-bright)" : "var(--color-text-muted)",
                border: `1px solid ${page === i + 1 ? "var(--color-mid)" : "var(--color-border)"}`,
                fontFamily: "var(--font-mono)", fontSize: "11px",
                cursor: "pointer",
              }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
