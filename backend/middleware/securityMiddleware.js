import crypto from 'crypto';

// Nonce generator for CSP
const generateNonce = () => {
  return Buffer.from(crypto.randomBytes(16)).toString('base64');
};

export const securityHeaders = (req, res, next) => {
  // Nonce oluştur ve request'e ekle
  req.nonce = generateNonce();
  
  // XSS koruması
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content type sniffing koruması
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Clickjacking koruması
  res.setHeader('X-Frame-Options', 'DENY');
  
  // DNS prefetch kontrolü
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  
  // HTTPS zorunluluğu (production'da)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cross-Origin policies
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  
  // Permissions Policy - gereksiz tarayıcı özelliklerini kapat
  res.setHeader('Permissions-Policy', 
    'camera=(), ' +
    'microphone=(), ' +
    'geolocation=(), ' +
    'payment=(), ' +
    'usb=(), ' +
    'accelerometer=(), ' +
    'gyroscope=(), ' +
    'magnetometer=(), ' +
    'ambient-light-sensor=(), ' +
    'autoplay=()'
  );
  
  // İyileştirilmiş Content Security Policy (nonce ile)
  const cspNonce = `'nonce-${req.nonce}'`;
  res.setHeader('Content-Security-Policy', 
    `default-src 'self'; ` +
    `script-src 'self' ${cspNonce}; ` +
    `style-src 'self' ${cspNonce}; ` +
    `img-src 'self' https: data:; ` +
    `connect-src 'self' ${process.env.FRONTEND_URL || 'http://localhost:5173'}; ` +
    `font-src 'self'; ` +
    `object-src 'none'; ` +
    `media-src 'self'; ` +
    `frame-src 'none'; ` +
    `base-uri 'self'; ` +
    `form-action 'self'; ` +
    `upgrade-insecure-requests; ` +
    `block-all-mixed-content; ` +
    (process.env.CSP_REPORT_URI ? `report-uri ${process.env.CSP_REPORT_URI}; ` : '')
  );
  
  // Server bilgisini gizle
  res.removeHeader('X-Powered-By');
  
  next();
};

export const httpsRedirect = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Proxy desteği için daha kapsamlı kontrol
    const isSecure = req.secure || 
                    req.get('x-forwarded-proto') === 'https' ||
                    req.get('x-forwarded-ssl') === 'on' ||
                    req.get('x-url-scheme') === 'https';
    
    if (!isSecure) {
      const host = req.get('host');
      if (host) {
        return res.redirect(301, `https://${host}${req.url}`);
      }
    }
  }
  next();
};

// CSP violation raporlama endpoint'i
export const cspReportHandler = (req, res) => {
  // Import dinamik olarak yap (circular dependency'yi önlemek için)
  import('./loggingMiddleware.js').then(({ securityLogger }) => {
    securityLogger.cspViolation(req.body, req);
  }).catch(err => {
    console.error('CSP log error:', err);
  });
  
  res.status(204).end();
}; 