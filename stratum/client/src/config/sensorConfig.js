export const SENSOR_TYPES = {
  TEMPERATURE: {
    label: "Temperature",
    unit: "°C",
    color: "var(--color-temp)",
    icon: "🌡",
    chartColor: "#ff6b6b",
    min: -10, max: 50,
    goodRange: [18, 28],
  },
  HUMIDITY: {
    label: "Humidity",
    unit: "%",
    color: "var(--color-humidity)",
    icon: "💧",
    chartColor: "#4db8ff",
    min: 0, max: 100,
    goodRange: [30, 70],
  },
  ENERGY: {
    label: "Energy",
    unit: "kW",
    color: "var(--color-energy)",
    icon: "⚡",
    chartColor: "#ffcc00",
    min: 0, max: 25,
    goodRange: [0, 15],
  },
  MOTION: {
    label: "Motion",
    unit: "ev/min",
    color: "var(--color-motion)",
    icon: "👁",
    chartColor: "#c084fc",
    min: 0, max: 50,
    goodRange: [0, 20],
  },
  AIR_QUALITY: {
    label: "Air Quality",
    unit: "ppm",
    color: "var(--color-air)",
    icon: "🌬",
    chartColor: "#a7ffeb",
    min: 350, max: 2000,
    goodRange: [350, 1000],
  },
};

export const getStatusColor = (status) => {
  const map = {
    ONLINE: "var(--color-online)",
    OFFLINE: "#334",
    WARNING: "var(--color-warning)",
    CRITICAL: "var(--color-critical)",
    MAINTENANCE: "var(--color-info)",
  };
  return map[status] || "var(--color-text-muted)";
};

export const getSeverityColor = (severity) => {
  const map = {
    INFO: "var(--color-info)",
    WARNING: "var(--color-warning)",
    CRITICAL: "var(--color-critical)",
  };
  return map[severity] || "var(--color-text-muted)";
};
