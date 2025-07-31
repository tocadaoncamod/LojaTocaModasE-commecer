import { useState, useCallback } from 'react';
import { CartItem, CartState } from '../types/cart';
import { Product } from '../data/products';

export const useCart = () => {
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  const [showAddedFeedback, setShowAddedFeedback] = useState(false);

  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0
  });

  const calculateTotal = useCallback((items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return { total, itemCount };
  }, []);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    // Show feedback
    setLastAddedProduct(product);
    setShowAddedFeedback(true);
    setTimeout(() => setShowAddedFeedback(false), 2000);

    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.id === product.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = prevCart.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity
        };
        newItems = [...prevCart.items, newItem];
      }

      const { total, itemCount } = calculateTotal(newItems);
      return { items: newItems, total, itemCount };
    });
  }, [calculateTotal]);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.id !== productId);
      const { total, itemCount } = calculateTotal(newItems);
      return { items: newItems, total, itemCount };
    });
  }, [calculateTotal]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      const { total, itemCount } = calculateTotal(newItems);
      return { items: newItems, total, itemCount };
    });
  }, [calculateTotal, removeFromCart]);

  const clearCart = useCallback(() => {
    setCart({ items: [], total: 0, itemCount: 0 });
  }, []);

  return {
    cart,
    lastAddedProduct,
    showAddedFeedback,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
};