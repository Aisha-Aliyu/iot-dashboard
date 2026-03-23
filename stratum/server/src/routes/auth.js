const express = require("express");
const bcrypt = require("bcryptjs");
const { login, getMe, changePassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { prisma } = require("../config/database");

const router = express.Router();

// ── TEMP RESET ROUTE — remove after use ──────────────
router.get("/reset", async (req, res) => {
  try {
    const adminPw = await bcrypt.hash("Stratum@Admin1!", 12);
    const opPw    = await bcrypt.hash("Stratum@Op1!", 12);

    await prisma.user.update({
      where: { email: "admin@stratum.io" },
      data: { password: adminPw, isActive: true },
    });

    await prisma.user.update({
      where: { email: "operator@stratum.io" },
      data: { password: opPw, isActive: true },
    });

    res.json({ success: true, message: "Passwords reset — try login now" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});
// ── END TEMP ROUTE ────────────────────────────────────

// Public
router.post("/login", authLimiter, login);

// Protected
router.get("/me",              authenticate, getMe);
router.put("/change-password", authenticate, changePassword);

module.exports = router;
