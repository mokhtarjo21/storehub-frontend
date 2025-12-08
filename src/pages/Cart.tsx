import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { useCart } from "../contexts/CartContext";

const Cart: React.FC = () => {
  const { t ,language} = useLanguage();
  const { user } = useAuth();
  const [usePoints, setUsePoints] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "split">("cod");
  const { updateQuantity, removeItem, clearCart, items, total, fetchCart } =
    useCart();
  const navigate = useNavigate();
  const hasServices = items.some((item: any) => item.item_type === "service");
  const hasProducts = items.some((item: any) => item.item_type === "product");
  
  
  
  const pointsDiscount = usePoints
    ? Math.min(user?.points || 0, total * 0.1)
    : 0;
  const finalTotal = total - pointsDiscount;

  const handelUpdate = async (
    itemId: string,
    newQuantity: number,
    maxStock: number
  ) => {
    const quantityToSet = Math.max(1, Math.min(newQuantity, maxStock)); // لا يقل عن 1 ولا يزيد عن stock

    try {
      await updateQuantity(itemId, quantityToSet);
      fetchCart();
      toast.success("Cart updated successfully");
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const itemRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
      fetchCart();

      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const cartClear = async () => {
    try {
      clearCart();
      fetchCart();
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
    
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingCartIcon className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              {t("cart.empty.title")}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t("cart.empty.subtitle")}
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {t("cart.empty.cta")}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("cart.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {items.length} {t("cart.itemsCount")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("cart.items")}
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 flex items-center space-x-4 rtl:space-x-reverse hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          item.product?.image ||
                          
                          "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg"
                        }
                        alt={item.product?.name || "Item Image"}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {item.product?.name || "Product Name"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.item_type === "product"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                          }`}
                        >
                          {t("cart.product")}
                        </span>
                      </p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {parseFloat(
                          item.product?.price || item.service?.price || 0
                        ).toLocaleString()}{" "}
                        {item.product.currency}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <button
                        onClick={() =>
                          handelUpdate(
                            item.id,
                            item.quantity - 1,
                            item.product?.stock || item.service?.stock || 999
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>

                      <span className="w-10 text-center font-semibold text-gray-900 dark:text-white text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handelUpdate(
                            item.id,
                            item.quantity + 1,
                            item.product?.stock || item.service?.stock || 999
                          )
                        }
                        disabled={
                          item.quantity >=
                          (item.product?.stock || item.service?.stock || 999)
                        }
                        className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => itemRemove(item.id)}
                        className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title={t("cart.remove") || "Remove item"}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("cart.summary")}
              </h2>

              {/* Payment Method Selection */}
              {hasServices && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t("checkout.payment")}
                  </label>

                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 rtl:space-x-reverse cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as "cod")
                        }
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {t("checkout.cod")}
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {t("checkout.codDesc")}
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 rtl:space-x-reverse cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700/50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="split"
                        checked={paymentMethod === "split"}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value as "split")
                        }
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {t("checkout.split")}
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {t("checkout.splitDesc")}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("cart.promoCode")}
                </label>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder={t("cart.promoCode.placeholder")}
                  />
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium">
                    {t("common.apply")}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("cart.subtotal")}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Number(total).toFixed(2)} {items.currency}
                  </span>
                </div>
                {/* {pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("cart.pointsDiscount")}
                    </span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      -{pointsDiscount.toFixed(2)} EGP
                    </span>
                  </div>
                )} */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("cart.shipping")}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {t("cart.freeShipping")}
                  </span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {t("common.total")}
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {finalTotal.toFixed(2)} {}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-sm hover:shadow-md"
              >
                <CreditCardIcon className="w-5 h-5" />
                <span>{t("cart.checkout")}</span>
              </button>

              <button
                onClick={cartClear}
                className="w-full mt-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
              >
                {t("cart.clear")}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
