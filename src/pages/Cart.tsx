import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import toast from 'react-hot-toast';

const Cart: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [usePoints, setUsePoints] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'split'>('cod');

  // Fetch cart data from API
  const { data: cartData, loading, execute: refetchCart } = useApi('/products/cart/');

  const items = cartData?.items || [];
  const total = cartData?.total_price || 0;

  const hasServices = items.some((item: any) => item.item_type === 'service');
  const hasProducts = items.some((item: any) => item.item_type === 'product');
  
  const pointsDiscount = usePoints ? Math.min(user?.points || 0, total * 0.1) : 0;
  const finalTotal = total - pointsDiscount;

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/cart/update/${itemId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }

      refetchCart();
      toast.success('Cart updated successfully');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/cart/remove/${itemId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      refetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products/cart/clear/', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      refetchCart();
      toast.success('Cart cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    console.log('Processing checkout with payment method:', paymentMethod);
    console.log('Has services:', hasServices);
    console.log('Has products:', hasProducts);
    toast.info(`Checkout with ${paymentMethod === 'split' ? 'Split Payment' : 'Cash on Delivery'}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingCartIcon className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              {t('cart.empty.title')}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {t('cart.empty.subtitle')}
            </p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {t('cart.empty.cta')}
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('cart.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {items.length} {t('cart.itemsCount')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('cart.items')}
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="p-6 flex items-center space-x-4 rtl:space-x-reverse"
                  >
                    <img
                      src={item.item_image || 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg'}
                      alt={item.item_name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {item.item_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.item_type === 'product' ? 'Product' : 'Service'}
                      </p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                        ${parseFloat(item.item_price).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <MinusIcon className="w-5 h-5" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('cart.summary')}
              </h2>

              {/* Payment Method Selection */}
              {hasServices && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Payment Method
                  </label>

                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Cash on Delivery (Full Payment)
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Pay the full amount when order is delivered
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="split"
                        checked={paymentMethod === 'split'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'split')}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Split Payment (Deposit + Final)
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Pay deposit now, remaining amount upon service completion
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('cart.promoCode')}
                </label>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('cart.promoCode.placeholder')}
                  />
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    {t('common.apply')}
                  </button>
                </div>
              </div>

              {/* Points */}
              {user && user.points > 0 && (
                <div className="mb-4">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      checked={usePoints}
                      onChange={(e) => setUsePoints(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('cart.usePoints')} ({user.points} {t('common.points')})
                    </span>
                  </label>
                  {usePoints && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      -{pointsDiscount.toFixed(2)} {t('cart.discount')}
                    </p>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{t('cart.subtotal')}</span>
                  <span className="text-gray-900 dark:text-white">${parseFloat(total).toFixed(2)}</span>
                </div>
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{t('cart.pointsDiscount')}</span>
                    <span className="text-green-600 dark:text-green-400">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{t('cart.shipping')}</span>
                  <span className="text-gray-900 dark:text-white">{t('cart.freeShipping')}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">{t('common.total')}</span>
                    <span className="text-gray-900 dark:text-white">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <CreditCardIcon className="w-5 h-5" />
                <span>{t('cart.checkout')}</span>
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {t('cart.clear')}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;