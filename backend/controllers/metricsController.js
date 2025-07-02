import metricsService from '../services/metricsService.js';
import { logger } from '../middleware/loggingMiddleware.js';

// Dashboard overview metrikleri
export const getDashboardOverview = async (req, res) => {
  try {
    const metrics = await metricsService.getAllMetrics();
    
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Dashboard overview error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Metrikler alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kullanıcı metrikleri
export const getUserMetrics = async (req, res) => {
  try {
    const userMetrics = await metricsService.getUserMetrics();
    
    res.status(200).json({
      success: true,
      data: userMetrics
    });
  } catch (error) {
    logger.error('User metrics error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Kullanıcı metrikleri alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Ürün metrikleri
export const getProductMetrics = async (req, res) => {
  try {
    const productMetrics = await metricsService.getProductMetrics();
    
    res.status(200).json({
      success: true,
      data: productMetrics
    });
  } catch (error) {
    logger.error('Product metrics error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Ürün metrikleri alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sipariş metrikleri
export const getOrderMetrics = async (req, res) => {
  try {
    const orderMetrics = await metricsService.getOrderMetrics();
    
    res.status(200).json({
      success: true,
      data: orderMetrics
    });
  } catch (error) {
    logger.error('Order metrics error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Sipariş metrikleri alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Günlük sipariş grafiği
export const getDailyOrdersChart = async (req, res) => {
  try {
    const chartData = await metricsService.getDailyOrdersChart();
    
    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    logger.error('Daily orders chart error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Günlük sipariş grafiği alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// En çok satan ürünler
export const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await metricsService.getTopSellingProducts();
    
    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    logger.error('Top selling products error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'En çok satan ürünler alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Kategori metrikleri
export const getCategoryMetrics = async (req, res) => {
  try {
    const categoryMetrics = await metricsService.getCategoryMetrics();
    
    res.status(200).json({
      success: true,
      data: categoryMetrics
    });
  } catch (error) {
    logger.error('Category metrics error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Kategori metrikleri alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sistem metrikleri
export const getSystemMetrics = async (req, res) => {
  try {
    const systemMetrics = await metricsService.getSystemMetrics();
    
    res.status(200).json({
      success: true,
      data: systemMetrics
    });
  } catch (error) {
    logger.error('System metrics error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Sistem metrikleri alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Real-time metrikler
export const getRealTimeMetrics = async (req, res) => {
  try {
    const realTimeMetrics = await metricsService.getRealTimeMetrics();
    
    res.status(200).json({
      success: true,
      data: realTimeMetrics
    });
  } catch (error) {
    logger.error('Real-time metrics error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Gerçek zamanlı metrikler alınamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Cache temizleme (admin only)
export const clearMetricsCache = async (req, res) => {
  try {
    metricsService.clearCache();
    
    logger.info('Metrics cache cleared', { 
      userId: req.user?.id,
      userRole: req.user?.role 
    });
    
    res.status(200).json({
      success: true,
      message: 'Metrik cache temizlendi'
    });
  } catch (error) {
    logger.error('Clear metrics cache error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Cache temizlenemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Excel export için metrikler
export const exportMetrics = async (req, res) => {
  try {
    const { type = 'all', format = 'json' } = req.query;
    
    let data;
    
    switch (type) {
      case 'users':
        data = await metricsService.getUserMetrics();
        break;
      case 'products':
        data = await metricsService.getProductMetrics();
        break;
      case 'orders':
        data = await metricsService.getOrderMetrics();
        break;
      case 'daily-orders':
        data = await metricsService.getDailyOrdersChart();
        break;
      case 'top-products':
        data = await metricsService.getTopSellingProducts();
        break;
      case 'categories':
        data = await metricsService.getCategoryMetrics();
        break;
      default:
        data = await metricsService.getAllMetrics();
    }
    
    // Format başlıklarını set et
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="metrics-${type}-${new Date().toISOString().split('T')[0]}.csv"`);
      
      // CSV formatına çevir (basit implementation)
      const csvData = JSON.stringify(data).replace(/[{}]/g, '').replace(/"/g, '');
      res.send(csvData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="metrics-${type}-${new Date().toISOString().split('T')[0]}.json"`);
      
      res.status(200).json({
        success: true,
        exportDate: new Date().toISOString(),
        type,
        data
      });
    }
    
    logger.info('Metrics exported', { 
      type,
      format,
      userId: req.user?.id 
    });
    
  } catch (error) {
    logger.error('Export metrics error', { 
      error: error.message,
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      message: 'Metrikler export edilemedi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 