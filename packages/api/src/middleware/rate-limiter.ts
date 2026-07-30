import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";
const apiRateLimitMax = Number(
  process.env.API_RATE_LIMIT_MAX ?? (isProduction ? 100 : 500),
);
const authRateLimitMax = Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10);

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000, // 15 minutes
  max: apiRateLimitMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  max: authRateLimitMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
});
