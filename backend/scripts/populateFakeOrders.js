import { db } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function populateFakeOrders() {
  console.log('📦 Sahte sipariş verileri oluşturuluyor...');
  
  try {
    // Önce mevcut kullanıcıları ve ürünleri getir
    const usersResult = await db.query('SELECT id FROM users LIMIT 10');
    const productsResult = await db.query('SELECT id, price FROM products LIMIT 20');
    
    if (usersResult.rows.length === 0 || productsResult.rows.length === 0) {
      console.log('❌ Kullanıcı veya ürün bulunamadı. Önce populate-db çalıştırın.');
      return;
    }
    
    const users = usersResult.rows;
    const products = productsResult.rows;
    
    console.log(`👥 ${users.length} kullanıcı, 🛍️ ${products.length} ürün bulundu`);
    
    // 50 sahte sipariş oluştur
    const orderCount = 50;
    let successCount = 0;
    
    for (let i = 0; i < orderCount; i++) {
      try {
        await createFakeOrder(users, products, i);
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`📈 İlerleme: ${successCount}/${orderCount} sipariş oluşturuldu`);
        }
      } catch (error) {
        console.error(`❌ Sipariş ${i + 1} oluşturulamadı:`, error.message);
      }
    }
    
    console.log(`✅ ${successCount} sahte sipariş başarıyla oluşturuldu!`);
    
    // Özet bilgiler
    await printOrderSummary();
    
  } catch (error) {
    console.error('❌ Sahte sipariş oluşturma hatası:', error);
  } finally {
    process.exit(0);
  }
}

async function createFakeOrder(users, products, orderIndex) {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Rastgele kullanıcı seç
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const userId = randomUser.id;
    
    // Rastgele tarih (son 3 ay)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
    const randomDate = new Date(threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime()));
    
    // Sipariş durumu (çoğu teslim edilmiş olsun)
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered']; // delivered ağırlıklı
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Her siparişe 1-4 ürün ekle
    const itemCount = Math.floor(Math.random() * 4) + 1;
    let totalPrice = 0;
    
    // Sipariş için rastgele ürünler seç (tekrar etmesin)
    const selectedProducts = [];
    for (let j = 0; j < itemCount; j++) {
      let randomProduct;
      do {
        randomProduct = products[Math.floor(Math.random() * products.length)];
      } while (selectedProducts.some(p => p.id === randomProduct.id));
      
      selectedProducts.push(randomProduct);
    }
    
    // Önce toplam fiyatı hesapla
    const orderItems = [];
    for (const product of selectedProducts) {
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 adet
      const unitPrice = parseFloat(product.price);
      const itemTotal = quantity * unitPrice;
      totalPrice += itemTotal;
      
      orderItems.push({
        productId: product.id,
        quantity: quantity,
        unitPrice: unitPrice
      });
    }
    
    // Sipariş oluştur (total_price ile birlikte)
    const orderResult = await client.query(`
      INSERT INTO orders (user_id, status, total_price, created_at) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id
    `, [userId, randomStatus, totalPrice, randomDate]);
    
    const orderId = orderResult.rows[0].id;
    
    // Sipariş öğelerini oluştur
    for (const item of orderItems) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
        VALUES ($1, $2, $3, $4)
      `, [orderId, item.productId, item.quantity, item.unitPrice]);
    }
    
    // Ödeme sistemi henüz tam hazır olmadığı için şimdilik ödeme kaydı oluşturmuyoruz
    // Siparişler zaten status'leri ile takip ediliyor
    
    await client.query('COMMIT');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function printOrderSummary() {
  try {
    // Toplam sipariş sayısı
    const ordersResult = await db.query('SELECT COUNT(*) as count FROM orders');
    
    // Durum bazında sipariş sayıları
    const statusResult = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM orders 
      GROUP BY status 
      ORDER BY count DESC
    `);
    
    // Toplam gelir
    const revenueResult = await db.query(`
      SELECT SUM(total_price) as total_revenue 
      FROM orders 
      WHERE status = 'delivered'
    `);
    
    // En çok satan ürünler (top 5)
    const topProductsResult = await db.query(`
      SELECT 
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'delivered'
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    
    console.log('\n📊 SİPARİŞ ÖZETİ:');
    console.log(`📦 Toplam Sipariş: ${ordersResult.rows[0].count}`);
    console.log(`💰 Toplam Gelir: ₺${parseFloat(revenueResult.rows[0].total_revenue || 0).toFixed(2)}`);
    
    console.log('\n📈 Durum Bazında Siparişler:');
    statusResult.rows.forEach(row => {
      console.log(`  ${getStatusEmoji(row.status)} ${row.status}: ${row.count} sipariş`);
    });
    
    console.log('\n🏆 En Çok Satan Ürünler:');
    topProductsResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.name}: ${row.total_sold} adet (₺${parseFloat(row.total_revenue).toFixed(2)})`);
    });
    
  } catch (error) {
    console.error('❌ Özet bilgi hatası:', error);
  }
}

function getStatusEmoji(status) {
  const emojis = {
    'pending': '⏳',
    'processing': '🔄',
    'shipped': '🚚',
    'delivered': '✅'
  };
  return emojis[status] || '📦';
}

populateFakeOrders(); 