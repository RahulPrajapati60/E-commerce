import { useState, useEffect } from "react";

const CART_KEY = "cart";
const COUPON_KEY = "coupon";

export const useCart = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [coupon, setCoupon] = useState(() => {
    const saved = localStorage.getItem(COUPON_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Sync coupon to localStorage
  useEffect(() => {
    if (coupon) {
      localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(COUPON_KEY);
    }
  }, [coupon]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.findIndex((i) => i.id === product.id);
      if (exists !== -1) {
        return prev.map((item, i) =>
          i === exists ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(COUPON_KEY);
  };

  return {
    cart,
    coupon,
    setCoupon,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    totalItems: cart.reduce((sum, i) => sum + i.qty, 0),
  };
};