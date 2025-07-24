import { db } from '../config/db.js';

// Kullanıcının sepetini getir
export const getCartByUserId = async (userId) => {
  try {
    const result = await db.query(`
      SELECT 
        ci.id as cart_item_id,
        ci.product_id,
        ci.quantity,
        ci.created_at,
        p.name as product_name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        (ci.quantity * p.price) as total_price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `, [userId]);
    
    return result.rows;
  } catch (error) {
    throw new Error('Sepet getirilirken hata oluştu: ' + error.message);
  }
};

// Sepete ürün ekle
export const addToCart = async (userId, productId, quantity = 1) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Önce ürünün mevcut olup olmadığını ve stokunu kontrol et
    const productResult = await client.query(
      'SELECT id, stock, price FROM products WHERE id = $1',
      [productId]
    );
    
    if (productResult.rows.length === 0) {
      throw new Error('Ürün bulunamadı');
    }
    
    const product = productResult.rows[0];
    if (product.stock < quantity) {
      throw new Error('Stokta yeterli ürün yok');
    }
    
    // Sepette bu ürün var mı kontrol et
    const existingItem = await client.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    
    if (existingItem.rows.length > 0) {
      // Var olan ürünün miktarını güncelle
      const newQuantity = existingItem.rows[0].quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw new Error('Stokta yeterli ürün yok');
      }
      
      const result = await client.query(
        'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newQuantity, existingItem.rows[0].id]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    } else {
      // Yeni ürün ekle
      const result = await client.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
        [userId, productId, quantity]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Sepet ürün miktarını güncelle
export const updateCartItem = async (userId, cartItemId, quantity) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    // Sepet öğesinin kullanıcıya ait olduğunu kontrol et
    const cartItemResult = await client.query(
      'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = $1 AND ci.user_id = $2',
      [cartItemId, userId]
    );
    
    if (cartItemResult.rows.length === 0) {
      throw new Error('Sepet öğesi bulunamadı');
    }
    
    const cartItem = cartItemResult.rows[0];
    
    if (quantity <= 0) {
      // Miktar 0 veya daha azsa ürünü sepetten kaldır
      await client.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
    } else {
      // Stok kontrolü
      if (cartItem.stock < quantity) {
        throw new Error('Stokta yeterli ürün yok');
      }
      
      // Miktarı güncelle
      await client.query(
        'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
        [quantity, cartItemId]
      );
    }
    
    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Sepetten ürün kaldır
export const removeFromCart = async (userId, cartItemId) => {
  try {
    const result = await db.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [cartItemId, userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Sepet öğesi bulunamadı');
    }
    
    return result.rows[0];
  } catch (error) {
    throw new Error('Sepetten ürün kaldırılırken hata oluştu: ' + error.message);
  }
};

// Sepeti temizle
export const clearCart = async (userId) => {
  try {
    const result = await db.query(
      'DELETE FROM cart_items WHERE user_id = $1 RETURNING *',
      [userId]
    );
    
    return { deletedCount: result.rowCount };
  } catch (error) {
    throw new Error('Sepet temizlenirken hata oluştu: ' + error.message);
  }
};

// Sepet özetini getir
export const getCartSummary = async (userId) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(ci.id) as item_count,
        SUM(ci.quantity) as total_quantity,
        SUM(ci.quantity * p.price) as total_amount
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
    `, [userId]);
    
    const summary = result.rows[0];
    
    return {
      itemCount: parseInt(summary.item_count) || 0,
      totalQuantity: parseInt(summary.total_quantity) || 0,
      totalAmount: parseFloat(summary.total_amount) || 0
    };
  } catch (error) {
    throw new Error('Sepet özeti getirilirken hata oluştu: ' + error.message);
  }
}; 