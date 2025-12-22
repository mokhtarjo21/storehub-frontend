import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

interface Company {
  id: number;
  name: string;
  industry: string;
  email: string;
  phone: string;
  approval_status: string;
  full_address: string;
  is_active: boolean;
  registration_number: string;
  website: string;
  description: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  tax_card_image: string;
  commercial_registration_image: string;
  employee_count?: number;
}

export default function AdminCompaniesPage() {
  const { language } = useLanguage();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [companyToReject, setCompanyToReject] = useState<Company | null>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [openImage, setOpenImage] = useState(null);
  const openCompanyModal = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const DetailRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number;
  }) => (
    <div
      className={`flex flex-col ${
        language === "ar" ? "text-right" : "text-left"
      }`}
    >
      <span className="text-gray-500 dark:text-gray-400 text-sm mb-1">
        {label}
      </span>
      <span className="text-gray-900 dark:text-gray-100 font-medium break-words">
        {value || "-"}
      </span>
    </div>
  );

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, search, filterStatus]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        search,
        status: filterStatus,
      };
      const res = await axiosInstance.get("/api/auth/admin/companies/", {
        params,
      });
      setCompanies(res.data?.results || []);
      setTotalPages(Math.ceil((res.data?.count || 0) / perPage));
    } catch (error) {
      console.error(error);
      setCompanies([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (company: Company) => {
    try {
      await axiosInstance.post(
        `/api/auth/admin/companies/${company.id}/approve/`,
        { action: "approve" }
      );

      fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: {
      [key: string]: { en: string; ar: string; color: string };
    } = {
      pending: {
        en: "Pending",
        ar: "قيد الانتظار",
        color:
          "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      },
      approved: {
        en: "Approved",
        ar: "مقبول",
        color:
          "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      },
      suspended: {
        en: "Suspended",
        ar: "معلق",
        color:
          "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      },
      rejected: {
        en: "Rejected",
        ar: "مرفوض",
        color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      },
    };

    return (
      statusMap[status] || {
        en: status,
        ar: status,
        color: "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200",
      }
    );
  };
  const handleOpenImage = (url) => {
    setOpenImage(url);
  };

  const handleCloseImage = () => {
    setOpenImage(null);
  };
  const handleDownloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName = url.split("/").pop() || "image.jpg"; 
      link.download = fileName;
      link.click();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("فشل في تنزيل الصورة.");
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`mb-6 ${language === "ar" ? "text-right" : "text-left"}`}>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {language === "ar" ? "إدارة الشركات" : "Companies Management"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {language === "ar"
            ? "إدارة طلبات التسجيل والموافقة على الشركات"
            : "Manage company registration requests and approvals"}
        </p>
      </div>

      {/* Filters */}
      <div
        className={`flex flex-col sm:flex-row gap-4 mb-6 ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        <input
          type="text"
          placeholder={
            language === "ar"
              ? "ابحث باسم الشركة أو البريد..."
              : "Search by name or email..."
          }
          className={`flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            language === "ar" ? "text-right" : "text-left"
          }`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          dir={language === "ar" ? "rtl" : "ltr"}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            language === "ar" ? "text-right" : "text-left"
          }`}
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <option value="">
            {language === "ar" ? "جميع الحالات" : "All Status"}
          </option>
          <option value="approved">
            {language === "ar" ? "مقبول" : "Approved"}
          </option>
          <option value="pending">
            {language === "ar" ? "قيد الانتظار" : "Pending"}
          </option>
          <option value="rejected">
            {language === "ar" ? "مرفوض" : "Rejected"}
          </option>
          <option value="suspended">
            {language === "ar" ? "معلق" : "Suspended"}
          </option>
        </select>
      </div>

      {/* Companies Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[600px] md:min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th
                  className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap min-w-[150px] ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "اسم الشركة" : "Company Name"}
                </th>
                <th
                  className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap min-w-[180px] ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </th>
                <th
                  className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap min-w-[120px] ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الحالة" : "Status"}
                </th>
                <th
                  className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap min-w-[140px] ${
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
                  <td colSpan={4} className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {language === "ar" ? "جاري التحميل..." : "Loading..."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : !companies || companies.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 px-4 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    {language === "ar" ? "لا توجد شركات" : "No companies found"}
                  </td>
                </tr>
              ) : (
                (companies || []).map((company) => {
                  const statusInfo = getStatusDisplay(company.approval_status);
                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <td
                        className={`py-3 px-4 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {company.name}
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-gray-900 dark:text-white whitespace-nowrap ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        {company.email}
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusInfo.color}`}
                        >
                          {language === "ar" ? statusInfo.ar : statusInfo.en}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`flex gap-1 sm:gap-2 ${
                            language === "ar" ? "text-right" : "text-left"
                          }`}
                        >
                          <button
                            className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex-shrink-0"
                            onClick={() => openCompanyModal(company)}
                            title={
                              language === "ar"
                                ? "عرض التفاصيل"
                                : "View details"
                            }
                          >
                            <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 dark:text-blue-400" />
                          </button>

                          {company.approval_status === "pending" && (
                            <>
                              <button
                                className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex-shrink-0"
                                onClick={() => toggleActive(company)}
                                title={language === "ar" ? "قبول" : "Approve"}
                              >
                                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 dark:text-green-400" />
                              </button>
                              <button
                                className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex-shrink-0"
                                onClick={() => {
                                  setCompanyToReject(company);
                                  setIsRejectModalOpen(true);
                                }}
                                title={language === "ar" ? "رفض" : "Reject"}
                              >
                                <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-700 dark:text-red-400" />
                              </button>
                            </>
                          )}

                          {company.approval_status === "approved" && (
                            <button
                              className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors flex-shrink-0"
                              onClick={() => {
                                setCompanyToReject(company);
                                setIsRejectModalOpen(true);
                              }}
                              title={language === "ar" ? "تعليق" : "suspended"}
                            >
                              <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-700 dark:text-yellow-400" />
                            </button>
                          )}

                          {company.approval_status === "rejected" && (
                            <button
                              className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex-shrink-0"
                              onClick={() => toggleActive(company)}
                              title={language === "ar" ? "قبول" : "Approve"}
                            >
                              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 dark:text-green-400" />
                            </button>
                          )}
                          {company.approval_status === "suspended" && (
                            <button
                              className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors flex-shrink-0"
                              onClick={() => toggleActive(company)}
                              title={language === "ar" ? "قبول" : "Approve"}
                            >
                              <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 dark:text-green-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
            onClick={() => handlePageChange(currentPage - 1)}
          >
            {language === "ar" ? "السابق" : "Previous"}
          </button>
          {/* Page Info */}
          <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            {language === "ar"
              ? `الصفحة ${currentPage} من ${Math.ceil(totalPages / pageSize)}`
              : `Page ${currentPage} of ${Math.ceil(totalPages / pageSize)}`}
          </span>
          <button
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {language === "ar" ? "التالي" : "Next"}
          </button>
        </div>
      </div>

      {/* Company Detail Modal */}
      {isModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div
              className={`flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 `}
            >
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2
                  className={`text-lg sm:text-xl font-bold text-gray-900 dark:text-white ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "تفاصيل الشركة" : "Company Details"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <DetailRow
                  label={language === "ar" ? "اسم الشركة" : "Company Name"}
                  value={selectedCompany.name}
                />
                <DetailRow
                  label={
                    language === "ar" ? "رقم التسجيل" : "Registration Number"
                  }
                  value={selectedCompany.registration_number}
                />
                <DetailRow
                  label={language === "ar" ? "المجال" : "Industry"}
                  value={selectedCompany.industry}
                />
                <DetailRow
                  label={language === "ar" ? "الموقع الإلكتروني" : "Website"}
                  value={selectedCompany.website}
                />
                <DetailRow
                  label={language === "ar" ? "البريد الإلكتروني" : "Email"}
                  value={selectedCompany.email}
                />
                <DetailRow
                  label={language === "ar" ? "الهاتف" : "Phone"}
                  value={selectedCompany.phone}
                />
                <div className="md:col-span-2">
                  <DetailRow
                    label={language === "ar" ? "الوصف" : "Description"}
                    value={selectedCompany.description}
                  />
                </div>
                <div className="md:col-span-2">
                  <DetailRow
                    label={language === "ar" ? "العنوان" : "Address"}
                    value={`${selectedCompany.address_line1 || ""} ${
                      selectedCompany.address_line2 || ""
                    }, ${selectedCompany.city}, ${selectedCompany.state}, ${
                      selectedCompany.postal_code
                    }, ${selectedCompany.country}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <DetailRow
                    label={
                      language === "ar" ? "العنوان الكامل" : "Full Address"
                    }
                    value={selectedCompany.full_address}
                  />
                </div>
                <DetailRow
                  label={
                    language === "ar" ? "حالة الموافقة" : "Approval Status"
                  }
                  value={
                    language === "ar"
                      ? getStatusDisplay(selectedCompany.approval_status).ar
                      : getStatusDisplay(selectedCompany.approval_status).en
                  }
                />
                <DetailRow
                  label={language === "ar" ? "نشط" : "Active"}
                  value={
                    selectedCompany.is_active
                      ? language === "ar"
                        ? "نعم"
                        : "Yes"
                      : language === "ar"
                      ? "لا"
                      : "No"
                  }
                />
                <DetailRow
                  label={language === "ar" ? "عدد الموظفين" : "Employee Count"}
                  value={selectedCompany.employee_count}
                />
              </div>

              {/* Documents */}
              {(selectedCompany.tax_card_image ||
                selectedCompany.commercial_registration_image) && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3
                    className={`text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 ${
                      language === "ar"
                        ? "text-right flex-row-reverse"
                        : "text-left"
                    }`}
                  >
                    <DocumentTextIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    {language === "ar" ? "الوثائق" : "Documents"}
                  </h3>
                  <div
                    className={`flex flex-col sm:flex-row gap-4 ${
                      language === "ar" ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    {selectedCompany.tax_card_image && (
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === "ar" ? "البطاقة الضريبية" : "Tax Card"}
                        </p>
                        <img
                          src={selectedCompany.tax_card_image}
                          alt={
                            language === "ar" ? "البطاقة الضريبية" : "Tax Card"
                          }
                          className="w-full h-48 object-fill border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer"
                          onClick={() =>
                            handleOpenImage(selectedCompany.tax_card_image)
                          }
                        />
                      </div>
                    )}
                    {selectedCompany.commercial_registration_image && (
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === "ar"
                            ? "السجل التجاري"
                            : "Commercial Registration"}
                        </p>
                        <img
                          src={selectedCompany.commercial_registration_image}
                          alt={
                            language === "ar"
                              ? "السجل التجاري"
                              : "Commercial Registration"
                          }
                          className="w-full h-48 object-fill border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-pointer"
                          onClick={() =>
                            handleOpenImage(
                              selectedCompany.commercial_registration_image
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className={`flex justify-end`}>
                <button
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  {language === "ar" ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* الصورة المعروضة */}
      {openImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="relative bg-white dark:bg-gray-900 rounded-lg p-4 max-w-xl w-full">
            {/* زراغلاق */}
            <button
              onClick={handleCloseImage}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ✕
            </button>

            {/* الصورة */}
            <img
              src={openImage}
              alt="Preview"
              className="w-full max-h-[75vh] object-fill rounded"
            />

            {/* زر التحميل */}
            <button
              onClick={() => handleDownloadImage(openImage)}
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {language === "ar" ? "تنزيل الصورة" : "Download Image"}
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl p-4 sm:p-6">
            <h2
              className={`text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white ${
                language === "ar" ? "text-right" : "text-left"
              }`}
            >
              {companyToReject?.approval_status === "approved"
                ? language === "ar"
                  ? "تعليق الشركة"
                  : "Suspend Company"
                : language === "ar"
                ? "رفض الشركة"
                : "Reject Company"}
            </h2>
            <label
              className={`block text-gray-600 dark:text-gray-300 mb-2 ${
                language === "ar" ? "text-right" : "text-left"
              }`}
            >
              {companyToReject?.approval_status === "approved"
                ? language === "ar"
                  ? "يرجى تقديم سبب تعليق الشركة:"
                  : "Please provide a reason for suspending the company:"
                : language === "ar"
                ? "يرجى تقديم سبب رفض الشركة:"
                : "Please provide a reason for rejecting the company:"}
            </label>
            <textarea
              className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 min-h-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                language === "ar" ? "text-right" : "text-left"
              }`}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={
                companyToReject?.approval_status === "approved"
                  ? language === "ar"
                    ? "سبب التعليق..."
                    : "Reason for suspension..."
                  : language === "ar"
                  ? "سبب الرفض..."
                  : "Reason for rejection..."
              }
              dir={language === "ar" ? "rtl" : "ltr"}
            />
            <div
              className={`flex justify-end gap-3 mt-4 ${
                language === "ar" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <button
                className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-500 dark:hover:bg-gray-500 transition-colors text-sm"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                }}
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-sm"
                onClick={async () => {
                  if (!rejectReason.trim()) {
                    alert(
                      companyToReject?.approval_status === "approved"
                        ? language === "ar"
                          ? "يرجى تقديم سبب التعليق."
                          : "Please provide a reason for suspension."
                        : language === "ar"
                        ? "يرجى تقديم سبب الرفض."
                        : "Please provide a reason for rejection."
                    );
                    return;
                  }
                  try {
                    if (companyToReject?.approval_status === "approved") {
                      await axiosInstance.post(
                        `/api/auth/admin/companies/${companyToReject.id}/approve/`,
                        { action: "suspended", reason: rejectReason }
                      );
                    } else {
                      await axiosInstance.post(
                        `/api/auth/admin/companies/${companyToReject?.id}/approve/`,
                        { action: "reject", reason: rejectReason }
                      );
                    }

                    setIsRejectModalOpen(false);
                    setRejectReason("");
                    fetchCompanies();
                  } catch (error) {
                    console.error(error);
                    alert(
                      companyToReject?.approval_status === "approved"
                        ? language === "ar"
                          ? "فشل في تعليق الشركة"
                          : "Failed to suspend company"
                        : language === "ar"
                        ? "فشل في رفض الشركة"
                        : "Failed to reject company"
                    );
                  }
                }}
              >
                {companyToReject?.approval_status === "approved"
                  ? language === "ar"
                    ? "تعليق"
                    : "Suspend"
                  : language === "ar"
                  ? "رفض"
                  : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
