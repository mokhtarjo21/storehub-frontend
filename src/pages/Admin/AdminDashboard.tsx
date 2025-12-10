import React, { useState } from "react";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  purple: "#8B5CF6",
  warning: "#F59E0B",
  danger: "#EF4444",
};

const AdminDashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const isArabic = language === "ar";
  const [filters, setFilters] = useState({ startDate: null, endDate: null });

  const { data: overview } = useApi(
    `/auth/admin/analytics/overview/?start_date=${
      filters.startDate ? filters.startDate.toISOString() : ""
    }&end_date=${filters.endDate ? filters.endDate.toISOString() : ""}`
  );

  const { data: salesData } = useApi(
    `/auth/admin/analytics/sales/?start_date=${
      filters.startDate ? filters.startDate.toISOString() : ""
    }&end_date=${filters.endDate ? filters.endDate.toISOString() : ""}`
  );

  const { data: usersData } = useApi(
    `/auth/admin/analytics/users/?start_date=${
      filters.startDate ? filters.startDate.toISOString() : ""
    }&end_date=${filters.endDate ? filters.endDate.toISOString() : ""}`
  );

  const { data: usersList } = useApi("/auth/admin/users/?limit=5");

  const { data: companiesList } = useApi(
    "/auth/admin/companies/?status=pending"
  );
  // Handle predefined filters
  const handlePresetFilter = (filter: string) => {
    const fn = presetFilters[filter];
    if (fn) {
      const { start, end } = fn();
      setFilters({ startDate: start, endDate: end });
    }
  };

  const adminStats = [
    {
      name: language === "ar" ? "إجمالي المستخدمين" : "Total Users",
      value: overview?.users?.total || 0,
      icon: UsersIcon,
      color: "blue",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      name: language === "ar" ? "إجمالي الطلبات" : "Total Orders",
      value: overview?.orders?.total || 0,
      icon: ShoppingBagIcon,
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      name: language === "ar" ? "الإيرادات" : "Total Revenue",
      value: `$${(overview?.revenue?.total_in_range || 0).toLocaleString()}`,
     
      icon: CurrencyDollarIcon,
      color: "purple",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      name: language === "ar" ? "الشركات المعلقة" : "Pending Companies",
      value: overview?.companies?.pending || 0,
      icon: BuildingOfficeIcon,
      color: "yellow",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  // Handle Date Change
  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setFilters({ startDate: start, endDate: end });
  };


  const filterButtons = [
    { key: "today", label: isArabic ? "اليوم" : "Today" },
    { key: "yesterday", label: isArabic ? "الأمس" : "Yesterday" },
    { key: "last7Days", label: isArabic ? "آخر 7 أيام" : "Last 7 days" },
    { key: "last30Days", label: isArabic ? "آخر 30 يوم" : "Last 30 days" },
    { key: "last3Months", label: isArabic ? "آخر 3 أشهر" : "Last 3 Months" },
    { key: "lastYear", label: isArabic ? "السنة الماضية" : "Last Year" },
    { key: "allTime", label: isArabic ? "مسح" : "Clear" },
  ];

  const presetFilters: Record<string, () => { start: Date | null; end: Date }> =
    {
      today: () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return { start, end: new Date() };
      },
      yesterday: () => {
        const start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        return { start, end: new Date() };
      },
      last7Days: () => {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return { start, end: new Date() };
      },
      last30Days: () => {
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end: new Date() };
      },
      last3Months: () => {
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        start.setDate(1);
        return { start, end: new Date() };
      },
      lastYear: () => {
        const start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        start.setMonth(0);
        start.setDate(1);
        return { start, end: new Date() };
      },
      allTime: () => ({ start: null, end: null }),
    };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 px-2 sm:px-0"
        >
          <h1
            className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white ${
              language === "ar" ? "text-right" : "text-left"
            }`}
          >
            {language === "ar" ? "لوحة تحكم المسؤول" : "Admin Dashboard"}
          </h1>
          <p
            className={`mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 ${
              language === "ar" ? "text-right" : "text-left"
            }`}
          >
            {language === "ar"
              ? "إدارة المنصة ومراقبة المقاييس الرئيسية"
              : "Manage your platform and monitor key metrics"}
          </p>
        </motion.div>

        {/* Date Picker - Professional UI */}
        <div
          className={`mb-6 px-2 sm:px-0 ${
            isArabic ? "text-right" : "text-left"
          }`}
        >
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-5 sm:p-6">
              {/* Label with Icon */}
              <div className="flex items-center gap-3 mb-4 flex-nowrap">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  {isArabic ? "اختيار المدة الزمنية" : "Select Date Range"}
                </label>
              </div>

              {/* Date Input */}
              <div className="relative w-full">
                <div
                  className={`absolute inset-y-0 ${
                    isArabic ? "right-0 pr-3" : "left-0 pl-3"
                  } flex items-center pointer-events-none`}
                >
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <DatePicker
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg py-2 pl-10 pr-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  selected={filters.startDate}
                  onChange={handleDateChange}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  selectsRange
                  placeholderText={isArabic ? "اختر الفترة" : "Select period"}
                />
              </div>

              {/* Filter Buttons */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => handlePresetFilter(btn.key)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors "
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Selection Summary */}
              {filters.startDate && filters.endDate && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div
                    className={`flex flex-col sm:flex-row sm:justify-between gap-4`}
                  >
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {isArabic ? "المدة المختارة" : "Selected Range"}
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {Math.ceil(
                          (filters.endDate - filters.startDate) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        {isArabic ? "يوم" : "days"}
                      </p>
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      {filters.startDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      -{" "}
                      {filters.endDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="
            grid 
            grid-cols-1 
            xs:grid-cols-2 
            sm:grid-cols-2 
            md:grid-cols-2 
            lg:grid-cols-4 
            gap-3 
            sm:gap-4 
            md:gap-6 
            mb-6 
            sm:mb-8
            px-2 sm:px-0
          "
        >
          {adminStats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="
                bg-white 
                dark:bg-gray-800 
                rounded-lg 
                sm:rounded-xl 
                shadow-sm 
                p-4 
                sm:p-6 
                border 
                border-gray-200 
                dark:border-gray-700
              "
            >
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${stat.bgColor}`}
                >
                  <stat.icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`}
                  />
                </div>
                <div className="ml-3 sm:ml-4 rtl:ml-0 rtl:mr-3 rtl:sm:mr-4 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                    {stat.name}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 px-2 sm:px-0">
          {/* Sales Over Time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {language === "ar" ? "نظرة عامة على المبيعات" : "Sales Overview"}
            </h3>
            {salesData?.sales_over_time?.length ? (
              <ResponsiveContainer width="100%" height={240}>
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
              <div className="h-48 sm:h-64 flex items-center justify-center text-sm text-gray-500">
                No sales data available
              </div>
            )}
          </motion.div>

          {/* User Distribution - Pie with custom legend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {language === "ar" ? "توزيع المستخدمين" : "Users by Role"}
            </h3>

            {usersData?.users_by_role?.length ? (
              <>
                <div className="w-full h-48 sm:h-72 md:h-48 lg:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usersData.users_by_role}
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        stroke="#fff"
                        strokeWidth={1}
                        dataKey="count"
                      >
                        {usersData.users_by_role.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              Object.values(COLORS)[
                                index % Object.keys(COLORS).length
                              ]
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value, name, props) => {
                          const role = props.payload.role;
                          const percent = (
                            (value /
                              usersData.users_by_role.reduce(
                                (acc, u) => acc + u.count,
                                0
                              )) *
                            100
                          ).toFixed(0);
                          return [value, t(`auth.role.${role}`)];
                        }}
                        contentStyle={{
                          backgroundColor: "#44B3E1",
                          border: "none",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom Legend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 mt-8">
                  {usersData.users_by_role.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-sm"
                        style={{
                          backgroundColor:
                            Object.values(COLORS)[
                              index % Object.keys(COLORS).length
                            ],
                        }}
                      ></span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t(`auth.role.${entry.role}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 sm:h-64 flex items-center justify-center text-sm text-gray-500">
                {language === "ar"
                  ? "لا توجد بيانات للمستخدمين"
                  : "No user data available"}
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 px-2 sm:px-0">
          {/* Sales by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {language === "ar" ? "المبيعات حسب الفئة" : "Sales by Category"}
            </h3>
            {salesData?.sales_by_category &&
            salesData.sales_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
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
              <div className="h-48 sm:h-64 flex items-center justify-center text-sm text-gray-500">
                No category data available
              </div>
            )}
          </motion.div>

          {/* User Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {language === "ar" ? "نمو المستخدمين" : "User Growth"}
            </h3>
            {usersData?.user_growth && usersData.user_growth.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
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
              <div className="h-48 sm:h-64 flex items-center justify-center text-sm text-gray-500">
                No growth data available
              </div>
            )}
          </motion.div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {language === "ar" ? "المستخدمون الجدد" : "Recent Users"}
              </h3>
              <Link
                to="/admin/users"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
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
                    className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between"
                  >
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === "company_admin"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : user.role === "affiliate"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {t(`auth.role.${user.role}`)}
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
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {language === "ar" ? "الشركات المعلقة" : "Pending Companies"}
              </h3>
              <Link
                to="/admin/companies"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {language === "ar" ? "عرض الكل" : "View All"}
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {companiesList?.results?.length > 0 ? (
                companiesList.results
                  .slice(0, 5)
                  .map((company: any, index: number) => (
                    <div key={index} className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                          {company.name}
                        </p>
                        <span className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {t(`pending`)}
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="px-6 py-8 sm:py-12 text-center text-sm text-gray-500">
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
