import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

const AccountUnderReview: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
            <ClockIcon className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'الحساب قيد المراجعة' : 'Account Under Review'}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {language === 'ar'
              ? 'حسابك قيد المراجعة الإدارية. بعض الميزات محدودة مؤقتًا.'
              : 'Your account is under administrative review. Some features are temporarily restricted.'}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {language === 'ar'
                ? 'يمكنك تصفح المنتجات ولكن لا يمكنك إجراء عمليات الشراء حتى تكتمل المراجعة.'
                : 'You can browse products but cannot make purchases until the review is complete.'}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/"
              className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              <HomeIcon className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
              {language === 'ar' ? 'العودة للرئيسية' : 'Go to Home'}
            </Link>

            <a
              href="mailto:support@storehub.com"
              className="block w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition-colors"
            >
              {language === 'ar' ? 'الاتصال بالدعم' : 'Contact Support'}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountUnderReview;
