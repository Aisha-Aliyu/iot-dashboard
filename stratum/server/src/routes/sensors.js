const express = require("express");
const { getAll, getById, getHistory, update } = require("../controllers/sensorController");
const { authenticate, requireRole } = require("../middleware/auth");
const { blockDemo } = require("../config/accounts");
const router = express.Router();
router.use(authenticate);
router.get("/", getAll);
router.get("/:id", getById);
router.get("/:id/history", getHistory);
// The demo account can't rename, move or switch off sensors for everyone else
router.put("/:id", requireRole("ADMIN", "OPERATOR"), blockDemo, update);
module.exports = router;
