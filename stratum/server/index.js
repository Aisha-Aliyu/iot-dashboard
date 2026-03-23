require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const sanitizeRequest = require("./src/middleware/sanitize");
const helmet = require("helmet");
const securityHeaders = require("./src/middleware/securityHeaders");
const morgan = require("morgan");
const compression = require("compression");

const { connectDB } = require("./src/config/database");
const { WSServer } = require("./src/websocket/WSServer");
const { SensorSimulator } = require("./src/simulation/SensorSimulator");
const { apiLimiter } = require("./src/middleware/rateLimiter");
const errorHandler = require("./src/middleware/errorHandler");

const authRoutes      = require("./src/routes/auth");
const dashboardRoutes = require("./src/routes/dashboard");
const sensorRoutes    = require("./src/routes/sensors");
const alertRoutes     = require("./src/routes/alerts");

const app = express();
const httpServer = http.createServer(app);

app.set("trust proxy", 1);

// CORS config
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Handle preflight for ALL routes first
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(securityHeaders);
app.use(compression());
app.use(sanitizeRequest);
app.use(express.json({ limit: "10kb" }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Rate limit
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth",      authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sensors",   sensorRoutes);
app.use("/api/alerts",    alertRoutes);

// Health
app.get("/health", (req, res) => res.json({
  status: "OK",
  app: "STRATUM IoT Dashboard",
  sensors: "simulating",
  ws: "active",
}));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Auto-seed if no users exist
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log("No users found — running seed...");
    require("./prisma/seed");
  }

  // WebSocket server
  const wsServer = new WSServer(httpServer);

  // Sensor simulator
  const simulator = new SensorSimulator(wsServer);
  await simulator.start();

  httpServer.listen(PORT, () => {
    console.log(`
STRATUM running on port ${PORT}
WebSocket active at ws://localhost:${PORT}/ws
Sensor simulation running every ${process.env.SIMULATION_INTERVAL_MS || 3000}ms
    `);
  });

  process.on("SIGTERM", () => {
    simulator.stop();
    httpServer.close();
  });
};

start().catch(console.error);
