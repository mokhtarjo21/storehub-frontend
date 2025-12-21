import React, { useState, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import AdminSidebar from "./ AdminSidebar";

/* Lazy Imports */
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminProductsSection = lazy(() => import("./Products_section"));
const AdminOrdersPage = lazy(() => import("./Admin_orders_page"));
const AdminBrandsSection = lazy(() => import("./Brands_section"));
const AdminCategoriesSection = lazy(() => import("./Categories_section"));
const AdminUsersPage = lazy(() => import("./AdminUsersPage"));
const AdminCompaniesPage = lazy(() => import("./AdminCompany"));
const AdminMangeUsersPage = lazy(() => import("./AdminMangeUsersPage"));

// تعريف tabs حسب role
const roleTabs: Record<string, Record<string, React.LazyExoticComponent<any>>> = {
  super: {
    dashboard: AdminDashboard,
    products: AdminProductsSection,
    order: AdminOrdersPage,
    brands: AdminBrandsSection,
    categories: AdminCategoriesSection,
    "user management": AdminUsersPage,
    "Companies management": AdminCompaniesPage,

    "admin users": AdminMangeUsersPage,
  },
  admin: {
    dashboard: AdminDashboard,
    products: AdminProductsSection,
    order: AdminOrdersPage,
    brands: AdminBrandsSection,
    categories: AdminCategoriesSection,
    "user management": AdminUsersPage,
  },
  default: {
    dashboard: AdminDashboard,
    order: AdminOrdersPage,
  },
};

const AdminPanel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  const [activeTab, setActiveTab] = useState(tab);
  const [collapsed, setCollapsed] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();

  // تحديد tabs حسب role
  const userRole = user?.role_admin || "default";
  const availableTabs = roleTabs[userRole] || roleTabs.default;
  const ActiveComponent = availableTabs[activeTab] || AdminDashboard;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Overlay للموبايل */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={() => setCollapsed(false)}
        />
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
        <Suspense fallback={<div className="text-center py-10">{language==='ar'? 'جاري التحميل ..':"Loading..."}</div>}>
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
  );
};

export default AdminPanel;
