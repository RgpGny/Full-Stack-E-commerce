import { db } from '../config/db.js';
import { logger } from '../middleware/loggingMiddleware.js';

class MetricsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 dakika cache
  }

  // Cache helper
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Kullanıcı istatistikleri
  async getUserMetrics() {
    const cacheKey = 'user_metrics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_users_24h,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_7d,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
          COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_users
        FROM users
      `);

      const data = result.rows[0];
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('getUserMetrics error', { error: error.message });
      throw error;
    }
  }

  // Ürün istatistikleri
  async getProductMetrics() {
    const cacheKey = 'product_metrics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_products,
          COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock_products,
          COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock_products,
          COUNT(CASE WHEN stock < 10 THEN 1 END) as low_stock_products,
          AVG(price) as average_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          SUM(stock) as total_stock_value,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_products_7d
        FROM products
      `);

      const data = result.rows[0];
      
      // Parse numeric values
      data.average_price = parseFloat(data.average_price) || 0;
      data.min_price = parseFloat(data.min_price) || 0;
      data.max_price = parseFloat(data.max_price) || 0;
      data.total_stock_value = parseInt(data.total_stock_value) || 0;

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('getProductMetrics error', { error: error.message });
      throw error;
    }
  }

  // Sipariş istatistikleri
  async getOrderMetrics() {
    const cacheKey = 'order_metrics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
          SUM(total_price) as total_revenue,
          AVG(total_price) as average_order_value,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as orders_24h,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as orders_7d,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as orders_30d
        FROM orders
      `);

      const data = result.rows[0];
      
      // Parse numeric values
      data.total_revenue = parseFloat(data.total_revenue) || 0;
      data.average_order_value = parseFloat(data.average_order_value) || 0;

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('getOrderMetrics error', { error: error.message });
      throw error;
    }
  }

  // Günlük sipariş grafiği (son 30 gün)
  async getDailyOrdersChart() {
    const cacheKey = 'daily_orders_chart';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          SUM(total_price) as daily_revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);

      const data = result.rows.map(row => ({
        date: row.date,
        orderCount: parseInt(row.order_count),
        revenue: parseFloat(row.daily_revenue) || 0
      }));

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('getDailyOrdersChart error', { error: error.message });
      throw error;
    }
  }

  // En çok satan ürünler
  async getTopSellingProducts() {
    const cacheKey = 'top_selling_products';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query(`
        SELECT 
          p.id,
          p.name,
          p.price,
          SUM(oi.quantity) as total_sold,
          SUM(oi.quantity * oi.unit_price) as total_revenue,
          COUNT(DISTINCT o.id) as order_count
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('shipped', 'delivered')
        GROUP BY p.id, p.name, p.price
        HAVING SUM(oi.quantity) > 0
        ORDER BY total_sold DESC
        LIMIT 10
      `);

      const data = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        price: parseFloat(row.price),
        totalSold: parseInt(row.total_sold),
        totalRevenue: parseFloat(row.total_revenue) || 0,
        orderCount: parseInt(row.order_count)
      }));

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('getTopSellingProducts error', { error: error.message });
      throw error;
    }
  }

  // Kategori istatistikleri
  async getCategoryMetrics() {
    const cacheKey = 'category_metrics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const result = await db.query(`
        SELECT 
          c.id,
          c.name,
          COUNT(pc.product_id) as product_count,
          COALESCE(SUM(oi.quantity), 0) as total_sales,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
        FROM categories c
        LEFT JOIN product_categories pc ON c.id = pc.category_id
        LEFT JOIN order_items oi ON pc.product_id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('shipped', 'delivered')
        GROUP BY c.id, c.name
        ORDER BY total_revenue DESC
      `);

      const data = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        productCount: parseInt(row.product_count),
        totalSales: parseInt(row.total_sales),
        totalRevenue: parseFloat(row.total_revenue) || 0
      }));

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      logger.error('getCategoryMetrics error', { error: error.message });
      throw error;
    }
  }

  // Sistem performans metrikleri
  async getSystemMetrics() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Rate limit istatistikleri (eğer rate limit middleware'i varsa)
    let rateLimitStats = null;
    try {
      // Bu kısım rate limit middleware'ine erişim gerektirir
      rateLimitStats = {
        totalRequests: 0, // Gerçek veri için rate limit middleware'inden alınmalı
        blockedRequests: 0,
        activeConnections: 0
      };
    } catch (error) {
      // Rate limit stats alınamazsa ignore et
    }

    return {
      uptime: Math.floor(uptime),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024) // MB
      },
      nodeVersion: process.version,
      platform: process.platform,
      rateLimitStats,
      cacheStats: {
        entries: this.cache.size,
        hitRate: 0 // Implement hit rate tracking if needed
      }
    };
  }

  // Real-time metrikler (websocket için)
  async getRealTimeMetrics() {
    try {
      const [recentOrders, activeUsers, systemHealth] = await Promise.all([
        // Son 1 saatteki siparişler
        db.query(`
          SELECT COUNT(*) as count 
          FROM orders 
          WHERE created_at >= NOW() - INTERVAL '1 hour'
        `),
        
        // Aktif kullanıcı sayısı (son 15 dakikada işlem yapan)
        // Bu gerçek bir active user tracking için session tablosu gerektirir
        db.query(`
          SELECT COUNT(DISTINCT user_id) as count 
          FROM orders 
          WHERE created_at >= NOW() - INTERVAL '15 minutes'
        `),
        
        // Sistem sağlığı
        db.query('SELECT 1 as health_check')
      ]);

      return {
        recentOrders: parseInt(recentOrders.rows[0].count),
        activeUsers: parseInt(activeUsers.rows[0].count),
        systemHealthy: recentOrders.rows.length > 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('getRealTimeMetrics error', { error: error.message });
      return {
        recentOrders: 0,
        activeUsers: 0,
        systemHealthy: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Tüm metrikleri birleştir
  async getAllMetrics() {
    try {
      const [
        userMetrics,
        productMetrics,
        orderMetrics,
        systemMetrics,
        realTimeMetrics
      ] = await Promise.all([
        this.getUserMetrics(),
        this.getProductMetrics(),
        this.getOrderMetrics(),
        this.getSystemMetrics(),
        this.getRealTimeMetrics()
      ]);

      return {
        users: userMetrics,
        products: productMetrics,
        orders: orderMetrics,
        system: systemMetrics,
        realTime: realTimeMetrics,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('getAllMetrics error', { error: error.message });
      throw error;
    }
  }

  // Cache temizleme
  clearCache() {
    this.cache.clear();
    logger.info('Metrics cache cleared');
  }
}

export default new MetricsService(); 