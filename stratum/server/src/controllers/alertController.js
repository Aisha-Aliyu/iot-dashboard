const { AlertService } = require("../services/alertService");

const getActive = async (req, res, next) => {
  try {
    const alerts = await AlertService.getActive();
    res.json({ success: true, alerts });
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, severity, sensorId } = req.query;
    const result = await AlertService.getAll(parseInt(page), parseInt(limit), { status, severity, sensorId });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

const acknowledge = async (req, res, next) => {
  try {
    const alert = await AlertService.acknowledge(req.params.id, req.user.id);
    res.json({ success: true, alert });
  } catch (err) { next(err); }
};

const resolve = async (req, res, next) => {
  try {
    const alert = await AlertService.resolve(req.params.id, req.user.id);
    res.json({ success: true, alert });
  } catch (err) { next(err); }
};

module.exports = { getActive, getAll, acknowledge, resolve };
