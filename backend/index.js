import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { db } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/protectedRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { securityHeaders, httpsRedirect, cspReportHandler } from "./middleware/securityMiddleware.js";
import { generalRateLimit, getRateLimitStatus } from "./middleware/rateLimitMiddleware.js";
import { sanitizeInput } from "./middleware/validationMiddleware.js";
import { requestLogger, errorLogger, performanceMonitor, healthCheck } from "./middleware/loggingMiddleware.js";
import emailRoutes from "./routes/emailRoutes.js";
import metricsRoutes from "./routes/metricsRoutes.js";

dotenv.config();

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Logging middleware (en başta)
app.use(requestLogger);
app.use(performanceMonitor);

// Security middleware
app.use(httpsRedirect);
app.use(securityHeaders);

// CORS ve JSON parsing
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(sanitizeInput);

// CSP raporlama endpoint'i
app.post("/api/security/csp-report", express.json({ type: 'application/csp-report' }), cspReportHandler);

// Email routes (özel rate limiting ile, general rate limiting'den önce)
app.use("/api/email", emailRoutes);

// General rate limiting (email routes'larından sonra)
app.use(generalRateLimit);

// Public routes
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json(healthCheck());
});

// Rate limit durumunu görmek için debug endpoint
app.get("/api/debug/rate-limit", getRateLimitStatus);

// Metrics routes (admin only)
app.use("/api/metrics", metricsRoutes);

// Protected routes (auth gerektiren)
app.use(authMiddleware);
app.use("/api/protected", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.get("/test-db", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.send("✅ DB Bağlantısı Başarılı...");
  } catch (err) {
    console.error("❌ DB bağlantı hatası:", err);
    res.status(500).send("❌ DB bağlantı hatası");
  }
});

// Placeholder image route for fallback
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  // Redirect to a working placeholder service
  res.redirect(`https://via.placeholder.com/${width}x${height}/F3F4F6/9CA3AF?text=Placeholder`);
});

// Error handling middleware (en sonda)
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Bir hata oluştu' : err.message
  });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server is running on port ${process.env.PORT}`);
});
