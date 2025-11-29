import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminProductsSection from "./Products_section";
import AdminOrdersPage from "./Admin_orders_page";
import AdminBrandsSection from "./Brands_section";
import AdminCategoriesSection from "./Categories_section";
import AdminSidebar from "./ AdminSidebar";
import AdminUsersPage from "./AdminUsersPage";
import AdminCompaniesPage from "./AdminCompany";

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Sidebar ثابتة - بدون Drawer */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* المحتوى */}
      <div className="lg:ml-60 ml-20 pt-6 transition-all duration-300">
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
