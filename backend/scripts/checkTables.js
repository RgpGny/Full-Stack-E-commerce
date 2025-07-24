import { db } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  try {
    console.log('🔍 Mevcut table yapıları kontrol ediliyor...');
    
    // Categories tablosu yapısı
    console.log('\n📂 CATEGORIES tablosu:');
    const categoriesResult = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      ORDER BY ordinal_position;
    `);
    
    if (categoriesResult.rows.length > 0) {
      categoriesResult.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('  ❌ Categories tablosu bulunamadı');
    }
    
    // Products tablosu yapısı
    console.log('\n🛍️ PRODUCTS tablosu:');
    const productsResult = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position;
    `);
    
    if (productsResult.rows.length > 0) {
      productsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('  ❌ Products tablosu bulunamadı');
    }
    
    // Product_categories tablosu yapısı
    console.log('\n🔗 PRODUCT_CATEGORIES tablosu:');
    const productCategoriesResult = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'product_categories' 
      ORDER BY ordinal_position;
    `);
    
    if (productCategoriesResult.rows.length > 0) {
      productCategoriesResult.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('  ❌ Product_categories tablosu bulunamadı');
    }
    
    // Tüm tabloları listele
    console.log('\n📋 Mevcut tüm tablolar:');
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    process.exit(0);
  }
}

checkTables(); 