import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const AccountSuspended: React.FC = () => {
  const { language } = useLanguage();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'ar' ? 'تم تعليق الحساب' : 'Account Suspended'}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {language === 'ar'
              ? 'تم تعليق حسابك. يرجى الاتصال بالدعم للحصول على المساعدة.'
              : 'Your account has been suspended. Please contact support for assistance.'}
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center text-sm text-gray-700 dark:text-gray-300">
              <EnvelopeIcon className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" />
              <span>support@storehub.com</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="mailto:support@storehub.com"
              className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              {language === 'ar' ? 'الاتصال بالدعم' : 'Contact Support'}
            </a>

            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition-colors"
            >
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountSuspended;
