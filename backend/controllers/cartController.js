import {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary
} from '../models/cartModel.js';

// Kullanıcının sepetini getir
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await getCartByUserId(userId);
    const summary = await getCartSummary(userId);
    
    res.status(200).json({
      items: cartItems,
      summary: summary,
      message: 'Sepet başarıyla getirildi'
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      message: 'Sepet getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sepete ürün ekle
export const addToCartController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;
    
    // Validasyon
    if (!productId) {
      return res.status(400).json({ message: 'Product ID gerekli' });
    }
    
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({ message: 'Geçerli bir miktar giriniz' });
    }
    
    const result = await addToCart(userId, productId, quantity);
    
    // Güncel sepet özetini getir
    const summary = await getCartSummary(userId);
    
    res.status(201).json({
      message: 'Ürün sepete eklendi',
      cartItem: result,
      summary: summary
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    
    if (error.message.includes('Ürün bulunamadı') || 
        error.message.includes('Stokta yeterli ürün yok')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Sepete eklenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sepet ürün miktarını güncelle
export const updateCartItemController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    
    // Validasyon
    if (!quantity || quantity < 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({ message: 'Geçerli bir miktar giriniz' });
    }
    
    await updateCartItem(userId, cartItemId, quantity);
    
    // Güncel sepet özetini getir
    const summary = await getCartSummary(userId);
    
    res.status(200).json({
      message: quantity === 0 ? 'Ürün sepetten kaldırıldı' : 'Sepet güncellendi',
      summary: summary
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    
    if (error.message.includes('Sepet öğesi bulunamadı') || 
        error.message.includes('Stokta yeterli ürün yok')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Sepet güncellenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sepetten ürün kaldır
export const removeFromCartController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    
    await removeFromCart(userId, cartItemId);
    
    // Güncel sepet özetini getir
    const summary = await getCartSummary(userId);
    
    res.status(200).json({
      message: 'Ürün sepetten kaldırıldı',
      summary: summary
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    
    if (error.message.includes('Sepet öğesi bulunamadı')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Sepetten ürün kaldırılırken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sepeti temizle
export const clearCartController = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await clearCart(userId);
    
    res.status(200).json({
      message: 'Sepet temizlendi',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      message: 'Sepet temizlenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sepet özetini getir
export const getCartSummaryController = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await getCartSummary(userId);
    
    res.status(200).json({
      summary: summary,
      message: 'Sepet özeti getirildi'
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ 
      message: 'Sepet özeti getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 