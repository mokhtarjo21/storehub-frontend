import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../types";
import toast from "react-hot-toast";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
const apiBase = import.meta.env.VITE_API_BASE;
interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface CartContextType {
  fetchCart: () => Promise<void>;
  loading: boolean;
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const API_BASE = apiBase + "/api/products/cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  
  const { language } = useLanguage();
  const [items, setItems] = useState<CartItem[]>([]);
  const token = localStorage.getItem("access_token");
  const [loading, setLoading] = useState(true);
  // Fetch cart from API on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product: Product, quantity = 1) => {
    const { logout } = useAuth();
    try {
      const res = await fetch(`${API_BASE}/add/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: product.id,
          quantity,
          item_type: "product",
        }),
      });
      if(res.status > 400) {
        toast.error(language === "ar" ? "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى." : "Session expired. Please log in again.");
      logout();
      }
      if (!res.ok) {
        const errData = await res.json();

        throw new Error(errData.message || "Failed to add item");
      }

      await fetchCart();
      toast.success("Product added to cart");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`${API_BASE}/remove/${itemId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to remove item");
      await fetchCart();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(itemId);

    try {
      const res = await fetch(`${API_BASE}/update/${itemId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) throw new Error("Failed to update quantity");

      const data = await res.json();

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: data.quantity } : item
        )
      );

      return data;
    } catch (err) {
      toast.error("Failed to update cart");
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch(`${API_BASE}/clear/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      await fetchCart();
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  const total = items.reduce((sum, item) => {
    const rawPrice = item.product?.price ?? 0;
    const price = Number(rawPrice) || 0;
    const qty = Number(item.quantity) || 1;

    return sum + price * qty;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        setItems,
        addItem,

        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        fetchCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
