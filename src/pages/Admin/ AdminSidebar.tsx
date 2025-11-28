import React from "react";
import {
  MdDashboard,
  MdProductionQuantityLimits,
  MdHomeRepairService,
  MdCategory,
} from "react-icons/md";
import { FaTags, FaShoppingCart } from "react-icons/fa";

interface Props {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  activeTab: string;
  setActiveTab: (v: any) => void;
}

const AdminSidebar: React.FC<Props> = ({
  mobileOpen,
  setMobileOpen,
  activeTab,
  setActiveTab,
}) => {
  const NavItem = ({
    label,
    icon,
    tab,
  }: {
    label: string;
    icon: React.ReactNode;
    tab: string;
  }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setMobileOpen(false); 
      }}
      className={`w-full p-3 flex items-center gap-3 rounded-lg text-left transition-all ${
        activeTab === tab
          ? "bg-gray-200 dark:bg-gray-700 font-semibold"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div
      className={`fixed left-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-60 p-4 z-40 transition-transform duration-300 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >

      <nav className="space-y-2">
        <NavItem label="Dashboard" icon={<MdDashboard />} tab="dashboard" />
        <NavItem
          label="Products"
          icon={<MdProductionQuantityLimits />}
          tab="products"
        />
      
        <NavItem label="Brands" icon={<FaTags />} tab="brands" />
        <NavItem label="Categories" icon={<MdCategory />} tab="categories" />
        <NavItem label="Orders" icon={<FaShoppingCart />} tab="order" />
      </nav>
    </div>
  );
};

export default AdminSidebar;