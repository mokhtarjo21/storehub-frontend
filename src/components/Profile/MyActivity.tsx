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
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {language === 'ar' ? 'نشاطك الأخير' : 'Your Recent Activity'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {language === 'ar'
            ? 'تتبع تفاعلاتك وسجل التصفح'
            : 'Track your interactions and browsing history'}
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

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
                className="relative flex gap-4 pl-12"
              >
                <div
                  className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {getActivityLabel(activity.action)}
                      </h4>
                      {activity.target && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          {activity.target}
                        </p>
                      )}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <span key={key} className="mr-3 rtl:mr-0 rtl:ml-3">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
