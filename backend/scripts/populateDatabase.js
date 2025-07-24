import { db } from '../config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// fetch is built-in in Node.js 18+

const DUMMYJSON_BASE_URL = 'https://dummyjson.com';
const BATCH_SIZE = 10; // Process in batches to avoid overwhelming the API

// Debug: Script başlatma mesajı
console.log('🔧 DEBUG: Script başlatıldı');
console.log('🔧 DEBUG: Environment PORT:', process.env.PORT);
console.log('🔧 DEBUG: Environment DB_HOST:', process.env.DB_HOST);

// Ana fonksiyon
async function populateDatabase() {
  console.log('🚀 Database populate işlemi başlatılıyor...');
  
  try {
    // Database bağlantısını test et
    console.log('🔗 Database bağlantısı test ediliyor...');
    await db.query('SELECT 1');
    console.log('✅ Database bağlantısı başarılı');
    
    // Önce tabloları temizle
    await clearTables();
    
    // 1. Kategorileri çek ve ekle
    console.log('\n📂 Kategoriler çekiliyor...');
    const categories = await fetchAndInsertCategories();
    
    // 2. Ürünleri çek ve ekle
    console.log('\n🛍️ Ürünler çekiliyor...');
    await fetchAndInsertProducts(categories);
    
    console.log('\n✅ Database başarıyla fake verilerle dolduruldu!');
    console.log('📊 Özet:');
    await printSummary();
    
  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    console.error('❌ Stack trace:', error.stack);
  } finally {
    // Database bağlantısını kapat (gerekirse)
    console.log('🔚 Script sonlandırılıyor...');
    process.exit(0);
  }
}

// Tabloları temizle
async function clearTables() {
  console.log('🧹 Mevcut veriler temizleniyor...');
  
  try {
    // Foreign key ilişkisi nedeniyle önce product_categories sonra products sonra categories
    await db.query('TRUNCATE TABLE product_categories CASCADE;');
    await db.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE;');
    await db.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE;');
    
    console.log('✅ Tablolar temizlendi');
  } catch (error) {
    console.error('❌ Tablo temizleme hatası:', error);
    throw error;
  }
}

// Kategorileri çek ve veritabanına ekle
async function fetchAndInsertCategories() {
  try {
    // DummyJSON'dan kategori listesini çek
    console.log('📡 DummyJSON\'dan kategoriler çekiliyor...');
    const response = await fetch(`${DUMMYJSON_BASE_URL}/products/categories`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const categoriesData = await response.json();
    
    console.log(`📋 ${categoriesData.length} kategori bulundu`);
    
    const categoryMap = new Map(); // category slug -> id mapping
    
    // Her kategoriyi veritabanına ekle
    for (const categoryData of categoriesData) {
      const categoryName = categoryData.name || categoryData.slug;
      const categorySlug = categoryData.slug;
      
      // Açıklama için kategori detaylarını çek (varsa)
      let description = `${categoryName} kategorisindeki ürünler`;
      
      // Veritabanına ekle (sadece name kolonu var)
      const result = await db.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING id',
        [categoryName]
      );
      
      const categoryId = result.rows[0].id;
      categoryMap.set(categorySlug, categoryId);
      
      console.log(`✅ Kategori eklendi: ${categoryName} (ID: ${categoryId})`);
    }
    
    return categoryMap;
  } catch (error) {
    console.error('❌ Kategori çekme/ekleme hatası:', error);
    throw error;
  }
}

