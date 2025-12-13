import React, { createContext, useContext, useState } from "react";

export interface CartItem {
  id: number;
  name: string;
  nameAr?: string;
  nameFr?: string;
  price: number;
  qty: number;
  imageUrl?: string;    // للعرض فقط
  imageFile?: File;     // لإرسالها للـ backend
}

export interface StoreCart {
  storeName: string;
  storeImage?: string;
  StoreaddressSecondary?: string; // ← مهم جداً
  items: CartItem[];
}



interface CartContextType {
  cart: { [storeId: string]: StoreCart };
  addToCart: (storeId: string, storeName: string, storeImage: string, items: CartItem[]) => void;
  updateCart: (storeId: string, items: CartItem[]) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<{ [storeId: string]: StoreCart }>(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : {};
  });

  const addToCart = (
    storeId: string,
    storeName: string,
    storeImage: string,
    StoreaddressSecondary: string,
    items: CartItem[]
  ) => {
    if (!Array.isArray(items)) items = [];
    const newCart = {
      [storeId]: { storeName, storeImage, StoreaddressSecondary, items }
    };
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
  };
  
  
  
  const updateCart = (storeId: string, items: CartItem[]) => {
    if (!Array.isArray(items)) items = [];

    setCart(prev => {
      const newCart = {
        ...prev,
        [storeId]: { ...prev[storeId], items }
      };
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
