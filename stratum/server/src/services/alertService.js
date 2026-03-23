const { prisma } = require("../config/database");

const ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 min between same alerts
const recentAlerts = new Map(); // sensorId -> lastAlertTime

const AlertService = {
  async checkAndCreate(sensor, value, direction) {
    const key = `${sensor.id}_${direction}`;
    const lastAlert = recentAlerts.get(key);
    if (lastAlert && Date.now() - lastAlert < ALERT_COOLDOWN_MS) return;

    recentAlerts.set(key, Date.now());

    const isMax = direction === "MAX";
    const severity = isMax ? "CRITICAL" : "WARNING";
    const threshold = isMax ? sensor.maxThreshold : sensor.minThreshold;

    const title = isMax
      ? `${sensor.name} exceeded maximum threshold`
      : `${sensor.name} below minimum threshold`;

    const message = isMax
      ? `Current reading of ${value.toFixed(2)} ${sensor.unit} exceeds maximum threshold of ${threshold} ${sensor.unit}`
      : `Current reading of ${value.toFixed(2)} ${sensor.unit} is below minimum threshold of ${threshold} ${sensor.unit}`;

    // Check for existing active alert
    const existing = await prisma.alert.findFirst({
      where: { sensorId: sensor.id, status: "ACTIVE" },
    });

    if (existing) {
      await prisma.alert.update({
        where: { id: existing.id },
        data: { value, updatedAt: new Date() },
      });
      return existing;
    }

    const alert = await prisma.alert.create({
      data: {
        sensorId: sensor.id,
        severity,
        title,
        message,
        value,
        threshold,
      },
      include: { sensor: true },
    });

    return alert;
  },

  async autoResolve(sensorId) {
    await prisma.alert.updateMany({
      where: { sensorId, status: "ACTIVE" },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    });
  },

  async acknowledge(alertId, userId) {
    return prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedById: userId,
        acknowledgedAt: new Date(),
      },
      include: { sensor: true },
    });
  },

  async resolve(alertId, userId) {
    return prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "RESOLVED",
        resolvedById: userId,
        resolvedAt: new Date(),
      },
      include: { sensor: true },
    });
  },

  async getActive() {
    return prisma.alert.findMany({
      where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } },
      include: { sensor: true },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    });
  },

  async getAll(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    if (filters.sensorId) where.sensorId = filters.sensorId;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: { sensor: true, acknowledgedBy: true, resolvedBy: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.alert.count({ where }),
    ]);

    return { alerts, total, pages: Math.ceil(total / limit) };
  },
};

module.exports = { AlertService };
