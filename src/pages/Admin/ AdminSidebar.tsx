import React from "react";
import {
  MdDashboard,
  MdProductionQuantityLimits,
  MdCategory,
} from "react-icons/md";
import { FaTags, FaShoppingCart } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "react-feather";

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
  const navItems = [
    { label: "Dashboard", icon: <MdDashboard />, tab: "dashboard" },
    {
      label: "Products",
      icon: <MdProductionQuantityLimits />,
      tab: "products",
    },
    { label: "Brands", icon: <FaTags />, tab: "brands" },
    { label: "Categories", icon: <MdCategory />, tab: "categories" },
    { label: "Orders", icon: <FaShoppingCart />, tab: "order" },
    {
      label: "Manage User",
      icon: <FaTags />,
      tab: "user management",
    },
    {
      label: "Manage Company",
      icon: <FaTags />,
      tab: "Companies management",
    },
  ];

  return (
    <div
      className={`
        fixed top-16 left-0 h-[calc(100vh-64px)]
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
        className="absolute -right-4 top-4 w-7 h-7 rounded-full bg-[#44B3E1] dark:bg-[#44B3E1] flex items-center justify-center shadow-md border border-[#215C98] dark:border-[#215C98] transition hover:scale-110"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Sidebar Content */}
      <div className="p-4">
        {!collapsed && (
          <h2 className="font-bold text-gray-700 dark:text-gray-200 mb-6 text-lg">
            Admin Menu
          </h2>
        )}

        {/* Nav List */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <div key={item.tab} className="relative group">
              <button
                onClick={() => {
                  setActiveTab(item.tab);
                  if (window.innerWidth < 1024) {
                    setCollapsed(true);
                  }
                }}
                className={`
        flex items-center gap-3 p-3 w-full rounded-xl
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
                  className="
        absolute left-14 top-1/2 -translate-y-1/2
        bg-gray-900 text-white text-xs
        px-2 py-1 rounded shadow opacity-0
        pointer-events-none
        group-hover:opacity-100 group-hover:translate-x-1
        transition-all
      "
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
