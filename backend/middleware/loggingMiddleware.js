import fs from 'fs';
import path from 'path';

// Log seviyeleri
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Log dosyalarının kaydedileceği dizin
const LOG_DIR = process.env.LOG_DIR || './logs';

// Log dizinini oluştur
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

class Logger {
  constructor() {
    this.level = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'];
    this.logToFile = process.env.LOG_TO_FILE === 'true';
  }

  formatMessage(level, message, meta = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      pid: process.pid,
      ...meta
    };
  }

  log(level, message, meta = {}) {
    if (LOG_LEVELS[level] > this.level) return;

    const logEntry = this.formatMessage(level, message, meta);
    const logString = JSON.stringify(logEntry);

    // Konsola yazdır
    console.log(logString);

    // Dosyaya kaydet (eğer enabled ise)
    if (this.logToFile) {
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(LOG_DIR, `app-${today}.log`);
      
      fs.appendFile(logFile, logString + '\n', (err) => {
        if (err) console.error('Log yazma hatası:', err);
      });
    }
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }
}

const logger = new Logger();

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const ip = req.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             req.get('x-real-ip') || 
             req.connection.remoteAddress;

  // Request başlangıcını logla
  logger.info('HTTP Request Started', {
    method: req.method,
    url: req.url,
    ip,
    userAgent: req.get('user-agent'),
    referer: req.get('referer'),
    userId: req.user?.id,
    requestId: req.get('x-request-id') || Math.random().toString(36).substr(2, 9)
  });

  // Response bittiğinde logla
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    
    logger.log(level, 'HTTP Request Completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip,
      userId: req.user?.id,
      contentLength: res.get('content-length'),
      requestId: req.get('x-request-id')
    });
  });

  next();
};

// Security event logger
export const securityLogger = {
  rateLimitExceeded: (req, identifier, type) => {
    logger.warn('Rate Limit Exceeded', {
      type: 'SECURITY_RATE_LIMIT',
      identifier,
      rateLimitType: type,
      ip: req.get('x-forwarded-for')?.split(',')[0]?.trim() || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      url: req.url,
      method: req.method,
      userId: req.user?.id
    });
  },

  loginAttempt: (email, success, req) => {
    logger.info('Login Attempt', {
      type: 'SECURITY_LOGIN',
      email,
      success,
      ip: req.get('x-forwarded-for')?.split(',')[0]?.trim() || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });
  },

  cspViolation: (violation, req) => {
    logger.warn('CSP Violation', {
      type: 'SECURITY_CSP',
      violation,
      ip: req.get('x-forwarded-for')?.split(',')[0]?.trim() || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      referer: req.get('referer')
    });
  },

  suspiciousActivity: (activity, req) => {
    logger.error('Suspicious Activity Detected', {
      type: 'SECURITY_SUSPICIOUS',
      activity,
      ip: req.get('x-forwarded-for')?.split(',')[0]?.trim() || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      url: req.url,
      method: req.method,
      userId: req.user?.id
    });
  }
};

// Error logger middleware
export const errorLogger = (err, req, res, next) => {
  logger.error('Application Error', {
    type: 'APPLICATION_ERROR',
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.get('x-forwarded-for')?.split(',')[0]?.trim() || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.id
    }
  });
  
  next(err);
};

// Database query logger
export const dbLogger = {
  query: (sql, params, duration) => {
    logger.debug('Database Query', {
      type: 'DATABASE_QUERY',
      sql: sql.replace(/\s+/g, ' ').trim(),
      paramsCount: params ? params.length : 0,
      duration
    });
  },

  error: (sql, params, error) => {
    logger.error('Database Error', {
      type: 'DATABASE_ERROR',
      sql: sql.replace(/\s+/g, ' ').trim(),
      paramsCount: params ? params.length : 0,
      error: {
        message: error.message,
        code: error.code
      }
    });
  }
};

// Performance monitoring
export const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    
    const duration = Number(endTime - startTime) / 1000000; // nanoseconds to milliseconds
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal
    };

    if (duration > 1000) { // 1 saniyeden uzun süren istekleri logla
      logger.warn('Slow Request', {
        type: 'PERFORMANCE_SLOW_REQUEST',
        method: req.method,
        url: req.url,
        duration,
        memoryDelta,
        statusCode: res.statusCode
      });
    }
  });

  next();
};

// Health check endpoint helper
export const healthCheck = () => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 60)} minutes`,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`
    },
    nodeVersion: process.version,
    platform: process.platform
  };
};

export { logger };
export default logger; 