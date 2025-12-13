
import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'vincci_cart';

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.error('Failed to save cart to localStorage');
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => loadCartFromStorage());

  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  // Add drink item with quantity support
  const addDrinkToCart = (drink) => {
    setCartItems((prevItems) => {
      console.log('[CartContext] addDrinkToCart called with', drink);
      const existingIndex = prevItems.findIndex(
        (item) => item && item.type === 'drink' && item.id === drink.id
      );
      
      if (existingIndex >= 0) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + 1
        };
        console.log('[CartContext] updated existing drink item', updated[existingIndex]);
        return updated;
      }
      
      const next = [...prevItems, { ...drink, type: 'drink', quantity: 1 }];
      console.log('[CartContext] added new drink item. Cart now:', next);
      return next;
    });
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(index);
      return;
    }
    setCartItems((prevItems) => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], quantity: newQuantity };
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getDrinkItems = () => cartItems.filter(item => item.type === 'drink');
  const getPackageItems = () => cartItems.filter(item => item.type !== 'drink');
  const getTotalDrinkCount = () => getDrinkItems().reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      addDrinkToCart,
      updateQuantity,
      removeFromCart, 
      clearCart,
      getDrinkItems,
      getPackageItems,
      getTotalDrinkCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
