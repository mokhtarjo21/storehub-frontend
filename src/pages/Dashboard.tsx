import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  GiftIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../hooks/useApi';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch user orders
//   const { data: ordersData, loading: ordersLoading } = useApi('/orders/');
// const orders = ordersData || [];
// Fetch user orders
const { data: ordersData, loading: ordersLoading } = useApi('/orders/');

// التأكد أن orders مصفوفة دائمًا
const orders = Array.isArray(ordersData)
  ? ordersData
  : Array.isArray(ordersData?.results)
  ? ordersData.results
  : [];


  // const { data: orders = [], loading: ordersLoading } = useApi('/orders/');
  const { data: orderStats } = useApi('/orders/statistics/');
  
  // Mock data for charts
  const monthlyOrders = [
    { month: 'Jan', orders: 12, revenue: 15000 },
    { month: 'Feb', orders: 19, revenue: 22000 },
    { month: 'Mar', orders: 15, revenue: 18000 },
    { month: 'Apr', orders: 25, revenue: 32000 },
    { month: 'May', orders: 22, revenue: 28000 },
    { month: 'Jun', orders: 30, revenue: 35000 },
  ];

  const categoryData = [
    { name: 'Network Devices', value: 45, color: '#3B82F6' },
    { name: 'Software Licenses', value: 35, color: '#10B981' },
    { name: 'Installation Services', value: 20, color: '#8B5CF6' },
  ];


  const stats = [
    {
      name: t('dashboard.stats.orders'),
      value: orderStats?.total_orders?.toString() || '0',
      icon: ShoppingBagIcon,
      color: 'blue',
      change: '+12%',
    },
    {
      name: t('dashboard.stats.points'),
      value: user?.points?.toString() || '0',
      icon: GiftIcon,
      color: 'green',
      change: '+8%',
    },
    {
      name: t('dashboard.stats.spent'),
      value: `$${orderStats?.total_revenue?.toFixed(2) || '0.00'}`,
      icon: CurrencyDollarIcon,
      color: 'purple',
      change: '+15%',
    },
    {
      name: 'Processing Orders',
      value: orderStats?.processing_orders?.toString() || '0',
      icon: TruckIcon,
      color: 'orange',
      change: '+3%',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'shipped':
      case 'out_for_delivery':
        return <TruckIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing':
      case 'confirmed':
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
            {t('dashboard.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {t('dashboard.welcome')}, {user?.name}!
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                My Orders ({orders.length})
              </button>
            </nav>
          </div>
        </motion.div>
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
                    <div className={`flex-shrink-0 p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
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
                  Monthly Orders & Revenue
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyOrders}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-gray-600 dark:text-gray-300" />
                    <YAxis className="text-gray-600 dark:text-gray-300" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgb(31 41 55)', 
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white'
                      }} 
                    />
                    <Bar dataKey="orders" fill="#3B82F6" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Category Distribution */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Purchase Categories
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
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Orders
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
                  No orders yet
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Start shopping to see your orders here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order: any) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.order_status)}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Order {order.order_number}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()} • {order.items_count} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${parseFloat(order.total_price).toFixed(2)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.order_status)}`}>
                          {order.status_display}
                        </span>
                      </div>
                    </div>
                    
                    {/* Order Status Timeline */}
                    <div className="ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>Status:</span>
                        <span className="font-medium">{order.status_display}</span>
                        {order.payment_status === 'pending' && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-600 dark:text-yellow-400">Payment Pending</span>
                          </>
                        )}
                      </div>
                      {order.estimated_delivery && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>Estimated delivery: {new Date(order.estimated_delivery).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
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