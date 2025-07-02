import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { createRateLimit } from '../middleware/rateLimitMiddleware.js';
import {
  getDashboardOverview,
  getUserMetrics,
  getProductMetrics,
  getOrderMetrics,
  getDailyOrdersChart,
  getTopSellingProducts,
  getCategoryMetrics,
  getSystemMetrics,
  getRealTimeMetrics,
  clearMetricsCache,
  exportMetrics
} from '../controllers/metricsController.js';

const router = express.Router();

// Rate limiting için dashboard endpointleri
const dashboardRateLimit = createRateLimit({
  maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 200, // Development: 1000, Production: 200
  windowSize: 15 * 60 * 1000, // 15 dakika
  message: 'Dashboard API limit aşıldı. Lütfen biraz bekleyin.'
});

// Tüm routes admin yetkisi gerektiriyor
router.use(authMiddleware);
router.use(roleMiddleware('admin'));
router.use(dashboardRateLimit);

// Dashboard ana sayfa
router.get('/overview', getDashboardOverview);

// Spesifik metrik kategorileri
router.get('/users', getUserMetrics);
router.get('/products', getProductMetrics);
router.get('/orders', getOrderMetrics);
router.get('/categories', getCategoryMetrics);
router.get('/system', getSystemMetrics);

// Chart ve grafik data
router.get('/charts/daily-orders', getDailyOrdersChart);
router.get('/charts/top-products', getTopSellingProducts);

// Real-time metrikler
router.get('/realtime', getRealTimeMetrics);

// Cache yönetimi
router.post('/cache/clear', clearMetricsCache);

// Export fonksiyonları
router.get('/export', exportMetrics);

export default router; 