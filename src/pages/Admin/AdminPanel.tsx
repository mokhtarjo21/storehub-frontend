import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminProductsSection from "./Products_section";
import AdminOrdersPage from "./Admin_orders_page";
import AdminServicesSection from "./Services_section";
import AdminBrandsSection from "./Brands_section";
import AdminCategoriesSection from "./Categories_section";
const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "products" | "order" | "services" | "brands" | "categories"
  >("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tabs Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex space-x-4 rtl:space-x-reverse border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "dashboard"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-gray-700"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "products"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-gray-700"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "services"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-gray-700"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab("brands")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "brands"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-gray-700"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Brands
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "categories"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-gray-700"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("order")}
          className={`px-4 py-2 rounded-t-lg font-medium ${
            activeTab === "order"
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-t border-l border-r border-gray-200 dark:border-gray-700"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Order
        </button>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "products" && <AdminProductsSection />}
        {activeTab === "order" && <AdminOrdersPage />}
        {activeTab === "services" && <AdminServicesSection />}
        {activeTab === "brands" && <AdminBrandsSection />}
        {activeTab === "categories" && <AdminCategoriesSection />}
      </div>
    </div>
  );
};

export default AdminPanel;
