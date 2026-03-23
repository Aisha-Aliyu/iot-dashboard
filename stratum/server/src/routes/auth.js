const express = require("express");
const bcrypt = require("bcryptjs");
const { login, getMe, changePassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { prisma } = require("../config/database");

const router = express.Router();

// ── TEMP SEED ROUTE ──────────
router.get("/init", async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: "admin@stratum.io" },
    });

    if (existing) {
      return res.json({ success: true, message: "Users already exist — login should work now" });
    }

    const adminPw = await bcrypt.hash("Stratum@Admin1!", 12);
    const opPw    = await bcrypt.hash("Stratum@Op1!", 12);

    await prisma.user.createMany({
      data: [
        {
          email: "admin@stratum.io",
          password: adminPw,
          displayName: "STRATUM Admin",
          role: "ADMIN",
          isActive: true,
        },
        {
          email: "operator@stratum.io",
          password: opPw,
          displayName: "Operator One",
          role: "OPERATOR",
          isActive: true,
        },
      ],
    });

    res.json({ success: true, message: "Users created successfully" });
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
