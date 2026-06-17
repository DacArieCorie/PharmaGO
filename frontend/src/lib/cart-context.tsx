"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "./types";

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  pharmacyId: string | null;
  lines: CartLine[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [pharmacyId, setPharmacyId] = useState<string | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);

  function addItem(product: Product) {
    setLines((prev) => {
      if (pharmacyId && pharmacyId !== product.pharmacyId) {
        // switching pharmacy clears the cart (single-pharmacy order per MVP)
        setPharmacyId(product.pharmacyId);
        return [{ product, quantity: 1 }];
      }
      setPharmacyId(product.pharmacyId);
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeItem(productId: string) {
    setLines((prev) => {
      const next = prev.filter((l) => l.product.id !== productId);
      if (next.length === 0) setPharmacyId(null);
      return next;
    });
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) return removeItem(productId);
    setLines((prev) => prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l)));
  }

  function clear() {
    setLines([]);
    setPharmacyId(null);
  }

  const total = lines.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0);

  return (
    <CartContext.Provider value={{ pharmacyId, lines, addItem, removeItem, setQuantity, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
