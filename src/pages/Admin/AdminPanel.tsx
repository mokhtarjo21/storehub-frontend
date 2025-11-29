import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminProductsSection from "./Products_section";
import AdminOrdersPage from "./Admin_orders_page";
import AdminBrandsSection from "./Brands_section";
import AdminCategoriesSection from "./Categories_section";
import AdminSidebar from  "./ AdminSidebar";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* زر الموبايل (أعلى اليسار) */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="
          fixed top-4 left-4 z-50 
          inline-flex items-center justify-center 
          rounded-md p-2 
          bg-white dark:bg-gray-800 
          text-gray-600 dark:text-gray-300
          shadow-md
          hover:bg-gray-100 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
          lg:hidden
        "
      >
        {mobileOpen ? (
          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Overlay للخلفية في الموبايل */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* الـ Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* المحتوى */}
      <div className="lg:ml-60 lg:pt-6">
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "products" && <AdminProductsSection />}
        {activeTab === "order" && <AdminOrdersPage />}
        
        {activeTab === "brands" && <AdminBrandsSection />}
        {activeTab === "categories" && <AdminCategoriesSection />}
      </div>
    </div>
  );
};

export default AdminPanel;