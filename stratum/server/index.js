require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const sanitizeRequest = require("./src/middleware/sanitize");
const helmet = require("helmet");
const securityHeaders = require("./src/middleware/securityHeaders");
const morgan = require("morgan");
const compression = require("compression");

const { prisma, connectDB } = require("./src/config/database");
const { ensureAccounts } = require("./src/config/accounts");
const { seedSensors } = require("./prisma/seed");
const { WSServer } = require("./src/websocket/WSServer");
const { SensorSimulator } = require("./src/simulation/SensorSimulator");
const { apiLimiter } = require("./src/middleware/rateLimiter");
const errorHandler = require("./src/middleware/errorHandler");

const authRoutes      = require("./src/routes/auth");
const dashboardRoutes = require("./src/routes/dashboard");
const sensorRoutes    = require("./src/routes/sensors");
const alertRoutes     = require("./src/routes/alerts");

// Stop with a clear message instead of failing on the first login
const missingEnv = ["DATABASE_URL", "JWT_SECRET", "CLIENT_URL"].filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

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
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});

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

  // Keep the demo and admin accounts right, and add the sensors to a new database
  await ensureAccounts(prisma);
  const added = await seedSensors(prisma);
  if (added > 0) console.log(`Added ${added} sensors to a new database`);

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
