import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

// Checkout page: converts current user's cart into an order by calling
// POST /api/orders/from-cart/ (adjust endpoint if your backend differs)

export default function Checkout(): JSX.Element {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, total, fetchCart, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "split">("cod");
  const [promoCode, setPromoCode] = useState("");
  const [usePoints, setUsePoints] = useState(false);

  // Shipping fields (prefill from user if available)
  const [shippingName, setShippingName] = useState(user?.full_name || user?.email || "");
  const [shippingEmail, setShippingEmail] = useState(user?.email || "");
  const [shippingPhone, setShippingPhone] = useState(user?.phone || "");
  const [shippingAddress1, setShippingAddress1] = useState("");
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

  const pointsDiscount = usePoints && user?.points ? Math.min(user.points, total * 0.1) : 0;
  const finalTotal = Math.max(0, total - pointsDiscount);

  function validate() {
    if (!items || items.length === 0) {
      toast.error(t("cart.empty.title") || "Cart is empty");
      return false;
    }

    if (!shippingName || !shippingEmail || !shippingPhone || !shippingAddress1 || !shippingCity || !shippingState || !shippingPostalCode || !shippingCountry) {
      toast.error(t("checkout.fillRequired") || "Please fill required shipping fields");
      return false;
    }

    return true;
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        shipping_name: shippingName,
        shipping_email: shippingEmail,
        shipping_phone: shippingPhone,
        shipping_address_line1: shippingAddress1,
        shipping_address_line2: shippingAddress2 || null,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_postal_code: shippingPostalCode,
        shipping_country: shippingCountry,
        notes: notes || "",
        payment_method: paymentMethod,
        promo_code: promoCode || null,
        use_points: usePoints || false
      };

      // Adjust endpoint if your backend uses a different route
      const response = await axios.post("/api/orders/from-cart/", payload);

      // Expecting: created order data in response.data (including order_number or id)
      const order = response.data;

      toast.success(t("checkout.success") || "Order created successfully");

      // Clear local cart state and refetch
      clearCart();
      fetchCart();

      // Navigate to order detail or orders list
      if (order?.order_number) {
        navigate(`/orders/${order.order_number}`);
      } else if (order?.id) {
        navigate(`/orders/${order.id}`);
      } else {
        navigate(`/orders`);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.response?.data || err.message || t("checkout.failed") || "Failed to create order";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("checkout.title") || "Checkout"}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t("checkout.subtitle") || "Fill shipping information and choose payment method."}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t("checkout.shipping") || "Shipping Information"}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={shippingName} onChange={(e) => setShippingName(e.target.value)} placeholder={t("checkout.name") || "Full name"} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              <input value={shippingEmail} onChange={(e) => setShippingEmail(e.target.value)} placeholder={t("checkout.email") || "Email"} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

              <input value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} placeholder={t("checkout.phone") || "Phone"} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

              <input value={shippingPostalCode} onChange={(e) => setShippingPostalCode(e.target.value)} placeholder={t("checkout.postal") || "Postal code"} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

              <input value={shippingAddress1} onChange={(e) => setShippingAddress1(e.target.value)} placeholder={t("checkout.address1") || "Address line 1"} className="sm:col-span-2 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

              <input value={shippingAddress2} onChange={(e) => setShippingAddress2(e.target.value)} placeholder={t("checkout.address2") || "Address line 2 (optional)"} className="sm:col-span-2 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

              <input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} placeholder={t("checkout.city") || "City"} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

              <input value={shippingState} onChange={(e) => setShippingState(e.target.value)} placeholder={t("checkout.state") || "State"} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

              <input value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} placeholder={t("checkout.country") || "Country"} className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />

              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("checkout.notes") || "Order notes (optional)"} className="sm:col-span-2 px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>

            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2 text-gray-900 dark:text-white">{t("checkout.payment") || "Payment Method"}</h3>

              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-medium">{t("checkout.cod") || "Cash on Delivery (Full)"}</div>
                    <div className="text-xs text-gray-500">{t("checkout.codDesc") || "Pay full amount on delivery."}</div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input type="radio" name="payment" value="split" checked={paymentMethod === "split"} onChange={() => setPaymentMethod("split")} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-medium">{t("checkout.split") || "Split Payment (Deposit)"}</div>
                    <div className="text-xs text-gray-500">{t("checkout.splitDesc") || "Pay deposit now for services."}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <aside className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t("checkout.summary") || "Order Summary"}</h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("cart.subtotal") || "Subtotal"}</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>

              {user?.points && (
                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center space-x-2">
                    <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
                    <span className="text-sm">{t("cart.usePoints") || `Use points (${user.points})`}</span>
                  </label>
                  {usePoints && <span className="text-green-600">-${pointsDiscount.toFixed(2)}</span>}
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("cart.shipping") || "Shipping"}</span>
                <span className="font-medium">{t("cart.freeShipping") || "Free"}</span>
              </div>

              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{t("common.total") || "Total"}</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-3">
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder={t("cart.promoCode.placeholder") || "Promo code"} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full inline-flex items-center justify-center space-x-2 rtl:space-x-reverse bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md">
              <CreditCardIcon className="w-5 h-5" />
              <span>{loading ? (t("checkout.processing") || "Processing...") : (t("checkout.placeOrder") || "Place order")}</span>
            </button>

            <button type="button" onClick={() => navigate(-1)} className="w-full mt-2 text-sm py-2">{t("common.back") || "Back"}</button>
          </aside>
        </form>
      </div>
    </div>
  );
}
