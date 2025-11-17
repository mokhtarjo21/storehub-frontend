import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminProductsSection from './Products_section'; // Component إدارة المنتجات

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tabs Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex space-x-4 rtl:space-x-reverse border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'dashboard'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-gray-700'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === 'products'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-gray-700'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Products
        </button>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'products' && <AdminProductsSection />}
      </div>
    </div>
  );
};

export default AdminPanel;
