import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminProductsSection from "./Products_section";
import AdminOrdersPage from "./Admin_orders_page";
import AdminBrandsSection from "./Brands_section";
import AdminCategoriesSection from "./Categories_section";
import AdminUsersPage from "./AdminUsersPage";
import AdminCompaniesPage from "./AdminCompany";
import { useLanguage } from "../../contexts/LanguageContext";
import AdminSidebar from "./ AdminSidebar";
import { useSearchParams } from "react-router-dom";
const AdminPanel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  
  const [activeTab, setActiveTab] = useState(tab);
  const [collapsed, setCollapsed] = useState(false);
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Overlay for small screens */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setCollapsed(false)}
        ></div>
      )}

      {/* Content */}
      <div
        className={`pt-6 transition-all duration-300
          ${
            collapsed
              ? language === "ar"
                ? "lg:mr-20 mr-20"
                : "lg:ml-20 ml-20"
              : language === "ar"
              ? "lg:mr-60 mr-20"
              : "lg:ml-60 ml-20"
          }
        `}
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
