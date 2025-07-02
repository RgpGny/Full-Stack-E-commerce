import { db } from '../config/db.js';
import {
  createEmailVerificationTable,
  createPasswordResetTable,
  addEmailVerificationToUsers
} from '../models/emailVerificationModel.js';

async function setupDatabase() {
  try {
    console.log('🔧 Database setup başlatılıyor...');
    
    // Email verification tablolarını oluştur
    console.log('📧 Email verification tabloları oluşturuluyor...');
    await createEmailVerificationTable();
    await createPasswordResetTable();
    
    // Users tablosuna email_verified kolonlarını ekle
    console.log('👤 Users tablosu güncelleniyor...');
    await addEmailVerificationToUsers();
    
    // Performans için index'leri oluştur
    console.log('📊 Performance indexleri oluşturuluyor...');
    await createPerformanceIndexes();
    
    // Cleanup fonksiyonu için scheduled task
    console.log('🧹 Cleanup işlemi ayarlanıyor...');
    setupCleanupTasks();
    
    console.log('✅ Database setup tamamlandı!');
    console.log('\n📋 Eklenen özellikler:');
    console.log('  • Email verification sistemi');
    console.log('  • Password reset sistemi');
    console.log('  • Performance indexleri');
    console.log('  • Otomatik token temizleme');
    
  } catch (error) {
    console.error('❌ Database setup hatası:', error);
    process.exit(1);
  }
}

async function createPerformanceIndexes() {
  const indexes = [
    // User performance indexes
    'CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified)',
    'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
    
    // Product performance indexes
    'CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock)',
    'CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)',
    'CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)',
    
    // Order performance indexes
    'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)',
    'CREATE INDEX IF NOT EXISTS idx_orders_total_price ON orders(total_price)',
    'CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status)',
    
    // Order items performance indexes
    'CREATE INDEX IF NOT EXISTS idx_order_items_product_quantity ON order_items(product_id, quantity)',
    
    // Category performance indexes
    'CREATE INDEX IF NOT EXISTS idx_product_categories_composite ON product_categories(category_id, product_id)'
  ];
  
  for (const indexQuery of indexes) {
    try {
      await db.query(indexQuery);
      console.log(`  ✓ ${indexQuery.split(' ')[5]} oluşturuldu`);
    } catch (error) {
      console.warn(`  ⚠️  Index oluşturulamadı: ${error.message}`);
    }
  }
}

function setupCleanupTasks() {
  // Her gün gece 2:00'da expired token'ları temizle
  const cleanupInterval = 24 * 60 * 60 * 1000; // 24 saat
  
  setInterval(async () => {
    try {
      const { cleanupExpiredTokens } = await import('../models/emailVerificationModel.js');
      const result = await cleanupExpiredTokens();
      
      console.log('🧹 Token cleanup tamamlandı:', {
        verificationTokensDeleted: result.verificationTokensDeleted,
        resetTokensDeleted: result.resetTokensDeleted,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Token cleanup hatası:', error);
    }
  }, cleanupInterval);
  
  console.log('  ✓ Otomatik token temizleme ayarlandı (24 saatte bir)');
}

// Script doğrudan çalıştırılırsa setup'ı başlat
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().finally(() => {
    // Process'i açık bırak (cleanup task'ları için)
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n💡 Development modunda çalışıyor. Cleanup taskları aktif.');
      console.log('   Ctrl+C ile çıkabilirsiniz.');
    }
  });
}

export default setupDatabase; 