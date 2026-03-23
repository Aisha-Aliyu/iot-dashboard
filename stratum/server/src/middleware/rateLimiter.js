const rateLimit = require("express-rate-limit");

const { ipKeyGenerator } = rateLimit;

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { success: false, message: "Too many requests" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { success: false, message: "Too many auth attempts" },
});

module.exports = { apiLimiter, authLimiter };
