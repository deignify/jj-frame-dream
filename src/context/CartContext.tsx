import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { toast } from 'sonner';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => boolean;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  refreshProductStock: (productId: string, newStock: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1): boolean => {
    // Check if product is in stock
    if (!product.in_stock || product.stock_quantity <= 0) {
      toast.error(`${product.name} is out of stock`);
      return false;
    }

    const existingItem = items.find(item => item.product.id === product.id);
    const currentQty = existingItem?.quantity || 0;
    const newQty = currentQty + quantity;

    // Check if requested quantity exceeds available stock
    if (newQty > product.stock_quantity) {
      const availableToAdd = product.stock_quantity - currentQty;
      if (availableToAdd <= 0) {
        toast.error(`Maximum available quantity (${product.stock_quantity}) already in cart`);
        return false;
      }
      toast.warning(`Only ${availableToAdd} more available. Added ${availableToAdd} to cart.`);
      quantity = availableToAdd;
    }

    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    return true;
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return true;
    }
    
    const item = items.find(i => i.product.id === productId);
    if (!item) return false;
    
    // Check if quantity exceeds stock
    if (quantity > item.product.stock_quantity) {
      toast.error(`Only ${item.product.stock_quantity} available in stock`);
      return false;
    }
    
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
    return true;
  };

  const clearCart = () => setItems([]);
  
  // Function to update product stock in cart items (used after fetching fresh data)
  const refreshProductStock = (productId: string, newStock: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const cappedQuantity = Math.min(item.quantity, newStock);
          return {
            ...item,
            product: { ...item.product, stock_quantity: newStock, in_stock: newStock > 0 },
            quantity: cappedQuantity > 0 ? cappedQuantity : item.quantity
          };
        }
        return item;
      }).filter(item => item.product.stock_quantity > 0 || item.quantity <= item.product.stock_quantity)
    );
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      refreshProductStock
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
