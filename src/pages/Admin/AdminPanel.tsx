import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminProductsSection from "./Products_section";
import AdminOrdersPage from "./Admin_orders_page";
import AdminBrandsSection from "./Brands_section";
import AdminCategoriesSection from "./Categories_section";
import AdminUsersPage from "./AdminUsersPage";
import AdminCompaniesPage from "./AdminCompany";
import AdminSidebar from "./ AdminSidebar";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed} 
      />
      {/* Overlay للشاشات الصغيرة */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setCollapsed(false)}
        ></div>
      )}
      {/* المحتوى */}
      <div
        className={`pt-6 transition-all duration-300 ${
          collapsed ? "lg:ml-20 ml-20" : "lg:ml-60 ml-20"
        }`}
      >
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "products" && <AdminProductsSection />}
        {activeTab === "order" && <AdminOrdersPage />}
        {activeTab === "brands" && <AdminBrandsSection />}
        {activeTab === "categories" && <AdminCategoriesSection />}
        {activeTab === "user management" && <AdminUsersPage />}
        {activeTab === "Companies management" && <AdminCompaniesPage />}
      </div>
    </div>
  );
};

export default AdminPanel;
