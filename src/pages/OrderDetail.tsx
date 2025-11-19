import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../hooks/useApi';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import PaymentSteps from '../components/PaymentSteps';
import toast from 'react-hot-toast';

const OrderDetail: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { t, language } = useLanguage();
  const [cancelling, setCancelling] = useState(false);

  const { data: order, loading, error, execute: refetchOrder } = useApi(`/orders/${orderNumber}/`);

  const handleCancelOrder = async () => {
    if (!order || !confirm(t('orders.cancelConfirm'))) return;

    setCancelling(true);
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${orderNumber}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      toast.success(t('orders.cancelled'));
      refetchOrder();
    } catch (error) {
      toast.error(t('orders.cancelFailed'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t("orders.notFound")}
          </h2>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t("orders.backToDashboard")}
          </Link>
        </div>
      </div>
    );
  }

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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Order {order.order_number}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                {order.status_display}
              </span>
              
              {order.can_be_cancelled && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Status
              </h2>
              
              <OrderStatusTimeline 
                timeline={order.timeline} 
                currentStatus={order.order_status}
              />
              
              {/* Tracking Information */}
              {order.is_trackable && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TruckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-medium text-blue-800 dark:text-blue-200">
                      Tracking Information
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <p><strong>Tracking Number:</strong> {order.tracking_number}</p>
                    <p><strong>Carrier:</strong> {order.carrier}</p>
                    {order.estimated_delivery && (
                      <p><strong>Estimated Delivery:</strong> {new Date(order.estimated_delivery).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Steps - Only show if has payment transactions */}
            {order.payment_transactions && order.payment_transactions.length > 0 && (
              <div className="mt-8">
                <PaymentSteps
                  transactions={order.payment_transactions}
                  totalAmount={parseFloat(order.total_price)}
                />
              </div>
            )}
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Order Totals */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">${parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Tax:</span>
                  <span className="text-gray-900 dark:text-white">${parseFloat(order.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Shipping:</span>
                  <span className="text-gray-900 dark:text-white">
                    {parseFloat(order.shipping_amount) === 0 ? 'Free' : `$${parseFloat(order.shipping_amount).toFixed(2)}`}
                  </span>
                </div>
                {parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Discount:</span>
                    <span className="text-green-600 dark:text-green-400">-${parseFloat(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">${parseFloat(order.total_price).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Address
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">{order.shipping_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{order.shipping_email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{order.shipping_phone}</span>
                </div>
                <div className="ml-6 text-gray-600 dark:text-gray-300">
                  {order.full_shipping_address}
                </div>
              </div>
            </div>

            {/* Points Information */}
            {(order.points_used > 0 || order.points_earned > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Points
                </h3>
                
                <div className="space-y-2 text-sm">
                  {order.points_used > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Points Used:</span>
                      <span className="text-red-600 dark:text-red-400">-{order.points_used}</span>
                    </div>
                  )}
                  {order.points_earned > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Points Earned:</span>
                      <span className="text-green-600 dark:text-green-400">+{order.points_earned}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Items ({order.items.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.items.map((item: any) => (
              <div key={item.id} className="px-6 py-4 flex items-center space-x-4">
                {item.item_image && (
                  <img
                    src={item.item_image}
                    alt={item.item_name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {item.item_name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.item_type === 'product' ? 'Product' : 'Service'}
                    {item.item_sku && ` • SKU: ${item.item_sku}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${parseFloat(item.unit_price).toFixed(2)} × {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total: ${parseFloat(item.total_price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Notes */}
        {order.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Order Notes
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {order.notes}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;