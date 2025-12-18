import React, { useState, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import AdminSidebar from "./ AdminSidebar";

/* ✅ Lazy Imports */
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminProductsSection = lazy(() => import("./Products_section"));
const AdminOrdersPage = lazy(() => import("./Admin_orders_page"));
const AdminBrandsSection = lazy(() => import("./Brands_section"));
const AdminCategoriesSection = lazy(() => import("./Categories_section"));
const AdminUsersPage = lazy(() => import("./AdminUsersPage"));
const AdminCompaniesPage = lazy(() => import("./AdminCompany"));


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
