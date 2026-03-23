import { create } from "zustand";

const useSensorStore = create((set, get) => ({
  sensors: {},         // sensorId -> latest data
  alerts: [],          // active alerts
  stats: null,         // system stats
  history: {},         // sensorId -> array of readings (ring buffer)
  wsConnected: false,
  lastUpdate: null,

  HISTORY_LENGTH: 60,  // keep last 60 readings per sensor

  updateSensors: (sensorDataArray) => {
    const { history, HISTORY_LENGTH } = get();
    const newSensors = { ...get().sensors };
    const newHistory = { ...history };

    sensorDataArray.forEach((sensor) => {
      newSensors[sensor.sensorId] = sensor;

      // Ring buffer
      const prev = newHistory[sensor.sensorId] || [];
      const next = [...prev, {
        value: sensor.value,
        timestamp: sensor.timestamp,
        time: new Date(sensor.timestamp).toLocaleTimeString("en-US", { hour12: false }),
      }];
      newHistory[sensor.sensorId] = next.slice(-HISTORY_LENGTH);
    });

    set({ sensors: newSensors, history: newHistory, lastUpdate: new Date() });
  },

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 50),
  })),

  setStats: (stats) => set({ stats }),
  setWsConnected: (v) => set({ wsConnected: v }),
}));

export default useSensorStore;
