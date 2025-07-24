import { db } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createCartTable() {
  try {
    console.log('🗄️ Cart tablosu oluşturuluyor...');

    // Cart items tablosunu oluştur
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);

    console.log('✅ cart_items tablosu oluşturuldu');

    // Index'leri oluştur
    await db.query('CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);');

    console.log('✅ Cart tablosu indexleri oluşturuldu');

    // Trigger oluştur - updated_at otomatik güncellemesi için
    await db.query(`
      CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS cart_items_updated_at_trigger ON cart_items;
      CREATE TRIGGER cart_items_updated_at_trigger
        BEFORE UPDATE ON cart_items
        FOR EACH ROW
        EXECUTE FUNCTION update_cart_items_updated_at();
    `);

    console.log('✅ Cart tablosu triggerı oluşturuldu');

    // Mevcut tabloların durumunu kontrol et
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'products', 'cart_items')
      ORDER BY table_name;
    `);

    console.log('\n📋 Mevcut tablolar:');
    result.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    console.log('\n🎉 Cart tablosu kurulumu tamamlandı!');

  } catch (error) {
    console.error('❌ Cart tablosu oluşturulurken hata:', error);
  } finally {
    process.exit(0);
  }
}

createCartTable(); 