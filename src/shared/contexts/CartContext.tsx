import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: number;
  qty: number;
  product_name?: string;
  price?: number;
  offer_price?: number | null;
  product_image?: string | null;
  variant_label?: string | null;
  stock_quantity?: number;
  is_available?: boolean;
  [key: string]: unknown;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (product: CartItem) => void;
  setCart: (items: CartItem[]) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItemsState] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle both raw array or persisted format
        if (parsed?.state?.items) return parsed.state.items;
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });

  const setItems = (newItems: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    setItemsState((prevItems) => {
      const updatedItems = typeof newItems === "function" ? newItems(prevItems) : newItems;
      localStorage.setItem("cart", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  const addItem = (product: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === product.id);
      if (existing) {
        return prev.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (product: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === product.id);
      if (!existing) return prev;
      if (existing.qty === 1) {
        return prev.filter((x) => x.id !== product.id);
      }
      return prev.map((x) => (x.id === product.id ? { ...x, qty: x.qty - 1 } : x));
    });
  };

  const setCart = (newItems: CartItem[]) => setItems(newItems);

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
