const { ReadingService } = require("../services/readingService");
const { AlertService } = require("../services/alertService");
const { prisma } = require("../config/database");

const getStats = async (req, res, next) => {
  try {
    const stats = await ReadingService.getSystemStats();
    res.json({ success: true, ...stats });
  } catch (err) { next(err); }
};

const getOverview = async (req, res, next) => {
  try {
    const [stats, sensors, activeAlerts] = await Promise.all([
      ReadingService.getSystemStats(),
      prisma.sensor.findMany({
        where: { isActive: true },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      }),
      AlertService.getActive(),
    ]);

    // Get latest reading for each sensor
    const latestReadings = await Promise.all(
      sensors.map((s) => ReadingService.getLatestBySensor(s.id))
    );

    const sensorsWithReadings = sensors.map((s, i) => ({
      ...s,
      latestReading: latestReadings[i],
    }));

    res.json({
      success: true,
      stats,
      sensors: sensorsWithReadings,
      alerts: activeAlerts,
    });
  } catch (err) { next(err); }
};

module.exports = { getStats, getOverview };
