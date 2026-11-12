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

// Visitors on a shared network (a campus or office) share one IP, and the demo button
// makes logging in easy, so allow a few more attempts than a private app would
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { success: false, message: "Too many auth attempts" },
});

module.exports = { apiLimiter, authLimiter };
