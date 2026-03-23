const express = require("express");
const { getStats, getOverview } = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/auth");
const router = express.Router();
router.use(authenticate);
router.get("/stats", getStats);
router.get("/overview", getOverview);
module.exports = router;
