import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../hooks/useApi";

import OrderStatusTimeline from "../components/OrderStatusTimeline";
import PaymentSteps from "../components/PaymentSteps";
import toast from "react-hot-toast";

const OrderDetail: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { t, language } = useLanguage();
  const { cancelorders} = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
  const locale = useMemo(
    () => (language === "ar" ? "ar-EG" : "en-GB"),
    [language]
  );

  const {
    data: order,
    loading,
    error,
    execute: refetchOrder,
  } = useApi(`/orders/${orderNumber}/`);

  const handleCancelOrder = async (notes:any) => {
    if (!order) return;

    
    setCancelling(true);
    try {
      
      const [cancelResult] = await Promise.allSettled([
        cancelorders(order.order_number,rejectReason),
      ]);

    
      let cancelSuccess = false;
      try {
        refetchOrder();

        
      } catch (refreshError) {
        console.error("Error refreshing order data:", refreshError);
      }

      // إذا نجح الإلغاء أو التحديث في السيرفر
      if (cancelResult.status === "fulfilled" || cancelSuccess) {
        await refetchOrder();
        toast.success(
          t("orders.cancelled") ||
            (language === "ar"
              ? "تم إلغاء الطلب بنجاح"
              : "Order cancelled successfully")
        );
      } else {
        await refetchOrder();
        toast.success(
          language === "ar"
            ? "تم إلغاء الطلب (تم التحديث محلياً)"
            : "Order cancelled (updated locally)"
        );
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error(
        t("orders.cancelFailed") ||
          (language === "ar" ? "فشل في إلغاء الطلب" : "Failed to cancel order")
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("orders.notFound")}
          </h2>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t("orders.backToDashboard")}
          </Link>
        </div>
      </div>
    );
  }
  
  

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border border-red-200 dark:border-red-800";
      case "shipped":
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800";
      case "processing":
      case "confirmed":
      case "preparing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200 border border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t("orders.orderNumber") ||
                  (language === "ar" ? "رقم الطلب #" : "Order Number #")}{" "}
                {order.order_number}
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {t("orders.placedOn") ||
                  (language === "ar" ? "تم الطلب في" : "Placed on")}{" "}
                {new Date(order.created_at).toLocaleDateString(locale)}
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <span
                className={`inline-flex px-3 py-2 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                  order.order_status
                )}`}
              >
                {t("orders.orderStatus") ||
                  (language === "ar" ? "حالة الطلب" : "Order Status")}{" "}
                {t(`${order.status_display}`) || t(`${order.order_status}`)}
              </span>

              {order.can_be_cancelled && (
                <button
                  onClick={()=>setIsRejectModalOpen(true)}
                  disabled={cancelling}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:bg-red-400 dark:disabled:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>
                        {language === "ar"
                          ? "جاري الإلغاء..."
                          : "Cancelling..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="w-4 h-4" />
                      <span>
                        {t("orders.cancel") ||
                          (language === "ar" ? "إلغاء الطلب" : "Cancel Order")}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t("orders.orderStatus") ||
                  (language === "ar" ? "حالة الطلب" : "Order Status")}
              </h2>

              <OrderStatusTimeline
                timeline={order.timeline}
                currentStatus={t(`${order.order_status}`)}
              />

              {/* Tracking Information */}
              {order.is_trackable && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">
                      {t("orders.trackingInformation") ||
                        (language === "ar"
                          ? "معلومات التتبع"
                          : "Tracking Information")}
                    </h3>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      <strong>
                        {t("orders.trackingNumber") ||
                          (language === "ar"
                            ? "رقم التتبع:"
                            : "Tracking Number:")}
                      </strong>{" "}
                      {order.tracking_number}
                    </p>
                    <p>
                      <strong>
                        {t("orders.carrier") ||
                          (language === "ar" ? "شركة الشحن:" : "Carrier:")}
                      </strong>{" "}
                      {order.carrier}
                    </p>
                    {order.estimated_delivery && (
                      <p>
                        <strong>
                          {t("orders.estimatedDelivery") ||
                            (language === "ar"
                              ? "التسليم المتوقع:"
                              : "Estimated Delivery:")}
                        </strong>{" "}
                        {new Date(order.estimated_delivery).toLocaleDateString(
                          locale
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Steps - Only show if has payment transactions */}
            {order.payment_transactions &&
              order.payment_transactions.length > 0 && (
                <div className="mt-8">
                  <PaymentSteps
                    transactions={order.payment_transactions}
                    totalAmount={parseFloat(order.total_price)}
                  />
                </div>
              )}
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Order Totals */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t("orders.orderSummary") ||
                  (language === "ar" ? "ملخص الطلب" : "Order Summary")}
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t("orders.subtotal") ||
                      (language === "ar" ? "المجموع الفرعي:" : "Subtotal:")}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {parseFloat(order.subtotal || 0).toFixed(2)} {order.currency}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t("orders.tax") ||
                      (language === "ar" ? "الضريبة:" : "Tax:")}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {parseFloat(order.tax_amount || 0).toFixed(2)} {order.currency}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {t("orders.shipping") ||
                      (language === "ar" ? "الشحن:" : "Shipping:")}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {parseFloat(order.shipping_amount || 0) === 0
                      ? t("orders.free") ||
                        (language === "ar" ? "مجاني" : "Free")
                      : `${parseFloat(order.shipping_amount || 0).toFixed(2)}`} {order.currency}
                  </span>
                </div>
                {parseFloat(order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {t("orders.discount") ||
                        (language === "ar" ? "الخصم:" : "Discount:")}
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      -${parseFloat(order.discount_amount || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base sm:text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span className="text-gray-900 dark:text-white">
                    {t("orders.total") ||
                      (language === "ar" ? "المجموع:" : "Total:")}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {parseFloat(order.total_price || 0).toFixed(2)} {order.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t("orders.shippingAddress") ||
                  (language === "ar" ? "عنوان الشحن" : "Shipping Address")}
              </h3>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium break-words">
                    {order.shipping_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 break-all">
                    {order.shipping_email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {order.shipping_phone}
                  </span>
                </div>
                <div className="ml-6 sm:ml-6 text-gray-600 dark:text-gray-300 break-words">
                  {order.full_shipping_address || order.shipping_address}
                </div>
              </div>
            </div>

            {/* Points Information */}
            {/* {(order.points_used > 0 || order.points_earned > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {t("orders.points") ||
                    (language === "ar" ? "النقاط" : "Points")}
                </h3>

                <div className="space-y-2 text-xs sm:text-sm">
                  {order.points_used > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t("orders.pointsUsed") ||
                          (language === "ar"
                            ? "النقاط المستخدمة:"
                            : "Points Used:")}
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        -{order.points_used}
                      </span>
                    </div>
                  )}
                  {order.points_earned > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        {t("orders.pointsEarned") ||
                          (language === "ar"
                            ? "النقاط المكتسبة:"
                            : "Points Earned:")}
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{order.points_earned}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )} */}
          </motion.div>
        </div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {t("orders.items") ||
                (language === "ar" ? "عناصر الطلب" : "Order Items")}{" "}
              ({order.items?.length || 0})
            </h3>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.items?.map((item: any) => (
                          
              <div
                key={item.id}
                className="px-4 sm:px-6 py-3 sm:py-4 flex items-start sm:items-center gap-3 sm:gap-4"
              >
                {item.item_image && (
                  <img
                    src={item.item_image}
                    alt={item.item_name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white mb-1 break-words">
                    {item.item_name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {item.item_type === "product"
                      ? t("orders.product") ||
                        (language === "ar" ? "منتج" : "Product")
                      : t("orders.service") ||
                        (language === "ar" ? "خدمة" : "Service")}
                    {item.item_sku &&
                      ` • ${
                        t("orders.sku") ||
                        (language === "ar" ? "رمز المنتج" : "SKU")
                      }: ${item.item_sku}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white mb-1">
                    {item.item_role=='toform' && item.unit_price == 0? t('pricing'): parseFloat(item.unit_price || 0).toFixed(2) } {order.currency}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {t("orders.totalItem") ||
                      (language === "ar" ? "الإجمالي:" : "Total:")}{" "}
                   
                    {item.item_role=='toform' && item.total_price == 0? t('pricing'): parseFloat(item.total_price || 0).toFixed(2) } {order.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
             {order.hint_note && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {
                (language === "ar" ? "ملاحظات الدفع" : "Payment Notes")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words">
              {order.hint_note}
            </p>
          </motion.div>
        )}
        {/* Order Notes */}
        {order.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t("orders.orderNotes") ||
                (language === "ar" ? "ملاحظات الطلب" : "Order Notes")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 break-words">
              {order.notes}
            </p>
          </motion.div>
        )}
      </div>
       {isRejectModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl p-4 sm:p-6">
                  <h2
                    className={`text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "رفض الطلب" : "cancel Order"}
                  </h2>
                  <label
                    className={`block text-gray-600 dark:text-gray-300 mb-2 ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "سبب الغاء:" : "Reason for Cancel:"}
                  </label>
                  <textarea
                    className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={
                      language === "ar"
                        ? "اكتب سبب الالغاء..."
                        : "Write the cancel reason..."
                    }
                    dir={language === "ar" ? "rtl" : "ltr"}
                  />
                  <div
                    className={`flex justify-end gap-3 mt-4 ${
                      language === "ar" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <button
                      className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-500 dark:hover:bg-gray-500 transition-colors text-sm"
                      onClick={() => {
                        setIsRejectModalOpen(false);
                        setRejectReason("");
                      }}
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm"
                      onClick={async () => {
                        if (!rejectReason.trim()) {
                          alert(
                            language === "ar"
                              ? "الرجاء إدخال سبب الغاء"
                              : "Please enter a cancel reason"
                          );
                          return;
                        }
                        try {
                          await handleCancelOrder(rejectReason)
                          
                          setIsRejectModalOpen(false);
                          setRejectReason("");
                          
                        } catch (error) {
                          console.error(error);
                          alert(
                            language === "ar"
                              ? "فشل في الغاء الطلب"
                              : "Failed to cancel order"
                          );
                        }
                      }}
                    >
                      {language === "ar" ? "تأكيد الغاء" : "Confirm Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default OrderDetail;
