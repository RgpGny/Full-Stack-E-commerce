import validator from 'validator';

export const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  
  console.log('Validation check:', { 
    username: username ? 'present' : 'missing', 
    email: email ? 'present' : 'missing', 
    password: password ? `${password.length} chars` : 'missing' 
  });
  
  const errors = [];
  
  // Username doğrulama
  if (!username) {
    errors.push('Kullanıcı adı gereklidir');
  } else if (username.length < 3 || username.length > 50) {
    errors.push('Kullanıcı adı 3-50 karakter arasında olmalıdır');
  }
  
  // Email doğrulama
  if (!email) {
    errors.push('Email adresi gereklidir');
  } else if (!validator.isEmail(email)) {
    errors.push('Geçerli bir email adresi giriniz');
  }
  
  // Password doğrulama
  if (!password) {
    errors.push('Şifre gereklidir');
  } else {
    if (password.length < 8) {
      errors.push('Şifre en az 8 karakter olmalıdır');
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.push('Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir');
    }
  }
  
  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    return res.status(400).json({ 
      message: 'Doğrulama hataları', 
      errors: errors 
    });
  }
  
  console.log('Validation passed');
  next();
};

export const validateProduct = (req, res, next) => {
  const { name, price, stock } = req.body;
  
  const errors = [];
  
  if (!name || name.length < 2 || name.length > 100) {
    errors.push('Ürün adı 2-100 karakter arasında olmalıdır');
  }
  
  if (!price || isNaN(price) || price <= 0) {
    errors.push('Geçerli bir fiyat giriniz');
  }
  
  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    errors.push('Stok miktarı 0 veya pozitif olmalıdır');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation errors', errors });
  }
  
  next();
};

export const sanitizeInput = (req, res, next) => {
  // XSS koruması için input'ları temizle (password haricinde)
  const sanitizeObject = (obj, skipKeys = []) => {
    for (let key in obj) {
      if (skipKeys.includes(key)) {
        continue; // Password'u sanitize etme
      }
      
      if (typeof obj[key] === 'string') {
        obj[key] = validator.escape(obj[key].trim());
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key], skipKeys);
      }
    }
  };
  
  // Auth route'larında password'u sanitize etme
  const skipKeys = req.originalUrl.includes('/auth') ? ['password'] : [];
  
  if (req.body) sanitizeObject(req.body, skipKeys);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  
  next();
}; 