import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { useLanguage } from "../../contexts/LanguageContext";
import { useApi } from "../../hooks/useApi";

const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  purple: "#8B5CF6",
  warning: "#F59E0B",
  danger: "#EF4444",
};

const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const { data: overview, loading: overviewLoading } = useApi(
    "/auth/admin/analytics/overview/"
  );
  const { data: salesData, loading: salesLoading } = useApi(
    "/auth/admin/analytics/sales/"
  );
  const { data: usersData, loading: usersLoading } = useApi(
    "/auth/admin/analytics/users/"
  );
  const { data: usersList } = useApi("/auth/admin/users/?limit=5");
  const { data: companiesList } = useApi(
    "/auth/admin/companies/?status=pending"
  );

  if (overviewLoading || salesLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const adminStats = [
    {
      name: language === "ar" ? "إجمالي المستخدمين" : "Total Users",
      value: overview?.users?.total || 0,
      change: overview?.users?.new_30d || 0,
      changeLabel: language === "ar" ? "جديد" : "new",
      icon: UsersIcon,
      color: "blue",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      name: language === "ar" ? "إجمالي الطلبات" : "Total Orders",
      value: overview?.orders?.total || 0,
      change: overview?.orders?.last_30_days || 0,
      changeLabel: language === "ar" ? "آخر 30 يوم" : "last 30d",
      icon: ShoppingBagIcon,
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      name: language === "ar" ? "الإيرادات" : "Total Revenue",
      value: `$${(overview?.revenue?.total || 0).toLocaleString()}`,
      change: `$${(overview?.revenue?.last_30_days || 0).toLocaleString()}`,
      changeLabel: language === "ar" ? "آخر 30 يوم" : "last 30d",
      icon: CurrencyDollarIcon,
      color: "purple",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      name: language === "ar" ? "الشركات المعلقة" : "Pending Companies",
      value: overview?.companies?.pending || 0,
      change: overview?.companies?.active || 0,
      changeLabel: language === "ar" ? "نشط" : "active",
      icon: BuildingOfficeIcon,
      color: "yellow",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === "ar" ? "لوحة تحكم المسؤول" : "Admin Dashboard"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {language === "ar"
              ? "إدارة المنصة ومراقبة المقاييس الرئيسية"
              : "Manage your platform and monitor key metrics"}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {adminStats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className="ml-4 rtl:ml-0 rtl:mr-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.change} {stat.changeLabel}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Over Time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === "ar" ? "نظرة عامة على المبيعات" : "Sales Overview"}
            </h3>

            {salesData?.sales_over_time?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData.sales_over_time}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(31 41 55)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No sales data available
              </div>
            )}
          </motion.div>

          {/* User Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === "ar" ? "توزيع المستخدمين" : "Users by Role"}
            </h3>

            {usersData?.users_by_role?.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usersData.users_by_role}
                    cx="54%"
                    cy="50%"
                    outerRadius={70}
                    labelLine={false}
                    dataKey="count"
                    label={({ role, percent }) =>
                      `${role} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {usersData.users_by_role.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={Object.values(COLORS)[index % 5]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No user data available
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === "ar" ? "المبيعات حسب الفئة" : "Sales by Category"}
            </h3>
            {salesData?.sales_by_category &&
            salesData.sales_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData.sales_by_category}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="category" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(31 41 55)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                  <Bar dataKey="revenue" fill={COLORS.success} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No category data available
              </div>
            )}
          </motion.div>

          {/* User Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === "ar" ? "نمو المستخدمين" : "User Growth"}
            </h3>
            {usersData?.user_growth && usersData.user_growth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usersData.user_growth}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(31 41 55)",
                      border: "none",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="new_users"
                    stroke={COLORS.purple}
                    strokeWidth={2}
                    name="New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No growth data available
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === "ar" ? "المستخدمون الجدد" : "Recent Users"}
              </h3>
              <Link
                to="/admin/users"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {language === "ar" ? "عرض الكل" : "View All"}
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {usersList?.results
                ?.slice(0, 5)
                .map((user: any, index: number) => (
                  <div
                    key={index}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === "company_admin"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : user.role === "affiliate"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Pending Companies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === "ar" ? "الشركات المعلقة" : "Pending Companies"}
              </h3>
              <Link
                to="/admin/companies"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {language === "ar" ? "عرض الكل" : "View All"}
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {companiesList?.results?.length > 0 ? (
                companiesList.results
                  .slice(0, 5)
                  .map((company: any, index: number) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {company.name}
                        </p>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Pending
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {company.industry}
                      </p>
                    </div>
                  ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  {language === "ar"
                    ? "لا توجد شركات معلقة"
                    : "No pending companies"}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
