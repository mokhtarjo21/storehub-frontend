import React from 'react';
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
  const { data: activities, loading, error } = useApi('/auth/activity/');
  
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
      case 'product_click':
      case 'filter_applied':
        return CursorArrowRaysIcon;
      default:
        return CursorArrowRaysIcon;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'order_placed':
      case 'checkout':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'add_to_cart':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'search':
      case 'filter_applied':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'login':
      case 'register':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  console.log(activities);
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
      other: { en: 'Other', ar: 'أخرى' },
    };

    return language === 'ar' ? labels[action]?.ar || action : labels[action]?.en || action;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load activity</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12">
        <CursorArrowRaysIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          {language === 'ar' ? 'لا يوجد نشاط' : 'No activity yet'}
        </p>
      </div>
    );
  }

  return (
  <div className="space-y-8">

    {/* --- HEADER --- */}
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
        {language === "ar" ? "نشاطك الأخير" : "Your Activity Timeline"}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {language === "ar"
          ? "سجل شامل لكل تفاعلاتك داخل المنصة"
          : "A detailed and modern timeline for all your interactions"}
      </p>
    </div>

    {/* --- TIMELINE LINE --- */}
    <div className="relative pl-10">
      <div className="absolute top-0 bottom-0 left-4 w-[2px] bg-gray-200 dark:bg-gray-700"></div>

      <div className="space-y-6">
        {activities.map((activity: any, index: number) => {
          const Icon = getActivityIcon(activity.action);
          const colorClass = getActivityColor(activity.action);

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className=" flex gap-6 items-start"
            >
              {/* ICON */}
              <div
                className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md border ${colorClass}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* CARD */}
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between gap-4">

                  {/* TITLE + TARGET */}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {getActivityLabel(activity.action)}
                    </h4>

                    {/* TARGET */}
                    {activity.target && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {language === "ar" ? "الهدف:" : "Target:"}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                    )}

                    {/* METADATA */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-gray-50 dark:bg-gray-900/30 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {key}
                            </p>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TIMESTAMP */}
                  <time className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleString()}
                  </time>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </div>
);

};

export default MyActivity;
