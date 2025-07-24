import { useState, useEffect } from 'react';
import { getCart, getCartSummary } from '../utils/Api';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    itemCount: 0,
    totalQuantity: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sepet verilerini getir
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cartData = await getCart();
      setCartItems(cartData.items || []);
      setCartSummary(cartData.summary || {
        itemCount: 0,
        totalQuantity: 0,
        totalAmount: 0
      });
    } catch (error) {
      console.error('Fetch cart error:', error);
      setError(error.message || 'Sepet yüklenirken hata oluştu');
      // Hata durumunda boş sepet göster
      setCartItems([]);
      setCartSummary({
        itemCount: 0,
        totalQuantity: 0,
        totalAmount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Sadece sepet özetini getir (daha hızlı)
  const fetchCartSummary = async () => {
    try {
      const summaryData = await getCartSummary();
      setCartSummary(summaryData.summary || {
        itemCount: 0,
        totalQuantity: 0,
        totalAmount: 0
      });
    } catch (error) {
      console.error('Fetch cart summary error:', error);
      // Hata durumunda varsayılan değerler
      setCartSummary({
        itemCount: 0,
        totalQuantity: 0,
        totalAmount: 0
      });
    }
  };

  // Component mount olduğunda sepet özetini getir
  useEffect(() => {
    fetchCartSummary();
  }, []);

  // Sepeti yenile
  const refreshCart = () => {
    fetchCartSummary();
  };

  return {
    cartItems,
    cartSummary,
    loading,
    error,
    fetchCart,
    fetchCartSummary,
    refreshCart
  };
}; 