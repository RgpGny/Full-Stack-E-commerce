// Rate limiting configuration
const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  WINDOW_SIZE: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, 
  MAX_REQUESTS: isDevelopment ? 10000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100), // Development'ta 10000
  MAX_LOGIN_ATTEMPTS: isDevelopment ? 1000 : (parseInt(process.env.RATE_LIMIT_LOGIN_ATTEMPTS) || 5), // Development'ta 1000
  CLEANUP_INTERVAL: 5 * 60 * 1000, 
  USE_REDIS: process.env.REDIS_URL ? true : false
};

// Memory store (Redis alternatifi)
const requestCounts = new Map();

// Eski kayıtları periyodik olarak temizle
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.firstRequest > config.WINDOW_SIZE) {
      requestCounts.delete(key);
    }
  }
}, config.CLEANUP_INTERVAL);

// Güvenilir IP adresini al
const getClientIP = (req) => {
  // Proxy başlıklarından gerçek IP'yi al
  const forwarded = req.get('x-forwarded-for');
  if (forwarded) {
    // İlk IP'yi al (gerçek client IP)
    return forwarded.split(',')[0].trim();
  }
  
  return req.get('x-real-ip') || 
         req.get('x-client-ip') || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// Kullanıcı bazlı identifier al
const getIdentifier = (req, type = 'general') => {
  // Eğer kullanıcı giriş yapmışsa, kullanıcı ID'sini kullan
  if (req.user && req.user.id && type !== 'login') {
    return `user_${req.user.id}`;
  }
  
  // Aksi halde IP kullan
  const ip = getClientIP(req);
  return `${type}_${ip}`;
};

// Ortak rate limiting mantığı
const checkRateLimit = async (identifier, maxRequests, windowSize, req, res) => {
  const now = Date.now();
  
  if (!requestCounts.has(identifier)) {
    requestCounts.set(identifier, {
      count: 1,
      firstRequest: now
    });
    return true; // İzin ver
  }
  
  const clientData = requestCounts.get(identifier);
  
  // Pencere süresi dolmuş mu kontrol et
  if (now - clientData.firstRequest > windowSize) {
    requestCounts.set(identifier, {
      count: 1,
      firstRequest: now
    });
    return true; // İzin ver
  }
  
  clientData.count++;
  
  if (clientData.count > maxRequests) {
    const retryAfter = Math.ceil((windowSize - (now - clientData.firstRequest)) / 1000);
    
    // Rate limit aşımını logla (dinamik import ile circular dependency'yi önle)
    import('./loggingMiddleware.js').then(({ securityLogger }) => {
      securityLogger.rateLimitExceeded(req, identifier, 'general');
    }).catch(err => {
      console.error('Rate limit log error:', err);
    });
    
    // HTTP başlıklarını set et
    res.set({
      'Retry-After': retryAfter,
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': 0,
      'X-RateLimit-Reset': new Date(clientData.firstRequest + windowSize).toISOString()
    });
    
    return false; // Reddet
  }
  
  // Başarılı istek için başlık bilgileri
  res.set({
    'X-RateLimit-Limit': maxRequests,
    'X-RateLimit-Remaining': maxRequests - clientData.count,
    'X-RateLimit-Reset': new Date(clientData.firstRequest + windowSize).toISOString()
  });
  
  return true; // İzin ver
};

// Genel rate limiting
export const generalRateLimit = async (req, res, next) => {
  const identifier = getIdentifier(req, 'general');
  
  const allowed = await checkRateLimit(
    identifier, 
    config.MAX_REQUESTS, 
    config.WINDOW_SIZE, 
    req, 
    res
  );
  
  if (!allowed) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Çok fazla istek gönderdiniz. Lütfen bekleyip tekrar deneyin.',
      type: 'RATE_LIMIT_EXCEEDED',
      limit: config.MAX_REQUESTS,
      windowSize: config.WINDOW_SIZE / 1000,
      retryAfter: parseInt(res.get('Retry-After'))
    });
  }
  
  next();
};

// Login rate limiting (daha katı)
export const loginRateLimit = async (req, res, next) => {
  const identifier = getIdentifier(req, 'login');
  
  const allowed = await checkRateLimit(
    identifier, 
    config.MAX_LOGIN_ATTEMPTS, 
    config.WINDOW_SIZE, 
    req, 
    res
  );
  
  if (!allowed) {
    // Login rate limit aşımını özel olarak logla
    import('./loggingMiddleware.js').then(({ securityLogger }) => {
      securityLogger.rateLimitExceeded(req, identifier, 'login');
    }).catch(err => {
      console.error('Login rate limit log error:', err);
    });
    
    return res.status(429).json({
      error: 'Too Many Login Attempts',
      message: 'Çok fazla giriş denemesi yaptınız. Hesabınızın güvenliği için lütfen bekleyin.',
      type: 'LOGIN_RATE_LIMIT_EXCEEDED',
      limit: config.MAX_LOGIN_ATTEMPTS,
      windowSize: config.WINDOW_SIZE / 1000,
      retryAfter: parseInt(res.get('Retry-After')),
      suggestion: 'Şifrenizi unuttuysanız şifre sıfırlama özelliğini kullanabilirsiniz.'
    });
  }
  
  next();
};

// Özel rate limiting oluşturucu (farklı endpoint'ler için)
export const createRateLimit = (options = {}) => {
  const {
    maxRequests = 50,
    windowSize = 15 * 60 * 1000,
    message = 'Rate limit exceeded',
    keyGenerator = (req) => getIdentifier(req)
  } = options;
  
  return async (req, res, next) => {
    const identifier = keyGenerator(req);
    
    const allowed = await checkRateLimit(identifier, maxRequests, windowSize, req, res);
    
    if (!allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        limit: maxRequests,
        windowSize: windowSize / 1000,
        retryAfter: parseInt(res.get('Retry-After'))
      });
    }
    
    next();
  };
};

// Rate limit durumunu kontrol etme endpoint'i (debug için)
export const getRateLimitStatus = (req, res) => {
  const identifier = getIdentifier(req);
  const data = requestCounts.get(identifier);
  
  if (!data) {
    return res.json({
      identifier,
      status: 'clean',
      requests: 0,
      limit: config.MAX_REQUESTS
    });
  }
  
  const now = Date.now();
  const remaining = config.MAX_REQUESTS - data.count;
  const resetTime = new Date(data.firstRequest + config.WINDOW_SIZE);
  
  res.json({
    identifier,
    status: remaining > 0 ? 'active' : 'limited',
    requests: data.count,
    remaining: Math.max(0, remaining),
    limit: config.MAX_REQUESTS,
    resetTime: resetTime.toISOString(),
    windowSize: config.WINDOW_SIZE / 1000
  });
}; 