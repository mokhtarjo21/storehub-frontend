import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { Order } from "../../types";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import ar from "date-fns/locale/ar";
import enGB from "date-fns/locale/en-GB";
import OrderLogs from "./OrderLogs"
registerLocale("ar", ar);
registerLocale("en-GB", enGB);

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
} from "@heroicons/react/24/outline";
import { Calendar, ChevronDownIcon } from "lucide-react";
function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { fetchorders, updateorders, fechorder } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalOrders, setTotalOrders] = useState(0);
  const { t, language } = useLanguage();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const locale = useMemo(
    () => (language === "ar" ? "ar-EG" : "en-GB"),
    [language]
  );
  const [activeTab, setActiveTab] = useState("overview");

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };
  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status ? order.order_status === status : true;
      if (!matchesStatus) return false;

      if (!term) return true;
      const orderNumber = String(order.order_number || "").toLowerCase();
      const userName = String(order.user_name || "").toLowerCase();
      const phone = String(order.phone || "").toLowerCase();
      const shippingPhone = String(order.shipping_phone || "").toLowerCase();
      const shippingName = String(order.shipping_name || "").toLowerCase();

      return (
        orderNumber.includes(term) ||
        userName.includes(term) ||
        phone.includes(term) ||
        shippingPhone.includes(term) ||
        shippingName.includes(term)
      );
    });
  }, [orders, search, status]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter(
      (o) => o.order_status === "pending"
    ).length;
    const confirmed = filteredOrders.filter(
      (o) => o.order_status === "confirmed"
    ).length;
    const processing = filteredOrders.filter(
      (o) => o.order_status === "processing"
    ).length;
    const shipped = filteredOrders.filter(
      (o) => o.order_status === "shipped"
    ).length;
    const delivered = filteredOrders.filter(
      (o) => o.order_status === "delivered"
    ).length;
    const cancelled = filteredOrders.filter(
      (o) => o.order_status === "cancelled"
    ).length;
    const totalRevenue = filteredOrders
      .filter((o) => o.order_status !== "cancelled")
      .reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);

    return {
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue: totalRevenue.toFixed(2),
    };
  }, [filteredOrders]);

  const getStatusBadge = (status: string) => {
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
  const fetchOrders = async (
    searchTerm = search,
    statusFilter = status,
    page = currentPage,
    stardate = startDate,
    enddate = endDate
  ) => {
    setLoading(true);
    try {
      const [cRes] = await Promise.allSettled([
        fetchorders(searchTerm, statusFilter, page, stardate, enddate),
      ]);

      if (cRes.status === "fulfilled") {
        const cdata = cRes.value;

        setOrders(cdata.results);

        setTotalOrders(cdata.count || 0);
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

  useEffect(() => {
    if (isInitialLoad) return;
    fetchOrders(search, status, currentPage);
  }, [search, status, endDate]);

  const handleSelectOrder = async (order_number: string | number) => {
    try {
      const [orderDats] = await Promise.allSettled([fechorder(order_number)]);

      if (orderDats.status === "fulfilled" && orderDats.value) {
        const orderDatsData = orderDats.value;

        setSelectedOrder(orderDatsData);
        setOrderStatus(orderDatsData.order_status);
        setEditingOrder({
          shipping_name: orderDatsData.shipping_name || "",
          shipping_address: orderDatsData.full_shipping_address || "",
          total_price: orderDatsData.total_price || 0,
          order_status: orderDatsData.order_status || "pending",
          payment_status: orderDatsData.payment_status || "",
          notes: orderDatsData.notes,
          vendor: orderDatsData.vendor || "",
          currency: orderDatsData.currency || "EGP",
          hint_note: orderDatsData.hint_note || "",
        });
      } else {
        toast.error(
          language === "ar"
            ? "فشل في جلب تفاصيل الطلب"
            : "Failed to fetch order details"
        );
      }
    } catch (error) {
      console.error("Error selecting order:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء جلب تفاصيل الطلب"
          : "An error occurred while fetching order details"
      );
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOrderStatus("");
    setEditingOrder(null);
  };

  const handleEditField = (field: string, value: any) => {
    if (!editingOrder) return;
    setEditingOrder({ ...editingOrder, [field]: value });
  };

  const handleSaveOrder = async () => {
    if (!editingOrder || !selectedOrder) return;

    setUpdating(true);

    try {
      const updates = {};

      // مقارنة القيم القديمة بالجديدة

      if (
        parseFloat(editingOrder.total_price) !==
        parseFloat(selectedOrder.total_price)
      ) {
        updates.total_price = editingOrder.total_price;
      }
      if (editingOrder.order_status !== selectedOrder.order_status) {
        updates.order_status = editingOrder.order_status;
      }
      if (editingOrder.payment_status !== selectedOrder.payment_status) {
        updates.payment_status = editingOrder.payment_status;
      }
      if (editingOrder.notes !== selectedOrder.notes) {
        updates.notes = editingOrder.notes;
      }
      if (editingOrder.currency !== selectedOrder.currency) {
        updates.currency = editingOrder.currency;
      }
      if (editingOrder.hint_note !== selectedOrder.hint_note) {
        updates.hint_note = editingOrder.hint_note;
      }
      if (editingOrder.vendor !== selectedOrder.vendor) {
        updates.vendor = editingOrder.vendor;
      }
      // إذا في تغييرات
      if (Object.keys(updates).length > 0) {
        try {
          const [updateResult] = await Promise.allSettled([
            updateorders(selectedOrder.order_number, updates),
          ]);

          // دائماً نحاول إعادة جلب البيانات من السيرفر للتأكد
          let refreshSuccess = false;

          const [orderDats] = await Promise.allSettled([
            fechorder(selectedOrder.order_number),
          ]);

          if (orderDats.status === "fulfilled" && orderDats.value) {
            const updatedOrderData = orderDats.value;

            // تحديث selectedOrder بالبيانات الجديدة من السيرفر
            setSelectedOrder(updatedOrderData);

            // تحديث orderStatus
            setOrderStatus(updatedOrderData.order_status);

            // تحديث editingOrder أيضاً
            setEditingOrder({
              shipping_name: updatedOrderData.shipping_name || "",
              shipping_address: updatedOrderData.full_shipping_address || "",
              total_price: updatedOrderData.total_price || 0,
              order_status: updatedOrderData.order_status || "pending",
              payment_status: updatedOrderData.payment_status || "",
              notes: updatedOrderData.notes,
              vendor: updatedOrderData.vendor || "",
              currency: updatedOrderData.currency || "EGP",
              hint_note: updatedOrderData.hint_note || "",
            });
            // إذا نجح التحديث أو إعادة الجلب، نعرض رسالة نجاح ونغلق الـ modal
            if (updateResult.status === "fulfilled") {
              toast.success(
                language === "ar"
                  ? "تم تعديل الطلب بنجاح"
                  : "Order Updated successfully"
              );
              //   // إغلاق الـ modal بعد الحفظ بنجاح
              setTimeout(() => {
                handleCloseDetails();
              }, 500);
            } else {
              // فشل كلاهما - نحدث يدوياً على الأقل

              setEditingOrder((prev) =>
                prev ? { ...prev, ...updates } : null
              );

              setOrders((prev) =>
                prev.map((o) =>
                  o.order_number === selectedOrder.order_number
                    ? { ...o, ...updates }
                    : o
                )
              );
            }
            // تحديث قائمة الطلبات بالبيانات الجديدة
            setOrders((prev) =>
              prev.map((o) =>
                o.order_number === selectedOrder.order_number
                  ? { ...o, ...updatedOrderData }
                  : o
              )
            );

            refreshSuccess = true;
          }
        } catch (refreshError) {
          toast.error("Error refreshing order data:", refreshError);
        }
      } else {
        toast(
          language === "ar" ? "لا توجد تغييرات للحفظ" : "No changes to save",
          { icon: "ℹ️" }
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        language === "ar" ? "فشل في حفظ التعديلات" : "Failed to save changes"
      );
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
      // استخدام updateorders لتغيير الحالة إلى cancelled
      const [cancelResult] = await Promise.allSettled([
        updateorders(selectedOrder.order_number, { order_status: "cancelled" }),
      ]);

      // إعادة جلب بيانات الطلب للتأكد من الإلغاء
      let cancelSuccess = false;
      try {
        const [orderDats] = await Promise.allSettled([
          fechorder(selectedOrder.order_number),
        ]);

        if (orderDats.status === "fulfilled" && orderDats.value) {
          const updatedOrderData = orderDats.value;

          // التحقق من أن الطلب تم إلغاؤه
          if (updatedOrderData.order_status === "cancelled") {
            cancelSuccess = true;

            // تحديث selectedOrder
            setSelectedOrder(updatedOrderData);

            // تحديث orderStatus
            setOrderStatus("cancelled");

            // تحديث editingOrder
            setEditingOrder((prev) =>
              prev ? { ...prev, order_status: "cancelled" } : null
            );

            // تحديث قائمة الطلبات
            setOrders((prev) =>
              prev.map((o) =>
                o.order_number === selectedOrder.order_number
                  ? { ...o, order_status: "cancelled" }
                  : o
              )
            );
          }
        }
      } catch (refreshError) {
        console.error("Error refreshing order data:", refreshError);
      }

      // إذا نجح الإلغاء أو التحديث في السيرفر
      if (cancelResult.status === "fulfilled" || cancelSuccess) {
        // تحديث قائمة الطلبات
        await fetchOrders();

        toast.success(
          language === "ar"
            ? "تم إلغاء الطلب بنجاح"
            : "Order cancelled successfully"
        );

        // إغلاق الـ modal
        setTimeout(() => {
          handleCloseDetails();
        }, 500);
      } else {
        // فشل الإلغاء - نحدث يدوياً على الأقل
        setSelectedOrder((prev) => ({
          ...prev,
          order_status: "cancelled",
        }));

        setOrderStatus("cancelled");

        setEditingOrder((prev) =>
          prev ? { ...prev, order_status: "cancelled" } : null
        );

        setOrders((prev) =>
          prev.map((o) =>
            o.order_number === selectedOrder.order_number
              ? { ...o, order_status: "cancelled" }
              : o
          )
        );

        // حتى لو فشل الـ API، قد يكون التحديث نجح
        await fetchOrders();

        toast.success(
          language === "ar"
            ? "تم إلغاء الطلب (تم التحديث محلياً)"
            : "Order cancelled (updated locally)"
        );

        setTimeout(() => {
          handleCloseDetails();
        }, 500);
      }
    } catch (error) {
      console.error("Cancel order error:", error);

      // حتى في حالة الخطأ، نحاول تحديث محلي
      setSelectedOrder((prev) => ({
        ...prev,
        order_status: "cancelled",
      }));

      setOrderStatus("cancelled");

      setEditingOrder((prev) =>
        prev ? { ...prev, order_status: "cancelled" } : null
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.order_number === selectedOrder.order_number
            ? { ...o, order_status: "cancelled" }
            : o
        )
      );

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
      name: language === "ar" ? "تم التاكيد" : "Confirmed",
      value: stats.confirmed,
      icon: CheckCircleIcon,
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      name: language === "ar" ? "قيد التجهيز" : "Processing",
      value: stats.processing,
      icon: CheckCircleIcon,
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      name: language === "ar" ? "تم التجهيز" : "shipped",
      value: stats.shipped,
      icon: CheckCircleIcon,
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
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
      name: language === "ar" ? "تم الغاء" : "Cancelled",
      value: stats.cancelled,
      icon: CheckCircleIcon,
      color: "red",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      name: language === "ar" ? "إجمالي الإيرادات" : "Total Revenue",
      value: `${stats.totalRevenue} `,
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
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
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
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 md:p-6"
      >
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search Input - Full width on mobile, 1/3 on lg+ */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder={
                  t("searchPlaceholder") ||
                  (language === "ar"
                    ? "ابحث برقم الطلب أو اسم العميل..."
                    : "Search by order number or customer name...")
                }
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl 
                     bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white 
                     placeholder-gray-500 dark:placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200
                     text-sm md:text-base"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 
                       text-gray-400 hover:text-red-500 dark:text-gray-400 
                       dark:hover:text-red-400 p-1 rounded-lg 
                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title={language === "ar" ? "مسح البحث" : "Clear search"}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === "pending"
                      ? "bg-yellow-500"
                      : status === "confirmed"
                      ? "bg-blue-500"
                      : status === "processing"
                      ? "bg-indigo-500"
                      : status === "shipped"
                      ? "bg-purple-500"
                      : status === "delivered"
                      ? "bg-green-500"
                      : status === "cancelled"
                      ? "bg-red-500"
                      : "bg-gray-300"
                  }`}
                />
              </div>
              <select
                className="w-full pl-12 pr-10 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl 
                     bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200
                     appearance-none cursor-pointer text-sm md:text-base"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">
                  {t("filterAll") ||
                    (language === "ar" ? "جميع الحالات" : "All Status")}
                </option>
                <option value="pending">
                  {t("filterPending") || "Pending"}
                </option>
                <option value="confirmed">
                  {t("filterConfirmed") || "Confirmed"}
                </option>
                <option value="processing">
                  {t("filterProcessing") || "Processing"}
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
              <ChevronDownIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="lg:col-span-1">
            <div className="relative group">
              {/* Calendar Icon */}
              <div
                className={`absolute top-1/2 transform -translate-y-1/2 ${
                  language === "ar" ? "right-4" : "left-4"
                } pointer-events-none z-10`}
              >
                <Calendar className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>

              {/* DatePicker */}
              <DatePicker
                locale={language === "ar" ? "ar" : "en-GB"}
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                dateFormat="MMM dd, yyyy"
                placeholderText={
                  language === "ar"
                    ? "اختر الفترة الزمنية..."
                    : "Select date range..."
                }
                className={`w-full ${
                  language === "ar" ? "pr-12 pl-10" : "pl-12 pr-10"
                } py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl 
             bg-white dark:bg-gray-700/60 text-gray-900 dark:text-white 
             placeholder-gray-500 dark:placeholder-gray-400 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
             hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200
             cursor-pointer text-sm md:text-base`}
                calendarClassName="border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-2"
                popperClassName="z-50"
                popperPlacement="bottom-start"
              />

              {/* Clear Button */}
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    language === "ar" ? "left-4" : "right-4"
                  } text-gray-400 hover:text-red-500 dark:text-gray-400 
             dark:hover:text-red-400 cursor-pointer transition-all duration-200 
             p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 z-20`}
                  title={language === "ar" ? "مسح التاريخ" : "Clear Dates"}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Selected Filters Badges (Desktop Only) */}
        {(search || status || startDate || endDate) && (
          <div className="hidden lg:flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {language === "ar" ? "التصفيات المطبقة:" : "Active Filters:"}
            </span>

            {search && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span className="truncate max-w-[200px]">{search}</span>
                <button
                  onClick={() => setSearch("")}
                  className="ml-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/40"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {status && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                <span className="capitalize">{status}</span>
                <button
                  onClick={() => setStatus("")}
                  className="text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-200 p-0.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800/40"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {startDate && endDate && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>
                  {startDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {endDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-200 p-0.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800/40"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
        {/* Clear All - One button for mobile and desktop */}
        {(search || status || startDate || endDate) && (
          <div className="flex justify-end mt-6 border-t pt-4 border-gray-100 dark:border-gray-700">
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setStartDate(null);
                setEndDate(null);
              }}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 
                 dark:hover:text-red-300 font-medium flex items-center gap-2 
                 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              {language === "ar" ? "مسح الكل" : "Clear All"}
            </button>
          </div>
        )}
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    className={`px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {t("orderNumber") ||
                      (language === "ar" ? "رقم الطلب" : "Order #")}
                  </th>
                  <th
                    className={`px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {t("customer") ||
                      (language === "ar" ? "العميل" : "Customer")}
                  </th>
                  <th
                    className={`px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {t("phone") || (language === "ar" ? "رقم الهاتف" : "Phone")}
                  </th>
                  <th
                    className={`px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {t("total") || (language === "ar" ? "المجموع" : "Total")}
                  </th>
                  <th
                    className={`px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {t("status") || (language === "ar" ? "الحالة" : "Status")}
                  </th>
                  <th
                    className={`px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    { (language === "ar" ? "الحالة الدفع" : "Payment Status")}
                  </th>
                  <th
                    className={`px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {t("createdAt") ||
                      (language === "ar" ? "تاريخ الإنشاء" : "Created At")}
                  </th>
                  <th
                    className={`px-3 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {t("actions") ||
                      (language === "ar" ? "الإجراءات" : "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading && filteredOrders.length === 0 ? (
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
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {language === "ar"
                          ? "لا توجد طلبات"
                          : "No orders found"}
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
                  filteredOrders.map((order, index) => {
                    const statusBadge = getStatusBadge(order.order_status);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <motion.tr
                        key={order.order_number}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                        onClick={() => handleSelectOrder(order.order_number)}
                      >
                        <td
                          className={`px-3 py-4 whitespace-nowrap ${
                            language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{order.order_number}
                          </div>
                        </td>
                        <td
                          className={`px-3 py-4 whitespace-nowrap ${
                            language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`flex items-center ${
                              language === "ar"
                                ? "flex-row-reverse"
                                : "flex-row"
                            }`}
                          >
                            <UserIcon
                              className={`w-4 h-4 text-gray-400 flex-shrink-0 ${
                                language === "ar" ? "ml-2" : "mr-2"
                              }`}
                            />
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.user_name || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td
                          className={`px-3 py-4 whitespace-nowrap ${
                            language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`flex items-center ${
                              language === "ar"
                                ? "flex-row-reverse"
                                : "flex-row"
                            }`}
                          >
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.phone || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td
                          className={`px-3 py-4 whitespace-nowrap ${
                            language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {order.total_price} {order.currency || "EGP"}
                          </div>
                        </td>
                        <td
                          className={`px-3 py-4 whitespace-nowrap ${
                            language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          <button
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              statusBadge.bg
                            } ${
                              statusBadge.text
                            } hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap ${
                              language === "ar"
                                ? "flex-row-reverse"
                                : "flex-row"
                            }`}
                            title={
                              language === "ar"
                                ? "انقر لتغيير الحالة"
                                : "Click to change status"
                            }
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{t(`${order.order_status}`)}</span>
                          </button>
                        </td>
                         <td
                          className={`px-3 py-4 whitespace-nowrap ${
                            language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          <button
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              statusBadge.bg
                            } ${
                              statusBadge.text
                            } hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap ${
                              language === "ar"
                                ? "flex-row-reverse"
                                : "flex-row"
                            }`}
                            title={
                              language === "ar"
                                ? "انقر لتغيير الحالة"
                                : "Click to change status"
                            }
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{t(`${order.payment_status}`)}</span>
                          </button>
                        </td>
                        <td
                          className={`px-3 py-4 whitespace-nowrap ${
                            language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`flex items-center text-sm text-gray-500 dark:text-gray-400 ${
                              language === "ar"
                                ? "flex-row-reverse"
                                : "flex-row"
                            }`}
                          >
                            <CalendarIcon
                              className={`w-4 h-4 flex-shrink-0 ${
                                language === "ar" ? "ml-1" : "mr-1"
                              }`}
                            />
                            <span>
                              {new Date(order.created_at).toLocaleDateString(
                                language === "ar" ? "ar-EG" : "en-GB"
                              )}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-3 py-4 whitespace-nowrap ${
                            language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-2 ${
                              language === "ar"
                                ? "flex-row-reverse"
                                : "flex-row"
                            }`}
                          >
                            <button
                              className={`inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md transition-colors duration-200 whitespace-nowrap ${
                                language === "ar"
                                  ? "flex-row-reverse"
                                  : "flex-row"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectOrder(order.order_number);
                              }}
                              title={
                                language === "ar"
                                  ? "عرض التفاصيل"
                                  : "View details"
                              }
                            >
                              <EyeIcon className="w-4 h-4" />
                              <span className="text-sm">
                                {t("view") ||
                                  (language === "ar" ? "عرض" : "View")}
                              </span>
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
        </div>
      </motion.div>

      {/* pagination */}
      <div className="flex items-center gap-6 justify-center">
        <button
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
              fetchOrders(search, status, currentPage - 1, date);
            }
          }}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50"
        >
          {language === "ar" ? "السابق" : "Previous"}
        </button>

        {/* Page Info */}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {language === "ar"
            ? `الصفحة ${currentPage} من ${Math.ceil(totalOrders / pageSize)}`
            : `Page ${currentPage} of ${Math.ceil(totalOrders / pageSize)}`}
        </span>

        {/* Next Button */}
        <button
          onClick={() => {
            if (currentPage < Math.ceil(totalOrders / pageSize)) {
              setCurrentPage(currentPage + 1);
              fetchOrders(search, status, currentPage + 1, date);
            }
          }}
          disabled={currentPage === Math.ceil(totalOrders / pageSize)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50"
        >
          {language === "ar" ? "التالي" : "Next"}
        </button>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            key="order-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm py-6"
            onClick={handleCloseDetails}
          >
            <motion.div
              key="order-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-5xl mx-2 sm:mx-4 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {t("orderDetails") ||
                        (language === "ar" ? "تفاصيل الطلب" : "Order Details")}
                      <span className="text-indigo-600 dark:text-indigo-400 ml-1 sm:ml-2">
                        {selectedOrder.order_number}
                      </span>
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t(`${selectedOrder.order_status}`)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  {/* Created At - Hidden on mobile */}
                  <div className="hidden sm:block text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("createdAt") ||
                        (language === "ar" ? "تاريخ الإنشاء" : "Created At")}
                    </div>
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                      {selectedOrder.created_at
                        ? new Date(selectedOrder.created_at).toLocaleString(
                            locale
                          )
                        : "—"}
                    </div>
                  </div>

                  <button
                    onClick={handleCloseDetails}
                    aria-label={
                      t("close") || (language === "ar" ? "إغلاق" : "Close")
                    }
                    className="p-1 sm:p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  >
                    <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-col sm:gap-6 sm:px-6 p-4 sm:py-5 overflow-y-auto flex-1 min-h-0">
                {/* Left - Tabs & main content */}
                <div className="lg:col-span-2 w-full min-w-0">
                  <div
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-4 ${
                      language === "ar" ? "rtl" : "ltr"
                    }`}
                  >
                    <nav
                      className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700
               w-full sm:w-auto gap-1 sm:gap-2 flex-wrap"
                    >
                      <TabButton
                        active={activeTab === "overview"}
                        onClick={() => setActiveTab("overview")}
                        className="flex-1 sm:flex-none text-center"
                      >
                        {t("overview")}
                      </TabButton>

                      <TabButton
                        active={activeTab === "items"}
                        onClick={() => setActiveTab("items")}
                        className="flex-1 sm:flex-none text-center"
                      >
                        {t("orderItems")}
                      </TabButton>

                      <TabButton
                        active={activeTab === "timeline"}
                        onClick={() => setActiveTab("timeline")}
                        className="flex-1 sm:flex-none text-center"
                      >
                        {t("orderTimeline")}
                      </TabButton>
                      <TabButton
                        active={activeTab === "Logs"}
                        onClick={() => setActiveTab("Logs")}
                        className="flex-1 sm:flex-none text-center"
                      >
                        {language === "ar" ? "سجلات الطلب" : "Order Logs"}
                      </TabButton>
                    </nav>
                  </div>

                  {/* Content Panels */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4  shadow-sm border border-gray-200 dark:border-gray-700">
                    {activeTab === "overview" && (
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                        {/* Order Summary Card */}

                        <div className="xl:col-span-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                          <h5 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                            {t("orders.orderSummary")}
                          </h5>
                          <dl className="text-sm space-y-2 sm:space-y-3">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                              <dt>{t("orders.subtotal")}</dt>
                              <dd className="font-medium text-gray-900 dark:text-white">
                                {selectedOrder.subtotal ?? "0.00"}{" "}
                                {selectedOrder.currency || "EGP"}
                              </dd>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                              <dt>{t("orders.tax")}</dt>
                              <dd className="font-medium text-gray-900 dark:text-white">
                                {selectedOrder.tax_amount ?? "0.00"}{" "}
                                {selectedOrder.currency || "EGP"}
                              </dd>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                              <dt>{t("orders.shippingCost")}</dt>
                              <dd className="font-medium text-gray-900 dark:text-white">
                                {selectedOrder.shipping_amount ?? "0.00"}{" "}
                                {selectedOrder.currency || "EGP"}
                              </dd>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                              <dt>{t("orders.discount")}</dt>
                              <dd className="font-medium text-gray-900 dark:text-white">
                                {selectedOrder.discount_amount ?? "0.00"}{" "}
                                {selectedOrder.currency || "EGP"}
                              </dd>
                            </div>
                            <div className="flex justify-between pt-2 sm:pt-3 border-t border-gray-300 dark:border-gray-600 mt-2 sm:mt-3">
                              <dt className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                                {t("total")}
                              </dt>
                              <dd className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                                {selectedOrder.total_price}{" "}
                                {selectedOrder.currency || "EGP"}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        {/* Customer Card */}
                        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col 2xl:flex-row gap-4 sm:gap-5">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                                {t("customerInformation")}
                              </h5>

                              <div className="mt-3 space-y-3 sm:space-y-4">
                                {selectedOrder.company_name && (
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium w-full sm:w-48 flex-shrink-0">
                                      {t("auth.register.companyName")}
                                    </label>
                                    <div className="flex-1 text-sm sm:text-base text-gray-900 dark:text-gray-200 py-2">
                                      {selectedOrder.company_name}
                                    </div>
                                  </div>
                                )}

                                {/* Name */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                  <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium w-full sm:w-48 flex-shrink-0">
                                    {t("customerName")}
                                  </label>
                                  <div className="flex-1 text-sm sm:text-base text-gray-900 dark:text-gray-200 py-2">
                                    {selectedOrder.shipping_name || "—"}
                                  </div>
                                </div>

                                {/* Email */}
                                {selectedOrder.shipping_email && (
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium w-full sm:w-48 flex-shrink-0">
                                      {t("email")}
                                    </label>
                                    <div className="flex-1 text-sm sm:text-base text-gray-900 dark:text-gray-200 py-2">
                                      {selectedOrder.shipping_email}
                                    </div>
                                  </div>
                                )}

                                {/* Phone */}
                                {selectedOrder.shipping_phone && (
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium w-full sm:w-48 flex-shrink-0">
                                      {t("phone")}
                                    </label>
                                    <div className="flex-1 text-sm sm:text-base text-gray-900 dark:text-gray-200 py-2">
                                      {selectedOrder.shipping_phone}
                                    </div>
                                  </div>
                                )}

                                {/* Address */}
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                  <label className="block text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium w-full sm:w-48 flex-shrink-0 pt-2">
                                    {t("shippingAddress")}
                                  </label>
                                  <div className="flex-1 text-sm sm:text-base text-gray-900 dark:text-gray-200 whitespace-pre-line py-2">
                                    {selectedOrder.full_shipping_address || "—"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "items" && (
                      <div className="space-y-3 sm:space-y-4">
                        {Array.isArray(selectedOrder.items) &&
                        selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((it) => (
                            <div
                              key={it.id}
                              className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <img
                                src={
                                  it.item_image ||
                                  it.image ||
                                  "/placeholder.png"
                                }
                                alt={it.item_name}
                                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md object-fil flex-shrink-0 border border-gray-200 dark:border-gray-700 mx-auto sm:mx-0"
                              />
                              <div className="flex-1 min-w-0 w-full sm:w-auto">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 dark:text-white text-base sm:text-lg md:text-xl truncate">
                                      {language === "ar"
                                        ? it.item_name_ar
                                        : it.item_name}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 md:gap-1">
                                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                      {t("quantity")}:{" "}
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {it.quantity}
                                      </span>
                                    </div>
                                    <div className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                                      {it.item_role == "toform" &&
                                      it.total_price == 0
                                        ? t("pricing")
                                        : it.total_price}{" "}
                                      {selectedOrder.currency}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                  {language === "ar"
                                    ? "سعر الوحدة"
                                    : "Unit Price"}
                                  :{" "}
                                  {it.item_role == "toform" &&
                                  it.unit_price == 0
                                    ? t("pricing")
                                    : it.unit_price}{" "}
                                  {selectedOrder.currency}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center py-8 sm:py-12">
                            {t("noItems")}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "timeline" && (
                      <div className="space-y-4 sm:space-y-6">
                        {Array.isArray(selectedOrder.timeline) &&
                        selectedOrder.timeline.length > 0 ? (
                          <div className="space-y-4 sm:space-y-6">
                            {selectedOrder.timeline.map((step, idx) => (
                              <div
                                key={step.status}
                                className="flex items-start gap-3 sm:gap-4 md:gap-5"
                              >
                                <div className="flex flex-col items-center flex-shrink-0">
                                  <div
                                    className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex-shrink-0 ${
                                      step.completed
                                        ? "bg-indigo-600 dark:bg-indigo-500"
                                        : "bg-gray-300 dark:bg-gray-600"
                                    }`}
                                  />
                                  {idx < selectedOrder.timeline.length - 1 && (
                                    <div className="w-0.5 h-full min-h-[40px] sm:min-h-[50px] bg-gray-200 dark:bg-gray-700 mt-2"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 pb-4 sm:pb-6 md:pb-0">
                                  <div className="font-medium text-sm sm:text-base md:text-lg text-gray-900 dark:text-white">
                                    {t(`orders.timeline.${step.status}`)}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                                    {step.timestamp
                                      ? new Date(step.timestamp).toLocaleString(
                                          locale
                                        )
                                      : language === "ar"
                                      ? "لم يكتمل"
                                      : "Not completed"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center py-8 sm:py-12 w-full">
                            {language === "ar"
                              ? "لا يوجد جدول زمني"
                              : "No timeline available"}
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "Logs" && (
                      <OrderLogs orderId={selectedOrder.id} />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {language === "ar" ? "ملاحظات الطلب" : "Order Notes"}
                  </label>
                  <textarea
                    value={editingOrder?.notes ?? selectedOrder.notes}
                    onChange={(e) => handleEditField("notes", e.target.value)}
                    rows={3}
                    className="w-full mt-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
                    placeholder={
                      language === "ar" ? "اكتب ملاحظات..." : "Write notes..."
                    }
                  ></textarea>
                </div>
                {selectedOrder.items[0].item_role == "toform" && (
                  <>
                    <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col 2xl:flex-row gap-4 sm:gap-5">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                            {language === "ar"
                              ? "تفاصيل العرص السعري"
                              : "Quotation Details"}
                            : {selectedOrder.order_number}
                          </h5>

                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-1/2">
                              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                {language === "ar" ? "السعر" : "Price"}
                              </label>
                              <input
                                type="number"
                                value={
                                  editingOrder?.total_price ??
                                  selectedOrder.total_price
                                }
                                onChange={(e) =>
                                  handleEditField("total_price", e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-md"
                              />
                            </div>

                            <div className="w-1/2">
                              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                {language === "ar" ? "العملة" : "Currency"}
                              </label>
                              <select
                                value={
                                  editingOrder?.currency ??
                                  selectedOrder.currency
                                }
                                onChange={(e) =>
                                  handleEditField("currency", e.target.value)
                                }
                                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-300 ${
                                  language === "ar" ? "text-right" : "text-left"
                                }`}
                                dir={language === "ar" ? "rtl" : "ltr"}
                              >
                                <option value="EGP">
                                  {language === "ar" ? "جنية" : "EGP"}
                                </option>
                                <option value="USD">
                                  {language === "ar" ? "دولار" : "USD"}
                                </option>
                              </select>
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                              {language === "ar" ? "البائع" : "Vendor"}
                            </label>
                            <input
                              type="text"
                              value={
                                editingOrder?.vendor ?? selectedOrder.vendor
                              }
                              onChange={(e) =>
                                handleEditField("vendor", e.target.value)
                              }
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-md"
                            />
                          </div>
                          <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {language === "ar" ? "ملاحظات الدفع" : "Payment Notes"}
                  </label>
                  <textarea
                    value={editingOrder?.hint_note ?? selectedOrder.hint_note}
                    onChange={(e) =>
                      handleEditField("hint_note", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-md"
                    placeholder={
                      language === "ar"
                        ? "ملاحظات الدفع..."
                        : "Payment notes ..."
                    }
                  >

                  </textarea>
                </div>

                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Right - Actions column */}
                <aside className="w-full lg:col-span-2">
                  <div className="sticky top-4">
                    {/* تغيير من space-y-3 إلى grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {/* Order Status Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start justify-between gap-3 sm:gap-4 mb-4">
                          <div className="flex-1 sm:flex-none">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {language === "ar"
                                ? "الحالة الحالية"
                                : "Current Status"}
                            </div>
                            <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mt-1">
                              {t(`${selectedOrder.order_status}`)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <select
                            value={
                              editingOrder?.order_status ??
                              selectedOrder.order_status
                            }
                            onChange={(e) =>
                              handleEditField("order_status", e.target.value)
                            }
                            disabled={!selectedOrder.can_be_edited}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="pending">{t(`pending`)}</option>
                            <option value="processing">
                              {t("processing")}
                            </option>
                            <option value="confirmed">{t("confirmed")}</option>
                            <option value="preparing">{t("preparing")}</option>
                            <option value="shipped">{t("shipped")}</option>
                            <option value="delivered">{t("delivered")}</option>
                          </select>

                          {selectedOrder.can_be_cancelled ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOrder();
                              }}
                              disabled={updating}
                              className="w-full px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {language === "ar"
                                ? "إلغاء الطلب"
                                : "Cancel Order"}
                            </button>
                          ) : (
                            <div className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-center text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                              {language === "ar"
                                ? "لا يمكن إلغاء هذا الطلب"
                                : "Cannot cancel this order"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Transactions Card */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-3">
                          {language === "ar"
                            ? "معلومات الدفع"
                            : "Payment Information"}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white break-words">
                            {t(`checkout.${selectedOrder.payment_method}`)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {language === "ar"
                              ? "حالة الدفع"
                              : "Payment Status"}
                            :{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              {t(`${selectedOrder.order_status}`)}
                            </span>
                          </div>
                        </div>

                        {/* Payment Status Control */}
                        <div className="mt-4">
                          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">
                            {language === "ar"
                              ? "تحديث حالة الدفع"
                              : "Update Payment Status"}
                          </label>

                          <select
                            value={
                              editingOrder?.payment_status ??
                              selectedOrder.payment_status
                            }
                            onChange={(e) =>
                              handleEditField("payment_status", e.target.value)
                            }
                            disabled={!selectedOrder.can_be_edited}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 
               text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
               disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="pending">
                              {language === "ar" ? "قيد الانتظار" : "Pending"}
                            </option>

                            <option value="paid">
                              {language === "ar" ? "مدفوع" : "Paid"}
                            </option>

                            <option value="refunded">
                              {language === "ar" ? "مُسترد" : "Refunded"}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveOrder();
                      }}
                      disabled={updating || !selectedOrder.can_be_edited}
                      className="w-full px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {updating
                        ? t("saving") ||
                          (language === "ar" ? "جاري الحفظ..." : "Saving...")
                        : t("saveChanges") ||
                          (language === "ar"
                            ? "حفظ التغييرات"
                            : "Save Changes")}
                    </button>
                  </div>
                </aside>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
