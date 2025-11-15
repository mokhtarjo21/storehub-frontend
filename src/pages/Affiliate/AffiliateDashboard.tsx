import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  LinkIcon,
  BanknotesIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest, handleApiResponse } from '../../utils/api';
import toast from 'react-hot-toast';

interface AffiliateStats {
  affiliate_code: string;
  commission_rate: number;
  total_commission: number;
  total_referrals: number;
  total_sales: number;
  pending_commission: number;
  paid_commission: number;
  is_active: boolean;
  joined_at: string;
  last_commission_date?: string;
  monthly_data: Array<{
    month: string;
    year: number;
    commission: number;
    referrals: number;
  }>;
  recent_commissions: Array<{
    id: number;
    commission_amount: number;
    commission_rate: number;
    created_at: string;
    is_paid: boolean;
    order_number: string;
    customer_name: string;
  }>;
  bank_details: {
    bank_name?: string;
    account_number?: string;
    account_holder_name?: string;
  };
}

const AffiliateDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bank_name: '',
    account_number: '',
    account_holder_name: '',
  });

  useEffect(() => {
    fetchAffiliateStats();
  }, []);

  const fetchAffiliateStats = async () => {
    try {
      const response = await apiRequest('/auth/affiliate/stats/');
      const data = await handleApiResponse(response);
      setStats(data);
      setBankDetails(data.bank_details);
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
      toast.error('Failed to load affiliate statistics');
    } finally {
      setLoading(false);
    }
  };

  const copyAffiliateLink = () => {
    if (stats) {
      const affiliateLink = `${window.location.origin}?ref=${stats.affiliate_code}`;
      navigator.clipboard.writeText(affiliateLink);
      toast.success('Affiliate link copied to clipboard!');
    }
  };

  const updateBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('/auth/affiliate/', {
        method: 'PATCH',
        body: JSON.stringify(bankDetails),
      });
      
      await handleApiResponse(response);
      toast.success('Bank details updated successfully!');
      setShowBankForm(false);
      fetchAffiliateStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update bank details';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Failed to load affiliate data
          </h2>
          <button
            onClick={fetchAffiliateStats}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      name: 'Total Commission',
      value: `$${stats.total_commission.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'green',
      change: '+12%',
    },
    // {
    //   name: 'Total Referrals',
    //   value: stats.total_referrals.toString(),
    //   icon: UsersIcon,
    //   color: 'blue',
    //   change: '+8%',
    // },
    {
      name: 'Total Sales',
      value: `$${stats.total_sales.toFixed(2)}`,
      icon: ChartBarIcon,
      color: 'purple',
      change: '+15%',
    },
    {
      name: 'Commission Rate',
      value: `${stats.commission_rate}%`,
      icon: BanknotesIcon,
      color: 'orange',
      change: '0%',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Affiliate Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Track your commissions, referrals, and performance
          </p>
        </motion.div>

        {/* Affiliate Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Affiliate Code</h2>
              <p className="text-3xl font-bold">{stats.affiliate_code}</p>
              <p className="text-blue-100 mt-2">
                Share your link and earn {stats.commission_rate}% commission on every sale!
              </p>
            </div>
            <button
              onClick={copyAffiliateLink}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              <LinkIcon className="w-5 h-5" />
              <span>Copy Link</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
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
                    <span className={`ml-2 rtl:ml-0 rtl:mr-2 text-sm font-medium ${
                      stat.change.startsWith('+') 
                        ? 'text-green-600 dark:text-green-400' 
                        : stat.change === '0%'
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Commission Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Commission Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthly_data}>
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
                <Line type="monotone" dataKey="commission" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Commission Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Commission Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Pending
                  </span>
                </div>
                <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                  ${stats.pending_commission.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Paid
                  </span>
                </div>
                <span className="text-sm font-bold text-green-800 dark:text-green-200">
                  ${stats.paid_commission.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Bank Details */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bank Details
                </h4>
                <button
                  onClick={() => setShowBankForm(!showBankForm)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {stats.bank_details.bank_name ? 'Edit' : 'Add'}
                </button>
              </div>
              
              {stats.bank_details.bank_name ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><strong>Bank:</strong> {stats.bank_details.bank_name}</p>
                  <p><strong>Account:</strong> ****{stats.bank_details.account_number?.slice(-4)}</p>
                  <p><strong>Name:</strong> {stats.bank_details.account_holder_name}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add your bank details to receive commission payments
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Commissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Commissions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recent_commissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {commission.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {commission.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      ${commission.commission_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        commission.is_paid
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {commission.is_paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(commission.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stats.recent_commissions.length === 0 && (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No commissions yet
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Start sharing your affiliate link to earn commissions!
              </p>
            </div>
          )}
        </motion.div>

        {/* Bank Details Form Modal */}
        {showBankForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bank Details
              </h3>
              <form onSubmit={updateBankDetails} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={bankDetails.account_number}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankDetails.account_holder_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBankForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateDashboard;