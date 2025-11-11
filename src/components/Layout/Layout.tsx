import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";
import ApiStatus from "../ApiStatus";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ApiStatus />
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          className: "dark:bg-gray-800 dark:text-white mt-16",
        }}
      />
    </div>
  );
};

export default Layout;
