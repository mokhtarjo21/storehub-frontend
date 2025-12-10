import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { apiRequest, handleApiResponse, getAuthHeaders } from "../utils/api";

const API_BASE_URL = "http://72.60.181.116:8000/api";

// Checkout page: converts current user's cart into an order by calling
// POST /api/orders/ (adjust endpoint if your backend differs)

export default function Checkout(): JSX.Element {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, total, fetchCart, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "split">("cod");

  // Shipping fields (prefill from user if available)
  const [shippingName, setShippingName] = useState(
    user?.name || user?.email || ""
  );
  const [shippingEmail, setShippingEmail] = useState(user?.email || "");
  const [shippingPhone, setShippingPhone] = useState(user?.phone || "");
  const [shippingAddress1, setShippingAddress1] = useState(user?.address || "");
  const [shippingAddress2, setShippingAddress2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [notes, setNotes] = useState("");
  

  useEffect(() => {
    // If the user has a default shipping address in profile, you can populate here.
    // This effect is left intentionally light — adapt to your user model.
  }, [user]);

  const finalTotal = Math.max(0, total);

  function validate() {
    if (!items || items.length === 0) {
      toast.error(
        language === "ar"
          ? "السلة فارغة"
          : t("cart.empty.title") || "Cart is empty"
      );
      return false;
    }

    if (
      !shippingName ||
      !shippingEmail ||
      !shippingPhone ||
      !shippingAddress1 ||
      !shippingCity ||
      !shippingState ||
      !shippingCountry ||
      !shippingPostalCode
    ) {
      toast.error(
        language === "ar"
          ? "يرجى ملء جميع الحقول المطلوبة"
          : t("checkout.fillRequired") || "Please fill required shipping fields"
      );
      return false;
    }

    return true;
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Prepare items array from cart
      // IMPORTANT: The cart API should return item_id or service_id/product_id with each item
      // If it doesn't, we need to use cart item ID and backend should map it to actual product/service
      const orderItems = items.map((item: any) => {
        // Check for actual product/service ID in various possible fields
        const actualItemId =
          item.item_id || // Direct item_id field (preferred)
          item.product_id || // Direct product_id field
          item.service_id || // Direct service_id field
          item.product?.id || // Nested in product object
          item.service?.id; // Nested in service object

        // If we have actual item ID, use it. Otherwise, backend should handle cart item ID
        const itemIdToSend = actualItemId || item.id;

        return {
          item_id: itemIdToSend,
          item_type:
            item.item_type ||
            (item.product ? "product" : item.service ? "service" : "product"),
          quantity: item.quantity || 1,
          // Include customer_info if it's a service
          ...(item.item_type === "service" && item.customer_info
            ? { customer_info: item.customer_info }
            : {}),
        };
      });

      const payload = {
        shipping_name: shippingName,
        shipping_email: shippingEmail,
        shipping_phone: shippingPhone,
        shipping_address_line1: shippingAddress1,
        shipping_address_line2: shippingAddress2 || null,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_postal_code: shippingPostalCode || "00000", // Default value if empty
        shipping_country: shippingCountry,
        notes: notes || "",
        payment_method: paymentMethod,
        items: orderItems // Add items array to payload
      };

      const response = await apiRequest("/orders/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Handle response
      const order = await handleApiResponse(response);

      // Update stock for products after successful order creation
      // Note: This should ideally be handled by the backend, but we do it here as a fallback
      try {
        const stockUpdatePromises = items.map(async (item: any) => {
          const actualItemId =
            item.item_id ||
            item.product_id ||
            item.service_id ||
            item.product?.id ||
            item.service?.id;

          if (!actualItemId) return;

          const itemType = item.item_type || (item.product ? "product" : item.service ? "service" : "product");
          
          // Only update stock for products (services typically don't have stock)
          if (itemType === "product" && item.product) {
            const quantity = item.quantity || 1;
            const currentStock = item.product?.stock || 0;
            const newStock = Math.max(0, currentStock - quantity);

            try {
              // Fetch current product data
              const productResponse = await fetch(
                `${API_BASE_URL}/products/${actualItemId}/`,
                {
                  method: "GET",
                  headers: getAuthHeaders(),
                }
              );

              if (productResponse.ok) {
                const productData = await productResponse.json();
                const formData = new FormData();
                
                // Preserve all existing product data and update stock
                Object.keys(productData).forEach((key) => {
                  if (key !== "id" && key !== "image" && key !== "images" && key !== "primary_image") {
                    if (key === "stock") {
                      formData.append(key, String(newStock));
                    } else if (productData[key] !== null && productData[key] !== undefined) {
                      formData.append(key, String(productData[key]));
                    }
                  }
                });

                // Update product stock
                const updateResponse = await fetch(
                  `${API_BASE_URL}/products/admin/products/${actualItemId}/update/`,
                  {
                    method: "PUT",
                    headers: getAuthHeaders(true),
                    body: formData,
                  }
                );

                
              }
            } catch (stockError) {
              console.error(`Failed to update stock for product ${actualItemId}:`, stockError);
              // Don't fail the order if stock update fails
            }
          }
        });

        // Wait for all stock updates to complete (but don't fail if any fail)
        await Promise.allSettled(stockUpdatePromises);
      } catch (stockUpdateError) {
        console.error("Error updating stock:", stockUpdateError);
        // Don't fail the order if stock update fails - backend should handle it
      }

      toast.success(
        t("checkout.success") ||
          (language === "ar"
            ? "تم إنشاء الطلب بنجاح"
            : "Order created successfully")
      );

      // Clear local cart state and refetch
      await clearCart();
      await fetchCart();

      // Navigate to order detail or dashboard
      if (order?.order_number) {
        navigate(`/orders/${order.order_number}`);
      } else if (order?.id) {
        navigate(`/orders/${order.id}`);
      } else {
        // If no order number/id, navigate to dashboard where user can see their orders
        navigate(`/dashboard`);
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data ||
        err.message ||
        t("checkout.failed") ||
        (language === "ar" ? "فشل إنشاء الطلب" : "Failed to create order");
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("checkout.title") || "Checkout"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t("checkout.subtitle") ||
              "Fill shipping information and choose payment method."}
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t("checkout.shipping") || "Shipping Information"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                placeholder={t("checkout.name") || "Full name"}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <input
                value={shippingEmail}
                onChange={(e) => setShippingEmail(e.target.value)}
                type="email"
                placeholder={t("checkout.email") || "Email"}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />

              <input
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                type="tel"
                placeholder={t("checkout.phone") || "Phone"}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />

              <input
                value={shippingAddress1}
                onChange={(e) => setShippingAddress1(e.target.value)}
                placeholder={t("checkout.address1") || "Address line 1"}
                className="sm:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />

              <input
                value={shippingAddress2}
                onChange={(e) => setShippingAddress2(e.target.value)}
                placeholder={
                  t("checkout.address2") || "Address line 2 (optional)"
                }
                className="sm:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />

              <input
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                placeholder={t("checkout.city") || "City"}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />

              <input
                value={shippingState}
                onChange={(e) => setShippingState(e.target.value)}
                placeholder={t("checkout.state") || "State"}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />

              <input
                value={shippingCountry}
                onChange={(e) => setShippingCountry(e.target.value)}
                placeholder={t("checkout.country") || "Country"}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />

              <input
                value={shippingPostalCode}
                onChange={(e) => setShippingPostalCode(e.target.value)}
                placeholder={t("checkout.postalCode") || "Postal Code *"}
                required
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("checkout.notes") || "Order notes (optional)"}
                rows={4}
                className="sm:col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-white">
                {t("checkout.payment") || "Payment Method"}
              </h3>

              <div className="space-y-3">
                <label className="flex items-start space-x-3 rtl:space-x-reverse cursor-pointer p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {t("checkout.cod") || "Cash on Delivery (Full)"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("checkout.codDesc") || "Pay full amount on delivery."}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <aside className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t("checkout.summary") || "Order Summary"}
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("cart.subtotal") || "Subtotal"}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">${total.toFixed(2)}</span>
              </div>


          
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("orders.tax") || "Subtotal"}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">${(total*0.1).toFixed(2)}</span>
              </div>
                
                
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("cart.shipping") || "Shipping"}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {t("cart.freeShipping") || "Free"}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="text-gray-900 dark:text-white">{t("common.total") || "Total"}</span>
                <span className="text-gray-900 dark:text-white">${(finalTotal*1.1).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-2 rtl:space-x-reverse bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <CreditCardIcon className="w-5 h-5" />
              <span>
                {loading
                  ? t("checkout.processing") || "Processing..."
                  : t("checkout.placeOrder") || "Place order"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full mt-2 text-sm py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              {t("common.back") || "Back"}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}
