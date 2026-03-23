const { prisma } = require("../config/database");

const ReadingService = {
  async getLatestBySensor(sensorId) {
    return prisma.reading.findFirst({
      where: { sensorId },
      orderBy: { timestamp: "desc" },
    });
  },

  async getHistory(sensorId, hours = 6) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return prisma.reading.findMany({
      where: { sensorId, timestamp: { gte: since } },
      orderBy: { timestamp: "asc" },
    });
  },

  async getAggregated(sensorId, hours = 24, buckets = 48) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const readings = await prisma.reading.findMany({
      where: { sensorId, timestamp: { gte: since } },
      orderBy: { timestamp: "asc" },
      select: { value: true, timestamp: true },
    });

    if (readings.length === 0) return [];

    // Bucket into equal time intervals
    const bucketMs = (hours * 60 * 60 * 1000) / buckets;
    const result = [];

    for (let i = 0; i < buckets; i++) {
      const bucketStart = since.getTime() + i * bucketMs;
      const bucketEnd = bucketStart + bucketMs;
      const bucketReadings = readings.filter(
        (r) => r.timestamp.getTime() >= bucketStart && r.timestamp.getTime() < bucketEnd
      );

      if (bucketReadings.length > 0) {
        const avg = bucketReadings.reduce((s, r) => s + r.value, 0) / bucketReadings.length;
        const min = Math.min(...bucketReadings.map((r) => r.value));
        const max = Math.max(...bucketReadings.map((r) => r.value));
        result.push({
          timestamp: new Date(bucketStart + bucketMs / 2).toISOString(),
          avg: parseFloat(avg.toFixed(2)),
          min: parseFloat(min.toFixed(2)),
          max: parseFloat(max.toFixed(2)),
          count: bucketReadings.length,
        });
      }
    }

    return result;
  },

  async getSystemStats() {
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now - 60 * 60 * 1000);

    const [
      totalSensors,
      onlineSensors,
      offlineSensors,
      criticalSensors,
      activeAlerts,
      criticalAlerts,
      readingsLast24h,
      readingsLastHour,
    ] = await Promise.all([
      prisma.sensor.count({ where: { isActive: true } }),
      prisma.sensor.count({ where: { status: "ONLINE", isActive: true } }),
      prisma.sensor.count({ where: { status: "OFFLINE", isActive: true } }),
      prisma.sensor.count({ where: { status: "CRITICAL", isActive: true } }),
      prisma.alert.count({ where: { status: "ACTIVE" } }),
      prisma.alert.count({ where: { status: "ACTIVE", severity: "CRITICAL" } }),
      prisma.reading.count({ where: { timestamp: { gte: last24h } } }),
      prisma.reading.count({ where: { timestamp: { gte: lastHour } } }),
    ]);

    return {
      sensors: { total: totalSensors, online: onlineSensors, offline: offlineSensors, critical: criticalSensors },
      alerts: { active: activeAlerts, critical: criticalAlerts },
      readings: { last24h: readingsLast24h, lastHour: readingsLastHour },
      uptime: process.uptime(),
      timestamp: now.toISOString(),
    };
  },
};

module.exports = { ReadingService };
