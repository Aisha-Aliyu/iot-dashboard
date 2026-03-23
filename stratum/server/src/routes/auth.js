const express = require("express");
const { login, getMe, changePassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Public
router.post("/login", authLimiter, login);

// Protected
router.get("/me",             authenticate, getMe);
router.put("/change-password", authenticate, changePassword);

module.exports = router;
