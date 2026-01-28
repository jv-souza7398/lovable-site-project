
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'vincci_cart';

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    console.log('[CartContext] loadCartFromStorage raw:', stored);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    console.log('[CartContext] loadCartFromStorage parsed:', parsed);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[CartContext] Error loading from localStorage:', e);
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    const toSave = Array.isArray(items) ? items : [];
    console.log('[CartContext] saveCartToStorage:', toSave);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('[CartContext] Failed to save cart to localStorage:', e);
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    const stored = loadCartFromStorage();
    console.log('[CartContext] Initial hydration, stored items:', stored);
    if (stored.length > 0) {
      setCartItems(stored);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever cartItems changes (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveCartToStorage(cartItems);
    }
  }, [cartItems, isHydrated]);

  const addToCart = (item) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  // Add drink item (no quantity - each drink appears once)
  const addDrinkToCart = (drink) => {
    setCartItems((prevItems) => {
      console.log('[CartContext] addDrinkToCart called with', drink);
      const alreadyInCart = prevItems.some(
        (item) => item && item.type === 'drink' && item.id === drink.id
      );
      
      if (alreadyInCart) {
        console.log('[CartContext] drink already in cart, skipping');
        return prevItems;
      }
      
      const next = [...prevItems, { ...drink, type: 'drink' }];
      console.log('[CartContext] added new drink item. Cart now:', next);
      return next;
    });
  };

  // Check if a drink is already in the cart
  const isDrinkInCart = (drinkId) => {
    return cartItems.some((item) => item && item.type === 'drink' && item.id === drinkId);
  };

  const removeFromCart = (index) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Force-sync cart from an external source (e.g. localStorage recovery)
  const hydrateCart = (items) => {
    setCartItems(Array.isArray(items) ? items : []);
  };

  const getDrinkItems = () => cartItems;
  const getPackageItems = () => [];
  const getTotalDrinkCount = () => getDrinkItems().length;

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      addDrinkToCart,
      isDrinkInCart,
      removeFromCart, 
      clearCart,
      hydrateCart,
      getDrinkItems,
      getPackageItems,
      getTotalDrinkCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
