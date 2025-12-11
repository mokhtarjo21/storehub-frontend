import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";
import { useApi } from "../../hooks/useApi";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";
import { useParams } from "react-router-dom";
const MyActivity: React.FC = () => {
  const { language } = useLanguage();
  const [page, setPage] = useState(1);
   const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useApi(`/auth/activity/${id}/?page=${page}`);

  const activities = data?.results || [];
  const totalCount = data?.count || 0;
  const pageSize = 15;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "page_view":
      case "product_view":
      case "service_view":
        return EyeIcon;
      case "search":
        return MagnifyingGlassIcon;
      case "add_to_cart":
      case "checkout":
      case "order_placed":
        return ShoppingCartIcon;
      case "login":
        return ArrowRightOnRectangleIcon;
      case "register":
        return UserPlusIcon;
      default:
        return CursorArrowRaysIcon;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "order_placed":
      case "checkout":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
      case "add_to_cart":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
      case "search":
      case "filter_applied":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20";
      case "login":
      case "register":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
    }
  };

  const getActivityLabel = (action: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      page_view: { en: "Page View", ar: "عرض الصفحة" },
      search: { en: "Search", ar: "بحث" },
      product_click: { en: "Product Click", ar: "نقر على المنتج" },
      product_view: { en: "Product View", ar: "عرض المنتج" },
      service_view: { en: "Service View", ar: "عرض الخدمة" },
      add_to_cart: { en: "Add to Cart", ar: "إضافة إلى السلة" },
      remove_from_cart: { en: "Remove from Cart", ar: "إزالة من السلة" },
      checkout: { en: "Checkout", ar: "الدفع" },
      order_placed: { en: "Order Placed", ar: "تم الطلب" },
      login: { en: "Login", ar: "تسجيل الدخول" },
      logout: { en: "Logout", ar: "تسجيل الخروج" },
      register: { en: "Register", ar: "التسجيل" },
      filter_applied: { en: "Filter Applied", ar: "تطبيق الفلتر" },
    };
    return language === "ar" ? labels[action]?.ar : labels[action]?.en;
  };

  // --- LOADING ---
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  // --- ERROR ---
  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-red-600 dark:text-red-400">
          Failed to load activity
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* --- HEADER --- */}
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {language === "ar" ? "نشاطك الأخير" : "Your Activity Timeline"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {language === "ar"
            ? "سجل تفاعلاتك داخل المنصة"
            : "Track all your activity inside the platform"}
        </p>
      </div>

      {/* --- TIMELINE --- */}
      <div className="relative">
        {/* Timeline line - hidden on mobile, visible on medium screens and up */}
        <div className="hidden md:block absolute top-0 bottom-0 left-6 w-0.5 bg-gray-300 dark:bg-gray-700"></div>

        <div className="space-y-4">
          {activities.map((activity: any, index: number) => {
            const Icon = getActivityIcon(activity.action);
            const colorClass = getActivityColor(activity.action);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Mobile Layout */}
                <div className="md:hidden bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow flex-shrink-0 ${colorClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                          {getActivityLabel(activity.action)}
                        </h4>
                        <time className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {new Date(activity.timestamp).toLocaleString()}
                        </time>
                      </div>

                      {/* Target */}
                      {activity.target && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                          {language === "ar" ? "الهدف:" : "Target:"}{" "}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                      )}

                      {/* Metadata */}
                      {activity.metadata &&
                        Object.keys(activity.metadata).length > 0 && (
                          <div className="grid grid-cols-1 gap-2 mt-3">
                            {Object.entries(activity.metadata)
                              .slice(0, 2)
                              .map(([key, value]) => (
                                <div
                                  key={key}
                                  className="bg-gray-50 dark:bg-gray-900/30 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {key.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">
                                    {String(value)}
                                  </p>
                                </div>
                              ))}
                            {Object.keys(activity.metadata).length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                +{Object.keys(activity.metadata).length - 2}{" "}
                                more
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex gap-4 items-start">
                  {/* Icon with timeline connection */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow ${colorClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
                      {/* Left side info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {getActivityLabel(activity.action)}
                          </h4>
                          <time className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {new Date(activity.timestamp).toLocaleString()}
                          </time>
                        </div>

                        {/* Target */}
                        {activity.target && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            {language === "ar" ? "الهدف:" : "Target:"}{" "}
                            <span className="font-medium">
                              {activity.target}
                            </span>
                          </p>
                        )}

                        {/* Metadata */}
                        {activity.metadata &&
                          Object.keys(activity.metadata).length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                              {Object.entries(activity.metadata).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                                  >
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                      {key.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                      {String(value)}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center py-4 gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === "ar" ? "السابق" : "Previous"}
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {language === "ar" ? "الصفحة" : "Page"} {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === "ar" ? "التالي" : "Next"}
          </button>
        </div>
      )}

      {/* Empty state */}
      {activities.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <CursorArrowRaysIcon className="w-16 h-16 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            {language === "ar"
              ? "لا توجد أنشطة مسجلة"
              : "No activities recorded"}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {language === "ar"
              ? "سيظهر نشاطك هنا عند تفاعلك مع المنصة"
              : "Your activities will appear here when you interact with the platform"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyActivity;
