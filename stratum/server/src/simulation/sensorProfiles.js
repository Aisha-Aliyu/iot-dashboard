// Realistic sensor profiles with natural variance patterns
const SENSOR_PROFILES = {
  TEMPERATURE: {
    unit: "°C",
    minThreshold: 15,
    maxThreshold: 30,
    baseline: 22,
    variance: 3,
    drift: 0.1,
    noiseLevel: 0.2,
    zones: ["Server Room", "Office A", "Office B", "Reception"],
    names: ["Temp Sensor Alpha", "Temp Sensor Beta", "Temp Sensor Gamma", "Temp Sensor Delta"],
    model: "DS18B20-PRO",
    firmware: "v2.4.1",
    generateValue: (prev, time) => {
      const hourOfDay = new Date(time).getHours();
      // Natural diurnal cycle — warmer midday
      const diurnal = Math.sin((hourOfDay - 6) * Math.PI / 12) * 2;
      const noise = (Math.random() - 0.5) * 0.4;
      const drift = prev ? (prev - 22) * -0.05 : 0;
      return Math.max(10, Math.min(45, (prev || 22) + drift + noise + diurnal * 0.1));
    },
  },

  HUMIDITY: {
    unit: "%",
    minThreshold: 30,
    maxThreshold: 70,
    baseline: 50,
    variance: 10,
    noiseLevel: 1,
    zones: ["Server Room", "Storage", "Lab", "Corridor"],
    names: ["Humidity Node 01", "Humidity Node 02", "Humidity Node 03", "Humidity Node 04"],
    model: "DHT22-IOT",
    firmware: "v1.8.3",
    generateValue: (prev, time) => {
      const noise = (Math.random() - 0.5) * 2;
      const drift = prev ? (prev - 50) * -0.03 : 0;
      return Math.max(10, Math.min(95, (prev || 50) + drift + noise));
    },
  },

  ENERGY: {
    unit: "kW",
    minThreshold: 0,
    maxThreshold: 15,
    baseline: 8,
    variance: 4,
    noiseLevel: 0.5,
    zones: ["Main Panel", "Sub Panel A", "Sub Panel B", "Generator"],
    names: ["Power Monitor Main", "Power Monitor A", "Power Monitor B", "Power Monitor Gen"],
    model: "ZMPT101B-PRO",
    firmware: "v3.1.0",
    generateValue: (prev, time) => {
      const hourOfDay = new Date(time).getHours();
      // Business hours spike
      const workHours = hourOfDay >= 8 && hourOfDay <= 18;
      const baseline = workHours ? 10 : 4;
      const spike = Math.random() < 0.05 ? Math.random() * 5 : 0;
      const noise = (Math.random() - 0.5) * 1;
      const drift = prev ? (prev - baseline) * -0.1 : 0;
      return Math.max(0.5, Math.min(25, (prev || baseline) + drift + noise + spike));
    },
  },

  MOTION: {
    unit: "events/min",
    minThreshold: null,
    maxThreshold: 20,
    baseline: 3,
    variance: 5,
    noiseLevel: 1,
    zones: ["Entrance", "Parking", "Lab", "Server Room"],
    names: ["Motion PIR Alpha", "Motion PIR Beta", "Cam Zone A", "Cam Zone B"],
    model: "HC-SR501-NET",
    firmware: "v1.2.7",
    generateValue: (prev, time) => {
      const hourOfDay = new Date(time).getHours();
      const workHours = hourOfDay >= 7 && hourOfDay <= 19;
      const baseline = workHours ? 5 : 0.5;
      // Random motion bursts
      const burst = Math.random() < 0.1 ? Math.random() * 15 : 0;
      const noise = Math.random() * 2;
      return Math.max(0, Math.min(50, baseline + noise + burst));
    },
  },

  AIR_QUALITY: {
    unit: "ppm",
    minThreshold: null,
    maxThreshold: 1000,
    baseline: 450,
    variance: 100,
    noiseLevel: 10,
    zones: ["Open Office", "Meeting Room", "Server Room", "Lobby"],
    names: ["AQ Sensor Zeta", "AQ Sensor Eta", "AQ Sensor Theta", "AQ Sensor Iota"],
    model: "MH-Z19B-CO2",
    firmware: "v2.0.4",
    generateValue: (prev, time) => {
      const hourOfDay = new Date(time).getHours();
      const occupancy = hourOfDay >= 8 && hourOfDay <= 18;
      const baseline = occupancy ? 650 : 420;
      const noise = (Math.random() - 0.5) * 20;
      const drift = prev ? (prev - baseline) * -0.05 : 0;
      const meeting = Math.random() < 0.03 ? Math.random() * 300 : 0;
      return Math.max(350, Math.min(2000, (prev || baseline) + drift + noise + meeting));
    },
  },
};

module.exports = { SENSOR_PROFILES };
