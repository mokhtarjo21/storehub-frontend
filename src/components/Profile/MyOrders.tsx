import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApi } from '../../hooks/useApi';
import { Order } from '../../types';

const MyOrders: React.FC = () => {
  const { language } = useLanguage();
  const { data: orders, loading, error } = useApi('/orders/');

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
        <p className="text-red-600 dark:text-red-400">Failed to load orders</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {language === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          {language === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'processing':
      case 'confirmed':
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order: Order, index: number) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            to={`/orders/${order.id}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Order #{order.id}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <span>
                    {language === 'ar' ? 'التاريخ:' : 'Date:'} {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    {language === 'ar' ? 'العناصر:' : 'Items:'} {order.items?.length || 0}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPaymentStatusColor(order.payment_status)}`}>
                    {language === 'ar' ? 'الدفع:' : 'Payment:'} {order.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${order.total.toFixed(2)}
                </p>
                {order.pointsEarned > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    +{order.pointsEarned} {language === 'ar' ? 'نقطة' : 'points'}
                  </p>
                )}
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2 overflow-x-auto">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.product.image || 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-700"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        +{order.items.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default MyOrders;