// Ürünleri çek ve veritabanına ekle
async function fetchAndInsertProducts(categoryMap) {
  try {
    // Önce toplam ürün sayısını öğren
    console.log('📡 Toplam ürün sayısı öğreniliyor...');
    const initialResponse = await fetch(`${DUMMYJSON_BASE_URL}/products?limit=1`);
    
    if (!initialResponse.ok) {
      throw new Error(`HTTP ${initialResponse.status}: ${initialResponse.statusText}`);
    }
    
    const initialData = await initialResponse.json();
    const totalProducts = initialData.total;
    
    console.log(`🎯 Toplam ${totalProducts} ürün bulundu`);
    
    // Tüm ürünleri çek (limit=0 ile tümünü al)
    console.log('📡 Tüm ürünler çekiliyor...');
    const response = await fetch(`${DUMMYJSON_BASE_URL}/products?limit=0`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const productsData = await response.json();
    
    console.log(`📦 ${productsData.products.length} ürün işlenecek`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Ürünleri batch'ler halinde işle
    for (let i = 0; i < productsData.products.length; i += BATCH_SIZE) {
      const batch = productsData.products.slice(i, i + BATCH_SIZE);
      
      console.log(`⚡ Batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(productsData.products.length/BATCH_SIZE)} işleniyor...`);
      
      for (const product of batch) {
        try {
          await insertSingleProduct(product, categoryMap);
          successCount++;
          
          // Progress göstergesi
          if (successCount % 20 === 0) {
            console.log(`📈 İlerleme: ${successCount}/${productsData.products.length} ürün eklendi`);
          }
        } catch (error) {
          console.error(`❌ Ürün ekleme hatası (${product.title}):`, error.message);
          errorCount++;
        }
      }
      
      // Batch'ler arası kısa bekleme
      if (i + BATCH_SIZE < productsData.products.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Ürün ekleme tamamlandı: ${successCount} başarılı, ${errorCount} hatalı`);
    
  } catch (error) {
    console.error('❌ Ürün çekme/ekleme hatası:', error);
    throw error;
  }
}

// Tek bir ürünü veritabanına ekle
async function insertSingleProduct(product, categoryMap) {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Ürün verilerini hazırla
    const productName = product.title;
    const description = product.description || 'Ürün açıklaması bulunmuyor';
    const price = parseFloat(product.price) || 0;
    const stock = parseInt(product.stock) || 0;
    const imageUrl = product.thumbnail || product.images?.[0] || null;
    
    // Ürünü products tablosuna ekle
    const productResult = await client.query(
      'INSERT INTO products (name, description, price, stock, image_url, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
      [productName, description, price, stock, imageUrl]
    );
    
    const productId = productResult.rows[0].id;
    
    // Kategori ilişkisini ekle
    const categorySlug = product.category;
    const categoryId = categoryMap.get(categorySlug);
    
    if (categoryId) {
      await client.query(
        'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
        [productId, categoryId]
      );
    } else {
      console.warn(`⚠️ Kategori bulunamadı: ${categorySlug} (Ürün: ${productName})`);
    }
    
    await client.query('COMMIT');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Özet bilgiler
async function printSummary() {
  try {
    const categoriesResult = await db.query('SELECT COUNT(*) as count FROM categories');
    const productsResult = await db.query('SELECT COUNT(*) as count FROM products');
    const relationsResult = await db.query('SELECT COUNT(*) as count FROM product_categories');
    
    console.log(`📊 Kategoriler: ${categoriesResult.rows[0].count}`);
    console.log(`📊 Ürünler: ${productsResult.rows[0].count}`);
    console.log(`📊 Kategori İlişkileri: ${relationsResult.rows[0].count}`);
    
    // Örnek kategoriler
    const sampleCategories = await db.query('SELECT name FROM categories LIMIT 5');
    console.log('\n🎯 Örnek Kategoriler:');
    sampleCategories.rows.forEach(cat => console.log(`  - ${cat.name}`));
    
    // Örnek ürünler
    const sampleProducts = await db.query('SELECT name, price FROM products LIMIT 5');
    console.log('\n🛍️ Örnek Ürünler:');
    sampleProducts.rows.forEach(prod => console.log(`  - ${prod.name} ($${prod.price})`));
    
  } catch (error) {
    console.error('❌ Özet bilgi hatası:', error);
  }
}

// Script'i direkt çalıştır
console.log('🔧 DEBUG: Ana fonksiyon çağırılıyor...');
populateDatabase(); 