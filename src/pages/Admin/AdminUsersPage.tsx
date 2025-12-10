import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
interface Company {
  id: number;
  name: string;
  industry: string;
  website: string | null;
  description: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  approval_status: string;
  approved_at: string | null;
  rejection_reason: string | null;
  admin_name: string;
  admin_email: string;
  employee_count: number;
  tax_card_image: string;
  commercial_registration_image: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  date_joined: string;
  company_name: string;
  affiliate_code: string | null;
  points: number;
  avatar: string | null;
  address: string | null;
  profile: any;
  company: Company | null;
}

export default function AdminUsersPage() {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const perPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const nanvigate = useNavigate();
  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        search,
        role: roleFilter,
      };
      const res = await axiosInstance.get("/api/auth/admin/users/", { params });
      setUsers(res.data.results);
      setTotalPages(Math.ceil(res.data.count / pageSize));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const toggleActive = async (user: User) => {
    if (
      !confirm(
        language === "ar"
          ? `هل تريد ${user.is_active ? "تعطيل" : "تفعيل"} هذا المستخدم؟`
          : `Are you sure you want to ${
              user.is_active ? "Disenable" : "Enable"
            } this user?`
      )
    )
      return;

    try {
      
      
      await axiosInstance.post(`/api/auth/users/${user.id}/configurations/update/`, {
       "is_active": user.is_active ? "false" : "true",
        
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };


  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: { en: string; ar: string } } = {
      individual: { en: "Individual", ar: "فرد" },
      company_staff: { en: "Company Staff", ar: "موظف شركة" },
      company_admin: { en: "Company Admin", ar: "مدير شركة" },
      affiliate: { en: "Affiliate", ar: "مسوق بالعمولة" },
      super_admin: { en: "Super Admin", ar: "مدير عام" },
    };

    return roleMap[role]?.[language === "ar" ? "ar" : "en"] || role;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      <h1
        className={`text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        {language === "ar" ? "إدارة المستخدمين" : "Users Management"}
      </h1>

      {/* Filters */}
      <div
        className={`flex flex-col sm:flex-row gap-4 mb-6 ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        <input
          type="text"
          placeholder={language === "ar" ? "ابحث هنا" : "Search"}
          className={`flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            language === "ar" ? "text-right" : "text-left"
          }`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          dir={language === "ar" ? "rtl" : "ltr"}
        />
        <select
          className={`p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            language === "ar" ? "text-right" : "text-left"
          }`}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <option value="">
            {language === "ar" ? "جميع الصلاحيات" : "All Roles"}
          </option>
          <option value="individual">{getRoleDisplayName("individual")}</option>
          <option value="company_staff">
            {getRoleDisplayName("company_staff")}
          </option>
          <option value="company_admin">
            {getRoleDisplayName("company_admin")}
          </option>
          <option value="affiliate">{getRoleDisplayName("affiliate")}</option>
          <option value="super_admin">
            {getRoleDisplayName("super_admin")}
          </option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th
                  className={`py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الاسم" : "Name"}
                </th>
                <th
                  className={`py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "البريد الالكتروني" : "Email"}
                </th>
                <th
                  className={`py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الهاتف" : "Phone"}
                </th>
                <th
                  className={`py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الصلاحية" : "Role"}
                </th>
                <th
                  className={`py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "مفعل" : "Verified"}
                </th>
                <th
                  className={`py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الشركة" : "Company"}
                </th>
                <th
                  className={`py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "النشاط" : "Activity"}
                </th>
                <th
                  className={`py-2 px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {language === "ar" ? "جاري التحميل..." : "Loading..."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 px-4 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    {language === "ar" ? "لا توجد مستخدمين" : "No users found"}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    {/* Name */}
                    <td
                      className={`py-3 px-4 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {user.full_name}
                      </div>
                    </td>

                    {/* Email */}
                    <td
                      className={`p-2 text-sm text-gray-900 dark:text-white max-w-[140px] truncate ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {user.email}
                    </td>

                    {/* Phone */}
                    <td
                      className={`py-3 px-4 text-sm text-gray-900 dark:text-white ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {user.phone}
                    </td>

                    {/* Role */}
                    <td
                      className={`py-3 px-4 text-sm text-gray-900 dark:text-white ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <span className="p-1.5 text-xs font-serif bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full whitespace-nowrap">
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>

                    {/* Verified */}
                    <td
                      className={`py-3 px-4 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          user.is_verified
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {user.is_verified ? (
                          <>
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            {language === "ar" ? "نعم" : "Yes"}
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            {language === "ar" ? "لا" : "No"}
                          </>
                        )}
                      </span>
                    </td>

                    {/* Company */}
                    <td
                      className={`py-3 px-4 text-sm text-gray-900 dark:text-white ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {user.company_name || "-"}
                    </td>

                    {/* Activity */}
                    <td
                      className={`py-2 px-3 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <button
                        className="p-1 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 "
                        onClick={() => nanvigate(`/activity/${user.id}`)}
                      >
                        {language === "ar" ? "نشط" : "Activity"}
                      </button>
                    </td>

                    <td
                      className={`py-2 px-3 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`flex gap-1 ${
                          language === "ar" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <button
                          className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          onClick={() => openViewModal(user)}
                          title={language === "ar" ? "عرض" : "View"}
                        >
                          <EyeIcon className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                        </button>
                        <button
                          className={`p-1.5 rounded transition-colors ${
                            user.is_active
                              ? "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50"
                              : "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50"
                          }`}
                          onClick={() => toggleActive(user)}
                          title={
                            language === "ar" ? "تفعيل/تعطيل" : "Enable/Disable"
                          }
                        >
                          {user.is_active ? (
                            <XCircleIcon className="w-4 h-4 text-red-700 dark:text-red-400" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4 text-green-700 dark:text-green-400" />
                          )}
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Table - With horizontal scroll */}
        <div className="lg:hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 whitespace-nowrap">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "الاسم" : "Name"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "البريد" : "Email"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "الهاتف" : "Phone"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "الصلاحية" : "Role"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "مفعل" : "Verified"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "الشركة" : "Company"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "نشاط" : "Activity"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {language === "ar" ? "جاري التحميل..." : "Loading..."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 px-4 text-center text-gray-500 dark:text-gray-400 text-sm"
                    >
                      {language === "ar"
                        ? "لا توجد مستخدمين"
                        : "No users found"}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      {/* NAME */}
                      <td
                        className={`py-3 px-4 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[120px]">
                          {user.full_name}
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td
                        className={`py-3 px-4 text-sm text-gray-900 dark:text-white ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <div className="min-w-[150px] truncate">
                          {user.email}
                        </div>
                      </td>

                      {/* PHONE */}
                      <td
                        className={`py-3 px-4 text-sm text-gray-900 dark:text-white ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <div className="min-w-[100px]">{user.phone}</div>
                      </td>

                      {/* ROLE */}
                      <td
                        className={`py-3 px-4 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>

                      {/* VERIFIED */}
                      <td
                        className={`py-3 px-4 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            user.is_verified
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                          }`}
                        >
                          {user.is_verified ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              {language === "ar" ? "نعم" : "Yes"}
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-3 h-3 mr-1" />
                              {language === "ar" ? "لا" : "No"}
                            </>
                          )}
                        </span>
                      </td>

                      {/* COMPANY */}
                      <td
                        className={`py-3 px-4 text-sm text-gray-900 dark:text-white ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <div className="min-w-[100px] truncate">
                          {user.company_name || "-"}
                        </div>
                      </td>

                      {/* ACTIVITY */}
                      <td
                        className={`py-3 px-4 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <button
                          className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex-shrink-0"
                          onClick={() => nanvigate(`/activity/${user.id}`)}
                        >
                          {language === "ar" ? "نشاط" : "Activity"}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td
                        className={`py-3 px-4 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`flex gap-1 min-w-[120px] ${
                            language === "ar" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* VIEW */}
                          <button
                            className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            onClick={() => openViewModal(user)}
                          >
                            <EyeIcon className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                          </button>

                          {/* ENABLE / DISABLE */}
                          <button
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.is_verified
                                ? "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50"
                                : "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50"
                            }`}
                            onClick={() => toggleActive(user)}
                          >
                            {user.is_verified ? (
                              <XCircleIcon className="w-4 h-4 text-red-700 dark:text-red-400" />
                            ) : (
                              <CheckCircleIcon className="w-4 h-4 text-green-700 dark:text-green-400" />
                            )}
                          </button>

                          {/* DELETE
                          <button
                            className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            onClick={() => handleDelete(user.id)}
                          >
                            <TrashIcon className="w-4 h-4 text-red-700 dark:text-red-400" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div
        className={`flex items-center gap-6 justify-center mt-4 ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        <div className="flex gap-2">
          <button
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            {language === "ar" ? "السابق" : "Previous"}
          </button>
          {/* Page Info */}
          <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            {language === "ar"
              ? `الصفحة ${currentPage} من ${totalPages}`
              : `Page ${currentPage} of ${totalPages}`}
          </span>
          <button
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            {language === "ar" ? "التالي" : "Next"}
          </button>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div
              className={`flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 ${
                language === "ar" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <h2
                className={`text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex-1 ${
                  language === "ar" ? "text-right pr-3" : "text-left pl-3"
                }`}
              >
                {language === "ar" ? "تفاصيل المستخدم" : "User Details"}
              </h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 ${
                  language === "ar" ? "ml-2" : "mr-2"
                }`}
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {language === "ar" ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedUser.full_name}
                  </p>
                </div>
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {language === "ar" ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedUser.email}
                  </p>
                </div>
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {language === "ar" ? "الهاتف" : "Phone"}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedUser.phone}
                  </p>
                </div>
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {language === "ar" ? "الصلاحية" : "Role"}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {getRoleDisplayName(selectedUser.role)}
                  </p>
                </div>
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {language === "ar" ? "الحالة" : "Status"}
                  </label>
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      selectedUser.is_verified
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    }`}
                  >
                    {selectedUser.is_verified
                      ? language === "ar"
                        ? "مفعل"
                        : "Active"
                      : language === "ar"
                      ? "معطل"
                      : "Inactive"}
                  </span>
                </div>
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {language === "ar" ? "النقاط" : "Points"}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedUser.points}
                  </p>
                </div>
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {language === "ar" ? "كود المسوق" : "Affiliate Code"}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedUser.affiliate_code || "-"}
                  </p>
                </div>
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {language === "ar" ? "تاريخ التسجيل" : "Date Joined"}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedUser.date_joined).toLocaleString(
                      language === "ar" ? "ar-EG" : "en-US"
                    )}
                  </p>
                </div>
              </div>

              {/* Address */}
              {selectedUser.address && (
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {language === "ar" ? "العنوان" : "Address"}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedUser.address}
                  </p>
                </div>
              )}

              {/* Company Details */}
              {selectedUser.company && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3
                    className={`text-lg font-semibold text-gray-900 dark:text-white mb-4 ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {language === "ar" ? "تفاصيل الشركة" : "Company Details"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={language === "ar" ? "text-right" : "text-left"}
                    >
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {language === "ar" ? "اسم الشركة" : "Company Name"}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedUser.company.name}
                      </p>
                    </div>
                    <div
                      className={language === "ar" ? "text-right" : "text-left"}
                    >
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {language === "ar" ? "البريد الإلكتروني" : "Email"}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedUser.company.email}
                      </p>
                    </div>
                    <div
                      className={language === "ar" ? "text-right" : "text-left"}
                    >
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {language === "ar"
                          ? "حالة الموافقة"
                          : "Approval Status"}
                      </label>
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          selectedUser.company.approval_status === "approved"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : selectedUser.company.approval_status ===
                              "rejected"
                            ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                        }`}
                      >
                        {selectedUser.company.approval_status}
                      </span>
                    </div>
                    <div
                      className={language === "ar" ? "text-right" : "text-left"}
                    >
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {language === "ar" ? "الهاتف" : "Phone"}
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedUser.company.phone}
                      </p>
                    </div>
                  </div>

                  {/* Company Documents */}
                  <div className="mt-4">
                    <h4
                      className={`text-md font-medium text-gray-900 dark:text-white mb-3 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {language === "ar" ? "الوثائق" : "Documents"}
                    </h4>
                    <div
                      className={`flex gap-4 ${
                        language === "ar" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {selectedUser.company.tax_card_image && (
                        <div className="text-center">
                          <img
                            src={selectedUser.company.tax_card_image}
                            alt={
                              language === "ar"
                                ? "البطاقة الضريبية"
                                : "Tax Card"
                            }
                            className="w-24 h-24 object-fill border border-gray-300 dark:border-gray-600 rounded-lg mb-2"
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {language === "ar"
                              ? "البطاقة الضريبية"
                              : "Tax Card"}
                          </p>
                        </div>
                      )}
                      {selectedUser.company.commercial_registration_image && (
                        <div className="text-center">
                          <img
                            src={
                              selectedUser.company.commercial_registration_image
                            }
                            alt={
                              language === "ar"
                                ? "السجل التجاري"
                                : "Commercial Registration"
                            }
                            className="w-24 h-24 object-fill border border-gray-300 dark:border-gray-600 rounded-lg mb-2"
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {language === "ar"
                              ? "السجل التجاري"
                              : "Commercial Registration"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div
                className={`flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${
                  language === "ar" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  {language === "ar" ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
