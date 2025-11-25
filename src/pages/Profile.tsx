import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  UserIcon,
  CameraIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { changePassword } from '../utils/api';
import MyInfo from '../components/Profile/MyInfo';
import MyOrders from '../components/Profile/MyOrders';
import MyNotifications from '../components/Profile/MyNotifications';
import MyActivity from '../components/Profile/MyActivity';

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

type PasswordFormData = yup.InferType<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('info');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });


  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      toast.success('Password changed successfully!');
      passwordForm.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(errorMessage);
    }
  };

  const baseTabs = [
    { id: 'info', name: 'My Info', icon: UserIcon },
    { id: 'orders', name: 'My Orders', icon: ShoppingBagIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'activity', name: 'My Activity', icon: ClockIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'preferences', name: 'Preferences', icon: GlobeAltIcon },
  ];

  const additionalTabs = [];
  if (user?.role === 'company_admin') {
    additionalTabs.push({ id: 'company', name: 'Company Panel', icon: BuildingOfficeIcon });
  }
  if (user?.role === 'affiliate') {
    additionalTabs.push({ id: 'affiliate', name: 'Affiliate Panel', icon: ChartBarIcon });
  }

  const tabs = [...baseTabs, ...additionalTabs];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('profile.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('profile.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-white" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600">
                    <CameraIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
                <span className={`inline-flex mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                  user?.role === 'super_admin' 
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : user?.role === 'company_admin'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : user?.role === 'company_staff'
                    ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
                    : user?.role === 'affiliate'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {user?.role}
                </span>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* My Info Tab */}
              {activeTab === 'info' && <MyInfo />}

              {/* My Orders Tab */}
              {activeTab === 'orders' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    My Orders
                  </h2>
                  <MyOrders />
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Notifications
                  </h2>
                  <MyNotifications />
                </div>
              )}

              {/* My Activity Tab */}
              {activeTab === 'activity' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    My Activity
                  </h2>
                  <MyActivity />
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    {t('profile.tabs.security')}
                  </h2>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.currentPassword')}
                      </label>
                      <input
                        {...passwordForm.register('currentPassword')}
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.newPassword')}
                      </label>
                      <input
                        {...passwordForm.register('newPassword')}
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.confirmPassword')}
                      </label>
                      <input
                        {...passwordForm.register('confirmPassword')}
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                      >
                        {t('profile.changePassword')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Company Panel Tab */}
              {activeTab === 'company' && user?.role === 'company_admin' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Company Panel
                  </h2>
                  <div className="text-center py-12">
                    <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Manage your company settings and employees
                    </p>
                    <Link
                      to="/company"
                      className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                    >
                      Go to Company Dashboard
                    </Link>
                  </div>
                </div>
              )}

              {/* Affiliate Panel Tab */}
              {activeTab === 'affiliate' && user?.role === 'affiliate' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Affiliate Panel
                  </h2>
                  <div className="text-center py-12">
                    <ChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Track your referrals and commissions
                    </p>
                    <Link
                      to="/affiliate"
                      className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                    >
                      Go to Affiliate Dashboard
                    </Link>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    {t('profile.tabs.preferences')}
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('profile.language')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('profile.language.desc')}
                        </p>
                      </div>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('profile.theme')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('profile.theme.desc')}
                        </p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        {theme === 'light' ? (
                          <>
                            <MoonIcon className="w-4 h-4" />
                            <span>{t('profile.theme.dark')}</span>
                          </>
                        ) : (
                          <>
                            <SunIcon className="w-4 h-4" />
                            <span>{t('profile.theme.light')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;