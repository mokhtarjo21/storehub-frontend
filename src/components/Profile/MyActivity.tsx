import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApi } from '../../hooks/useApi';
import {
  EyeIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline';

const MyActivity: React.FC = () => {
  const { language } = useLanguage();
  const [page, setPage] = useState(1);

  const { data, loading, error } = useApi(`/auth/activity/?page=${page}`);

  const activities = data?.results || [];
  const totalCount = data?.count || 0;
  const pageSize = 15; // نفس اللي في الباك
  const totalPages = Math.ceil(totalCount / pageSize);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'page_view':
      case 'product_view':
      case 'service_view':
        return EyeIcon;
      case 'search':
        return MagnifyingGlassIcon;
      case 'add_to_cart':
      case 'checkout':
      case 'order_placed':
        return ShoppingCartIcon;
      case 'login':
        return ArrowRightOnRectangleIcon;
      case 'register':
        return UserPlusIcon;
      default:
        return CursorArrowRaysIcon;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'order_placed':
      case 'checkout':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'add_to_cart':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'search':
      case 'filter_applied':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
      case 'login':
      case 'register':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getActivityLabel = (action: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      page_view: { en: 'Page View', ar: 'عرض الصفحة' },
      search: { en: 'Search', ar: 'بحث' },
      product_click: { en: 'Product Click', ar: 'نقر على المنتج' },
      product_view: { en: 'Product View', ar: 'عرض المنتج' },
      service_view: { en: 'Service View', ar: 'عرض الخدمة' },
      add_to_cart: { en: 'Add to Cart', ar: 'إضافة إلى السلة' },
      remove_from_cart: { en: 'Remove from Cart', ar: 'إزالة من السلة' },
      checkout: { en: 'Checkout', ar: 'الدفع' },
      order_placed: { en: 'Order Placed', ar: 'تم الطلب' },
      login: { en: 'Login', ar: 'تسجيل الدخول' },
      logout: { en: 'Logout', ar: 'تسجيل الخروج' },
      register: { en: 'Register', ar: 'التسجيل' },
      filter_applied: { en: 'Filter Applied', ar: 'تطبيق الفلتر' },
    };
    return language === 'ar' ? labels[action]?.ar : labels[action]?.en;
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
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* --- HEADER --- */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {language === 'ar' ? 'نشاطك الأخير' : 'Your Activity Timeline'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {language === 'ar'
            ? 'سجل تفاعلاتك داخل المنصة'
            : 'Track all your activity inside the platform'}
        </p>
      </div>

      {/* --- TIMELINE --- */}
      <div className="relative pl-10">
        <div className="absolute top-0 bottom-0 left-4 w-[2px] bg-gray-300 dark:bg-gray-700"></div>

        <div className="space-y-6">
          {activities.map((activity: any, index: number) => {
            const Icon = getActivityIcon(activity.action);
            const colorClass = getActivityColor(activity.action);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-6 items-start"
              >
                {/* ICON */}
                <div
                  className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center shadow ${colorClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* CARD */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition">
                  <div className="flex justify-between items-start">

                    {/* LEFT SIDE INFO */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getActivityLabel(activity.action)}
                      </h4>

                      {/* TARGET */}
                      {activity.target && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {language === 'ar' ? 'الهدف:' : 'Target:'}{' '}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                      )}

                      {/* METADATA */}
                      {activity.metadata && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div
                              key={key}
                              className="bg-gray-50 dark:bg-gray-900/30 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {key}
                              </p>
                              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                {String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* TIMESTAMP */}
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </time>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      <div className="flex items-center justify-center gap-4 py-4">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {language === 'ar' ? 'السابق' : 'Previous'}
        </button>

        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {language === 'ar'
            ? `صفحة ${page} من ${totalPages}`
            : `Page ${page} of ${totalPages}`}
        </span>

        <button
          disabled={!data?.next}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {language === 'ar' ? 'التالي' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default MyActivity;
