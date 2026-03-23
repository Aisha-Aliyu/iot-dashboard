const { prisma } = require("../config/database");
const { ReadingService } = require("../services/readingService");

const getAll = async (req, res, next) => {
  try {
    const { type, status, floor, zone } = req.query;
    const where = { isActive: true };
    if (type) where.type = type;
    if (status) where.status = status;
    if (floor) where.floor = parseInt(floor);
    if (zone) where.zone = zone;

    const sensors = await prisma.sensor.findMany({
      where,
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    res.json({ success: true, sensors });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const sensor = await prisma.sensor.findUnique({
      where: { id: req.params.id },
    });
    if (!sensor) return res.status(404).json({ success: false, message: "Sensor not found" });

    const [latest, history] = await Promise.all([
      ReadingService.getLatestBySensor(sensor.id),
      ReadingService.getHistory(sensor.id, parseInt(req.query.hours) || 6),
    ]);

    res.json({ success: true, sensor: { ...sensor, latestReading: latest, history } });
  } catch (err) { next(err); }
};

const getHistory = async (req, res, next) => {
  try {
    const { hours = 6, buckets = 48 } = req.query;
    const data = await ReadingService.getAggregated(
      req.params.id,
      parseInt(hours),
      parseInt(buckets)
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { name, location, zone, floor, minThreshold, maxThreshold, posX, posY, isActive } = req.body;
    const sensor = await prisma.sensor.update({
      where: { id: req.params.id },
      data: { name, location, zone, floor, minThreshold, maxThreshold, posX, posY, isActive },
    });
    res.json({ success: true, sensor });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, getHistory, update };
