// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Créer le context avec une valeur par défaut non-undefined
const CartContext = createContext({
  cartItems:      [],
  addToCart:      () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart:      () => {},
  totalItems:     0,
  totalPrice:     0,
});

// 2. Hook custom — retourne toujours un objet valide
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit être utilisé dans un CartProvider");
  }
  return context;
};

// 3. Provider
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("habibah_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persister dans localStorage
  useEffect(() => {
    localStorage.setItem("habibah_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size = null) => {
    const chosenSize = size || product.variants?.[0]?.size;
    const variant    = product.variants?.find(v => v.size === chosenSize) || product.variants?.[0];
    const itemId     = `${product._id}_${chosenSize}`;

    setCartItems(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        return prev.map(i =>
          i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        itemId,
        _id:      product._id,
        name:     product.name,
        type:     product.type,
        image:    product.images?.[product.mainImageIndex || 0] || null,
        size:     chosenSize,
        price:    variant?.price || 0,
        quantity: 1,
      }];
    });
  };

  const removeFromCart = (itemId) =>
    setCartItems(prev => prev.filter(i => i.itemId !== itemId));

  const updateQuantity = (itemId, qty) => {
    if (qty <= 0) { removeFromCart(itemId); return; }
    setCartItems(prev => prev.map(i =>
      i.itemId === itemId ? { ...i, quantity: qty } : i
    ));
  };

  const clearCart   = () => setCartItems([]);
  const totalItems  = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice  = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;