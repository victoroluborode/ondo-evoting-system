const windows = new Map();
const crypto = require("crypto");

function requestId(req, res, next) {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    console.log(
      JSON.stringify({
        level: "info",
        requestId: req.id,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      }),
    );
  });

  next();
}

function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

function rateLimit({ windowMs = 60_000, max = 60 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = windows.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt < now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    windows.set(key, bucket);

    if (bucket.count > max) {
      return res.status(429).json({ error: "Too many requests. Try again shortly." });
    }

    next();
  };
}

module.exports = { requestId, requestLogger, securityHeaders, rateLimit };
