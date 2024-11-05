'use client'
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  _id: string;
  materialName:string;
  amount: number;
  category: {
    name: string;
  };
  rent:number
  requestedAmount?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem, amount: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  updateAmount: (itemId: string, amount: number,stock:number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem, amount: number) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i._id === item._id);
      if (existingItem) {
        return prev.map((i) =>
          i._id === item._id
            ? { ...i, requestedAmount: (i.requestedAmount || 0) + amount }
            : i
        );
      }
      return [...prev, { ...item, requestedAmount: amount }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateAmount = (itemId: string, amount: number, stock:number) => {
    if(amount<=0){
  return 
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, requestedAmount: amount } : item
      )
    );
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, updateAmount }}
    >
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
