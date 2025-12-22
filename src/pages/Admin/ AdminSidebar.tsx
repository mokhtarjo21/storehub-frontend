import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdProductionQuantityLimits,
  MdCategory,
} from "react-icons/md";
import { FaTags, FaShoppingCart, FaUsers, FaBuilding } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "react-feather";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  activeTab: string;
  setActiveTab: (v: any) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}
const AdminSidebar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  let navItems = [];
  if (!user) {
    return null;
  }

  if (user?.role_admin == "super") {
    navItems = [
      {
        label: language === "ar" ? "لوحة التحكم" : "Dashboard",
        icon: <MdDashboard />,
        tab: "dashboard",
      },
      {
        label: language === "ar" ? "المنتجات" : "Products",
        icon: <MdProductionQuantityLimits />,
        tab: "products",
      },
      {
        label: language === "ar" ? "العلامات التجارية" : "Brands",
        icon: <FaTags />,
        tab: "brands",
      },
      {
        label: language === "ar" ? "التصنيفات" : "Categories",
        icon: <MdCategory />,
        tab: "categories",
      },
      {
        label: language === "ar" ? "الطلبات" : "Orders",
        icon: <FaShoppingCart />,
        tab: "order",
      },
      {
        label: language === "ar" ? "إدارة المستخدمين" : "Users Manage",
        icon: <FaUsers />,
        tab: "user management",
      },
      {
        label: language === "ar" ? "إدارة الشركات" : "Companies manage",
        icon: <FaBuilding />,
        tab: "Companies management",
      },
      {
        label: language === "ar" ? "المسؤولين" : "Admin Users",
        icon: <FaUsers />,
        tab: "admin users",
      },
    ];
  } else if (user?.role_admin == "admin") {
    navItems = [
      {
        label: language === "ar" ? "لوحة التحكم" : "Dashboard",
        icon: <MdDashboard />,
        tab: "dashboard",
      },
      {
        label: language === "ar" ? "المنتجات" : "Products",
        icon: <MdProductionQuantityLimits />,
        tab: "products",
      },
      {
        label: language === "ar" ? "العلامات التجارية" : "Brands",
        icon: <FaTags />,
        tab: "brands",
      },
      {
        label: language === "ar" ? "التصنيفات" : "Categories",
        icon: <MdCategory />,
        tab: "categories",
      },
      {
        label: language === "ar" ? "الطلبات" : "Orders",
        icon: <FaShoppingCart />,
        tab: "order",
      },
      {
        label: language === "ar" ? "إدارة المستخدمين" : "Users Manage",
        icon: <FaUsers />,
        tab: "user management",
      },
    ];
  } else {
    navItems = [
      {
        label: language === "ar" ? "لوحة التحكم" : "Dashboard",
        icon: <MdDashboard />,
        tab: "dashboard",
      },

      {
        label: language === "ar" ? "الطلبات" : "Orders",
        icon: <FaShoppingCart />,
        tab: "order",
      },
    ];
  }

  return (
    <div
      className={`
        fixed top-16
        ${language === "ar" ? "right-0" : "left-0"}
        h-[calc(100vh-64px)]
        bg-white dark:bg-[#0f172a]
        border-r border-gray-200 dark:border-gray-700
        shadow-sm
        transition-all duration-300 z-40
        ${collapsed ? "w-20" : "w-52"}
      `}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          absolute top-4 w-7 h-7 rounded-full bg-[#44B3E1] dark:bg-[#44B3E1]
          flex items-center justify-center shadow-md border border-[#215C98] dark:border-[#215C98]
          transition hover:scale-110
          ${language === "ar" ? "-left-4" : "-right-4"}
        `}
      >
        {collapsed ? (
          language === "ar" ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )
        ) : language === "ar" ? (
          <ChevronLeft size={16} />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>

      {/* Sidebar Content */}
      <div className="p-4">
        {!collapsed && (
          <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-6 text-lg">
            {language === "ar" ? "قائمة التحكم" : "Admin Menu"}
          </h2>
        )}

        {/* Nav List */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <div key={item.tab} className="relative group">
              <button
                onClick={() => {
                  setActiveTab(item.tab);
                  navigate(`?tab=${item.tab}`);
                  if (window.innerWidth < 1024) {
                    setCollapsed(true);
                  }
                }}
                className={`
                  flex items-center gap-3 py-3 px-2 w-full rounded-xl
                  text-sm transition-all
                  ${
                    activeTab === item.tab
                      ? "bg-[#44B3E1] dark:bg-[#44B3E1] text-[#215C98] dark:text-[#215C98] font-semibold shadow"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>

              {/* Tooltip when collapsed */}
              {collapsed && (
                <span
                  className={`
                    absolute top-1/2 -translate-y-1/2
                    ${language === "ar" ? "right-14" : "left-14"}
                    bg-gray-900 text-white text-xs
                    px-2 py-1 rounded shadow opacity-0
                    pointer-events-none
                    group-hover:opacity-100 ${
                      language === "ar"
                        ? "group-hover:-translate-x-1"
                        : "group-hover:translate-x-1"
                    }
                    transition-all
                  `}
                >
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
