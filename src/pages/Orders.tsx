import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBagIcon,
  CalendarDaysIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useApi } from "../hooks/useApi";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");

  // Fetch user orders
  const {
    data: ordersData,
    loading: ordersLoading,
    execute: refetchOrders,
  } = useApi("/orders/");

  // التأكد أن orders مصفوفة دائمًا
  const orders = Array.isArray(ordersData)
    ? ordersData
    : Array.isArray(ordersData?.results)
    ? ordersData.results
    : [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "shipped":
      case "out_for_delivery":
        return <TruckIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

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

  const handleViewOrderDetails = (orderNumber: string | number) => {
    navigate(`/orders/${orderNumber}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("dashboard.welcome")}, {user?.name}
          </h1>
        </motion.div>
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 p-3 rounded-lg ${
                        stat.color === "blue"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : stat.color === "green"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : stat.color === "purple"
                          ? "bg-purple-100 dark:bg-purple-900/30"
                          : stat.color === "orange"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <stat.icon
                        className={`w-6 h-6 ${
                          stat.color === "blue"
                            ? "text-blue-600 dark:text-blue-400"
                            : stat.color === "green"
                            ? "text-green-600 dark:text-green-400"
                            : stat.color === "purple"
                            ? "text-purple-600 dark:text-purple-400"
                            : stat.color === "orange"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="ml-4 rtl:ml-0 rtl:mr-4 flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {stat.name}
                      </p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <span className="ml-2 rtl:ml-0 rtl:mr-2 text-sm font-medium text-green-600 dark:text-green-400">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Orders Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t("dashboard.monthlyOrders") ||
                    (language === "ar"
                      ? "الطلبات والإيرادات الشهرية"
                      : "Monthly Orders & Revenue")}
                </h3>
                {monthlyOrdersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyOrders}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="month"
                        className="text-gray-600 dark:text-gray-300"
                      />
                      <YAxis className="text-gray-600 dark:text-gray-300" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgb(31 41 55)",
                          border: "none",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                      <Bar dataKey="orders" fill="#3B82F6" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t("dashboard.purchaseCategories") ||
                    (language === "ar"
                      ? "فئات المشتريات"
                      : "Purchase Categories")}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-[#155F82] dark:text-[#44B3E1]">
                {t("dashboard.myOrders")}
              </h3>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {t("dashboard.noOrders")}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {t("dashboard.startShopping")}
                </p>

                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => navigate("/products")}
                    className="px-8 py-3 rounded-xl font-semibold text-lg bg-[#155F82] text-white shadow-lg 
                   hover:bg-[#155F82]/90 hover:scale-105 transition-all duration-300"
                  >
                    {t("home.hero.cta")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order: any) => (
                  <motion.div
                    key={order.id || order.order_number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      {/* الجزء الأيسر - معلومات الطلب */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getStatusIcon(order.order_status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* السطر الجديد - رقم الطلب والزر في نفس الخط */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                              <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                                {t("dashboard.order") ||
                                  (language === "ar" ? "طلب" : "Order")}{" "}
                                #{order.order_number}
                              </p>

                              {/* زر View Details الآن جنب رقم الطلب */}
                              <button
                                onClick={() =>
                                  handleViewOrderDetails(order.order_number)
                                }
                                className="inline-flex items-center gap-2 sm:px-4 p-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors self-start sm:self-auto"
                              >
                                <EyeIcon className="w-4 h-4" />
                                <span>
                                  {t("dashboard.viewDetails") ||
                                    (language === "ar"
                                      ? "عرض التفاصيل"
                                      : "View Details")}
                                </span>
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              <span>
                                {new Date(order.created_at).toLocaleDateString(
                                  language === "ar" ? "ar-EG" : "en-GB"
                                )}
                              </span>
                              <span>•</span>
                              <span>
                                {order.items_count || order.items?.length || 0}{" "}
                                {t("dashboard.items") ||
                                  (language === "ar" ? "عنصر" : "items")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Status Timeline */}
                        <div className="ml-8 sm:ml-11 pl-4 sm:pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">
                              {t("dashboard.status") ||
                                (language === "ar" ? "الحالة" : "Status")}
                              :
                            </span>
                            <span className="font-semibold">
                              {order.status_display || order.order_status}
                            </span>
                            {order.payment_status === "pending" && (
                              <>
                                <span>•</span>
                                <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                  {t("dashboard.paymentPending") ||
                                    (language === "ar"
                                      ? "في انتظار الدفع"
                                      : "Payment Pending")}
                                </span>
                              </>
                            )}
                          </div>
                          {order.estimated_delivery && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <CalendarDaysIcon className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {t("dashboard.estimatedDelivery") ||
                                  (language === "ar"
                                    ? "التسليم المتوقع"
                                    : "Estimated Delivery")}
                                :{" "}
                                {new Date(
                                  order.estimated_delivery
                                ).toLocaleDateString(
                                  language === "ar" ? "ar-EG" : "en-GB"
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* الجزء الأيمن - السعر والحالة */}
                      <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
                        <div className="flex flex-col items-end gap-2">
                          <p className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                            ${parseFloat(order.total_price || 0).toFixed(2)}
                          </p>
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              order.order_status
                            )}`}
                          >
                            {order.status_display || order.order_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
