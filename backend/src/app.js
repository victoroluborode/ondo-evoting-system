const express = require("express");
const cors = require("cors");
const pool = require("./config/database");
const { validateEnv } = require("./config/env");
const { securityHeaders, rateLimit, requestId, requestLogger } = require("./middleware/security");

const authRoutes = require("./routes/auth");
const ballotsRoutes = require("./routes/ballots");
const votesRoutes = require("./routes/votes");
const adminRoutes = require("./routes/admin");

validateEnv();

const app = express();

app.set("trust proxy", 1);
app.use(requestId);
app.use(securityHeaders);
app.use(requestLogger);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "256kb" }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.use("/api/auth", authRoutes);
app.use("/api/ballots", ballotsRoutes);
app.use("/api/votes", votesRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Ondo E-Voting API is running" });
});

app.get("/ready", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ready", database: "ok" });
  } catch (error) {
    res.status(503).json({ status: "not_ready", database: "error" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found", requestId: req.id });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(
    JSON.stringify({
      level: "error",
      requestId: req.id,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    }),
  );

  res.status(500).json({ error: "Internal server error", requestId: req.id });
});

module.exports = app;
