import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getCart,
  addToCartController,
  updateCartItemController,
  removeFromCartController,
  clearCartController,
  getCartSummaryController
} from '../controllers/cartController.js';

const router = express.Router();

// Tüm sepet route'ları authentication gerektirir
router.use(authMiddleware);

// Sepet ana route'ları
router.get('/', getCart);                           // GET /api/cart - Sepeti getir
router.post('/add', addToCartController);           // POST /api/cart/add - Sepete ürün ekle
router.get('/summary', getCartSummaryController);   // GET /api/cart/summary - Sepet özeti

// Spesifik sepet öğesi route'ları
router.patch('/:cartItemId', updateCartItemController);    // PATCH /api/cart/:cartItemId - Sepet ürün miktarını güncelle
router.delete('/:cartItemId', removeFromCartController);   // DELETE /api/cart/:cartItemId - Sepetten ürün kaldır

// Sepet yönetimi
router.delete('/clear', clearCartController);       // DELETE /api/cart/clear - Sepeti temizle

export default router; 