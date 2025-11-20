import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { fetchorders, updateorders } = useAuth();
  const { t, language } = useLanguage();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.order_status === "pending").length;
    const confirmed = orders.filter(
      (o) => o.order_status === "confirmed" || o.order_status === "processing"
    ).length;
    const shipped = orders.filter((o) => o.order_status === "shipped").length;
    const delivered = orders.filter(
      (o) => o.order_status === "delivered"
    ).length;
    const cancelled = orders.filter(
      (o) => o.order_status === "cancelled"
    ).length;
    const totalRevenue = orders
      .filter((o) => o.order_status !== "cancelled")
      .reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);

    return {
      total,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      totalRevenue: totalRevenue.toFixed(2),
    };
  }, [orders]);

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-300",
        icon: ClockIcon,
      },
      confirmed: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-300",
        icon: CheckCircleIcon,
      },
      processing: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-300",
        icon: CheckCircleIcon,
      },
      shipped: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-300",
        icon: TruckIcon,
      },
      delivered: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-300",
        icon: CheckCircleIcon,
      },
      cancelled: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-300",
        icon: XCircleIcon,
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const fetchOrders = async (searchTerm = search, statusFilter = status) => {
    setLoading(true);
    try {
      console.log("Fetching orders with:", { searchTerm, statusFilter });
      const [cRes] = await Promise.allSettled([
        fetchorders(searchTerm || "", statusFilter || ""),
      ]);

      if (cRes.status === "fulfilled") {
        const cdata = cRes.value.results ?? cRes.value.data ?? cRes.value;
        console.log("Orders data received:", cdata);
        if (Array.isArray(cdata)) {
          setOrders(cdata);
          if (cdata.length === 0 && (searchTerm || statusFilter)) {
            toast.info(
              language === "ar" ? "لا توجد نتائج للبحث" : "No results found"
            );
          }
        } else {
          setOrders([]);
        }
      } else {
        console.error("Failed to fetch orders:", cRes.reason);
        toast.error(
          language === "ar" ? "فشل في جلب الطلبات" : "Failed to fetch orders"
        );
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء جلب الطلبات"
          : "An error occurred while fetching orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    setIsInitialLoad(false);
  }, []);

  // Debounce search - works for both search and status (skip initial load)
  useEffect(() => {
    if (isInitialLoad) return;

    const timer = setTimeout(() => {
      fetchOrders(search, status);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, status]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.order_status);
    setEditingOrder({ ...order });
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOrderStatus("");
    setEditingOrder(null);
  };

  const handleEditField = (field, value) => {
    if (!editingOrder) return;
    setEditingOrder({
      ...editingOrder,
      [field]: value,
    });
  };

  const handleSaveOrder = async () => {
    if (!editingOrder || !selectedOrder) return;

    setUpdating(true);
    try {
      // Update status if changed
      if (editingOrder.order_status !== selectedOrder.order_status) {
        await updateorders(
          selectedOrder.order_number,
          editingOrder.order_status
        );
      }

      // Here you can add more update logic for other fields
      // For now, we'll just update the status and refresh

      await fetchOrders(search, status);

      toast.success(
        language === "ar"
          ? "تم حفظ التعديلات بنجاح"
          : "Changes saved successfully"
      );

      setSelectedOrder(editingOrder);
    } catch (error) {
      console.error(error);
      toast.error(
        language === "ar" ? "فشل في حفظ التعديلات" : "Failed to save changes"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !orderStatus) {
      toast.error(
        language === "ar"
          ? "يرجى اختيار حالة للطلب"
          : "Please select an order status"
      );
      return;
    }

    if (selectedOrder.order_status === orderStatus) {
      toast.info(
        language === "ar"
          ? "الحالة الحالية هي نفس الحالة المحددة"
          : "Current status is the same as selected"
      );
      return;
    }

    const confirmMessage =
      language === "ar"
        ? `هل أنت متأكد من تغيير حالة الطلب #${selectedOrder.order_number} إلى "${orderStatus}"؟`
        : `Are you sure you want to change order #${selectedOrder.order_number} status to "${orderStatus}"?`;

    if (!window.confirm(confirmMessage)) return;

    setUpdating(true);
    try {
      const num = selectedOrder.order_number;
      await updateorders(num, orderStatus);

      // Update local state immediately for better UX
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_number === num
            ? { ...order, order_status: orderStatus }
            : order
        )
      );

      // Update selected order
      setSelectedOrder({ ...selectedOrder, order_status: orderStatus });

      toast.success(
        language === "ar"
          ? "تم تحديث حالة الطلب بنجاح"
          : "Order status updated successfully"
      );
    } catch (error) {
      console.error(error);
      toast.error(
        language === "ar"
          ? "فشل في تحديث حالة الطلب"
          : "Failed to update order status"
      );
      // Refresh orders on error
      await fetchOrders();
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    const confirmMessage =
      language === "ar"
        ? "هل أنت متأكد من إلغاء هذا الطلب؟"
        : "Are you sure you want to cancel this order?";

    if (!window.confirm(confirmMessage)) return;

    setUpdating(true);
    try {
      await useApi(`/api/orders/${selectedOrder.order_number}/cancel/`);
      await fetchOrders();
      toast.success(
        language === "ar"
          ? "تم إلغاء الطلب بنجاح"
          : "Order cancelled successfully"
      );
      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      toast.error(
        language === "ar" ? "فشل في إلغاء الطلب" : "Failed to cancel order"
      );
    } finally {
      setUpdating(false);
    }
  };

  const statsCards = [
    {
      name: language === "ar" ? "إجمالي الطلبات" : "Total Orders",
      value: stats.total,
      icon: ShoppingBagIcon,
      color: "blue",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      name: language === "ar" ? "قيد الانتظار" : "Pending",
      value: stats.pending,
      icon: ClockIcon,
      color: "yellow",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      name: language === "ar" ? "تم التسليم" : "Delivered",
      value: stats.delivered,
      icon: CheckCircleIcon,
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      name: language === "ar" ? "إجمالي الإيرادات" : "Total Revenue",
      value: `${stats.totalRevenue} EGP`,
      icon: CurrencyDollarIcon,
      color: "purple",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("pageTitle") ||
              (language === "ar" ? "إدارة الطلبات" : "Orders Management")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {language === "ar"
              ? "إدارة ومتابعة جميع الطلبات"
              : "Manage and track all orders"}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <ArrowPathIcon
            className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
          />
          <span>
            {loading
              ? t("loading") || "Loading..."
              : t("refreshBtn") || "Refresh"}
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="ml-4 rtl:ml-0 rtl:mr-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                t("searchPlaceholder") ||
                (language === "ar"
                  ? "ابحث برقم الطلب أو اسم العميل..."
                  : "Search by order number or customer name...")
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchOrders(search, status);
                }
              }}
            />
          </div>
          <select
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">
              {t("filterAll") ||
                (language === "ar" ? "جميع الحالات" : "All Status")}
            </option>
            <option value="pending">{t("filterPending") || "Pending"}</option>
            <option value="confirmed">
              {t("filterConfirmed") || "Confirmed"}
            </option>
            <option value="processing">
              {t("filterPending") || "Processing"}
            </option>
            <option value="shipped">{t("filterShipped") || "Shipped"}</option>
            <option value="delivered">
              {t("filterDelivered") || "Delivered"}
            </option>
            <option value="cancelled">
              {t("filterCancelled") || "Cancelled"}
            </option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => fetchOrders(search, status)}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span className="hidden sm:inline">
                {language === "ar" ? "بحث" : "Search"}
              </span>
            </button>
            {(search || status) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  fetchOrders("", "");
                }}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title={language === "ar" ? "مسح الفلاتر" : "Clear Filters"}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("orderNumber") ||
                    (language === "ar" ? "رقم الطلب" : "Order #")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("customer") || (language === "ar" ? "العميل" : "Customer")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("total") || (language === "ar" ? "المجموع" : "Total")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("status") || (language === "ar" ? "الحالة" : "Status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("createdAt") ||
                    (language === "ar" ? "تاريخ الإنشاء" : "Created At")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("actions") ||
                    (language === "ar" ? "الإجراءات" : "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ArrowPathIcon className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {t("loading") ||
                          (language === "ar"
                            ? "جاري التحميل..."
                            : "Loading...")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {language === "ar" ? "لا توجد طلبات" : "No orders found"}
                    </p>
                    {(search || status) && (
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        {language === "ar"
                          ? "جرب البحث بمعايير مختلفة"
                          : "Try searching with different criteria"}
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => {
                  const statusBadge = getStatusBadge(order.order_status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <motion.tr
                      key={order.order_number}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                      onClick={() => handleSelectOrder(order)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.order_number}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2 rtl:mr-0 rtl:ml-2" />
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.user_name || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {order.total_price} EGP
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOrder(order);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text} hover:opacity-80 transition-opacity cursor-pointer`}
                          title={
                            language === "ar"
                              ? "انقر لتغيير الحالة"
                              : "Click to change status"
                          }
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {order.order_status}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <CalendarIcon className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                          {new Date(order.created_at).toLocaleDateString(
                            language === "ar" ? "ar-EG" : "en-GB"
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrder(order);
                            }}
                            title={
                              language === "ar"
                                ? "عرض التفاصيل"
                                : "View details"
                            }
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {t("view") ||
                                (language === "ar" ? "عرض" : "View")}
                            </span>
                          </button>
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOrder(order);
                            }}
                            title={
                              language === "ar" ? "تعديل الطلب" : "Edit order"
                            }
                          >
                            <span className="text-xs">✎</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
            onClick={handleCloseDetails}
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-opacity-50"
                onClick={(e) => {
                  // Only close if clicking directly on backdrop, not on modal content
                  if (e.target === e.currentTarget) {
                    handleCloseDetails();
                  }
                }}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("orderDetails") ||
                      (language === "ar" ? "تفاصيل الطلب" : "Order Details")}
                  </h3>
                  <button
                    onClick={handleCloseDetails}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div
                  className="px-6 py-4 max-h-[70vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Information */}
                    <div
                      className="space-y-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          {language === "ar"
                            ? "معلومات الطلب"
                            : "Order Information"}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t("orderNumber") ||
                                (language === "ar" ? "رقم الطلب" : "Order #")}
                              :
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              #{selectedOrder.order_number}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t("total") ||
                                (language === "ar" ? "المجموع" : "Total")}
                              :
                            </span>
                            <input
                              type="number"
                              value={
                                editingOrder?.total_price ||
                                selectedOrder.total_price
                              }
                              onChange={(e) =>
                                handleEditField("total_price", e.target.value)
                              }
                              className="text-sm font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none w-24 text-right"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              EGP
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t("createdAt") ||
                                (language === "ar"
                                  ? "تاريخ الإنشاء"
                                  : "Created At")}
                              :
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {new Date(
                                selectedOrder.created_at
                              ).toLocaleDateString(
                                language === "ar" ? "ar-EG" : "en-GB"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          {language === "ar"
                            ? "معلومات العميل"
                            : "Customer Information"}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {t("customer") ||
                                (language === "ar" ? "العميل" : "Customer")}
                              :
                            </label>
                            <input
                              type="text"
                              value={
                                editingOrder?.user_name ||
                                selectedOrder.user_name ||
                                ""
                              }
                              onChange={(e) =>
                                handleEditField("user_name", e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-start gap-1">
                              <MapPinIcon className="w-4 h-4 mt-0.5" />
                              {t("shippingAddress") ||
                                (language === "ar"
                                  ? "عنوان الشحن"
                                  : "Shipping Address")}
                              :
                            </label>
                            <textarea
                              value={
                                editingOrder?.shipping_address ||
                                selectedOrder.shipping_address ||
                                ""
                              }
                              onChange={(e) =>
                                handleEditField(
                                  "shipping_address",
                                  e.target.value
                                )
                              }
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Management */}
                    <div
                      className="space-y-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          {t("manageStatus") ||
                            (language === "ar"
                              ? "إدارة الحالة"
                              : "Manage Status")}
                        </h4>
                        <div className="space-y-4">
                          <label className="block">
                            <span className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t("changeStatus") ||
                                (language === "ar"
                                  ? "تغيير الحالة"
                                  : "Change Status")}
                            </span>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={editingOrder?.order_status || orderStatus}
                              onChange={(e) => {
                                setOrderStatus(e.target.value);
                                handleEditField("order_status", e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="pending">
                                {t("filterPending") || "Pending"}
                              </option>
                              <option value="processing">
                                {t("filterPending") || "Processing"}
                              </option>
                              <option value="confirmed">
                                {t("filterConfirmed") || "Confirmed"}
                              </option>
                              <option value="shipped">
                                {t("filterShipped") || "Shipped"}
                              </option>
                              <option value="delivered">
                                {t("filterDelivered") || "Delivered"}
                              </option>
                              <option value="cancelled">
                                {t("filterCancelled") || "Cancelled"}
                              </option>
                            </select>
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveOrder();
                              }}
                              disabled={updating}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating ? (
                                <>
                                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                  <span>
                                    {language === "ar"
                                      ? "جاري الحفظ..."
                                      : "Saving..."}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="w-4 h-4" />
                                  <span>
                                    {language === "ar"
                                      ? "حفظ التعديلات"
                                      : "Save Changes"}
                                  </span>
                                </>
                              )}
                            </button>
                            {selectedOrder.order_status !== "cancelled" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelOrder();
                                }}
                                disabled={updating}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {t("cancelOrderBtn") ||
                                  (language === "ar"
                                    ? "إلغاء الطلب"
                                    : "Cancel Order")}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      {selectedOrder.payment_status && (
                        <div
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <CreditCardIcon className="w-4 h-4" />
                            {t("paymentMethod") ||
                              (language === "ar"
                                ? "معلومات الدفع"
                                : "Payment Information")}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {t("paymentMethod") ||
                                  (language === "ar"
                                    ? "طريقة الدفع"
                                    : "Payment Method")}
                                :
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedOrder.payment_status}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
