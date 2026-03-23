const { prisma } = require("../config/database");
const { SENSOR_PROFILES } = require("./sensorProfiles");
const { AlertService } = require("../services/alertService");

class SensorSimulator {
  constructor(wsServer) {
    this.wsServer = wsServer;
    this.interval = null;
    this.sensorState = new Map(); // sensorId -> last value
    this.intervalMs = parseInt(process.env.SIMULATION_INTERVAL_MS) || 3000;
  }

  async start() {
    console.log(`⚡ Sensor simulator starting (${this.intervalMs}ms interval)`);
    await this._tick();
    this.interval = setInterval(() => this._tick(), this.intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log("⚡ Sensor simulator stopped");
    }
  }

  async _tick() {
    try {
      const sensors = await prisma.sensor.findMany({
        where: { isActive: true, status: { not: "OFFLINE" } },
      });

      if (sensors.length === 0) return;

      const now = new Date();
      const readings = [];
      const broadcastData = [];

      for (const sensor of sensors) {
        const profile = SENSOR_PROFILES[sensor.type];
        if (!profile) continue;

        // Occasionally go offline or warning
        const statusRoll = Math.random();
        let newStatus = "ONLINE";
        if (statusRoll < 0.002) newStatus = "OFFLINE";
        else if (statusRoll < 0.01) newStatus = "WARNING";

        const prevValue = this.sensorState.get(sensor.id);
        const value = profile.generateValue(prevValue, now);
        this.sensorState.set(sensor.id, value);

        // Check thresholds
        let statusFromThreshold = newStatus;
        if (sensor.maxThreshold && value > sensor.maxThreshold) {
          statusFromThreshold = "CRITICAL";
          await AlertService.checkAndCreate(sensor, value, "MAX");
        } else if (sensor.minThreshold && value < sensor.minThreshold) {
          statusFromThreshold = "WARNING";
          await AlertService.checkAndCreate(sensor, value, "MIN");
        } else {
          await AlertService.autoResolve(sensor.id);
        }

        const finalStatus = statusFromThreshold;

        readings.push({
          sensorId: sensor.id,
          value: parseFloat(value.toFixed(2)),
          unit: sensor.unit,
          quality: finalStatus === "ONLINE" ? 100 : finalStatus === "WARNING" ? 75 : 50,
        });

        // Update sensor status and lastSeenAt
        if (finalStatus !== sensor.status) {
          await prisma.sensor.update({
            where: { id: sensor.id },
            data: { status: finalStatus, lastSeenAt: now },
          });
        } else {
          await prisma.sensor.update({
            where: { id: sensor.id },
            data: { lastSeenAt: now },
          });
        }

        broadcastData.push({
          sensorId: sensor.id,
          name: sensor.name,
          type: sensor.type,
          location: sensor.location,
          zone: sensor.zone,
          floor: sensor.floor,
          posX: sensor.posX,
          posY: sensor.posY,
          value: parseFloat(value.toFixed(2)),
          unit: sensor.unit,
          status: finalStatus,
          timestamp: now.toISOString(),
        });
      }

      // Batch insert readings
      if (readings.length > 0) {
        await prisma.reading.createMany({ data: readings });
      }

      // Prune old readings that keep last 24h only
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      await prisma.reading.deleteMany({ where: { timestamp: { lt: cutoff } } });

      // Broadcast to all WebSocket clients
      if (this.wsServer && broadcastData.length > 0) {
        this.wsServer.broadcast({
          type: "SENSOR_UPDATE",
          payload: broadcastData,
          timestamp: now.toISOString(),
        });
      }
    } catch (err) {
      console.error("Simulator tick error:", err.message);
    }
  }
}

module.exports = { SensorSimulator };
