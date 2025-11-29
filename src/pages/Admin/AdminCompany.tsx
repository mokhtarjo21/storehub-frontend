// AdminCompaniesPage.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

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
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [companyToReject, setCompanyToReject] = useState<Company | null>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

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
    <div className="flex flex-col">
      <span className="text-gray-500 dark:text-gray-400 text-sm">{label}</span>
      <span className="text-gray-900 dark:text-gray-100 font-medium break-words">
        {value || "-"}
      </span>
    </div>
  );

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, search, filterStatus]);

  const fetchCompanies = async () => {
    try {
      const params: any = {
        page: currentPage,
        search,
        status: filterStatus,
      };
      const res = await axiosInstance.get("/api/auth/admin/companies/", {
        params,
      });
      setCompanies(res.data.results);
      setTotalPages(Math.ceil(res.data.count / perPage));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleActive = async (company: Company) => {
    try {
      if (
        company.approval_status === "rejected" ||
        company.approval_status === "pending"
      ) {
        await axiosInstance.post(
          `/api/auth/admin/companies/${company.id}/approve/`,
          { action: "approve" }
        );
      } else {
        await axiosInstance.post(
          `/api/auth/admin/companies/${company.id}/approve/`,
          { action: "reject", reason: rejectReason }
        );
      }
      fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        >
          <option value="">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-800">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-200">
                Name
              </th>
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-200">
                Email
              </th>
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-200">
                Status
              </th>
              <th className="py-2 px-4 text-left text-gray-700 dark:text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr
                key={company.id}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                  {company.name}
                </td>
                <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                  {company.email}
                </td>
                <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                  {company.approval_status}
                </td>
                <td className="py-2 px-4 flex gap-2 flex-wrap">
                  <button
                    className="bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition"
                    onClick={() => openCompanyModal(company)}
                  >
                    View
                  </button>
                  {company.approval_status === "pending" && (
                    <>
                      <button
                        className="bg-green-600 dark:bg-green-700 text-white px-2 py-1 rounded hover:bg-green-700 dark:hover:bg-green-800 transition"
                        onClick={() => toggleActive(company)}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded hover:bg-red-700 dark:hover:bg-red-800 transition"
                        onClick={() => {
                          setCompanyToReject(company);
                          setIsRejectModalOpen(true);
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {company.approval_status === "approved" && (
                    <button
                      className="bg-yellow-500 dark:bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-600 dark:hover:bg-yellow-700 transition"
                      onClick={() => {
                        setCompanyToReject(company);
                        setIsRejectModalOpen(true);
                      }}
                    >
                      Reject
                    </button>
                  )}
                  {company.approval_status === "rejected" && (
                    <button
                      className="bg-green-600 dark:bg-green-700 text-white px-2 py-1 rounded hover:bg-green-700 dark:hover:bg-green-800 transition"
                      onClick={() => toggleActive(company)}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2 flex-wrap">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`px-3 py-1 border rounded transition ${
              page === currentPage
                ? "bg-[#215C98] text-white border-blue-500 dark:bg-[#215C98]"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Company Detail Modal */}
      {isModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-slideUp">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Company Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-gray-900 dark:text-gray-100">
              <DetailRow label="Name" value={selectedCompany.name} />
              <DetailRow
                label="Registration Number"
                value={selectedCompany.registration_number}
              />
              <DetailRow label="Industry" value={selectedCompany.industry} />
              <DetailRow label="Website" value={selectedCompany.website} />
              <DetailRow
                label="Description"
                value={selectedCompany.description}
              />
              <DetailRow
                label="Address"
                value={`${selectedCompany.address_line1 || ""} ${
                  selectedCompany.address_line2 || ""
                }, ${selectedCompany.city}, ${selectedCompany.state}, ${
                  selectedCompany.postal_code
                }, ${selectedCompany.country}`}
              />
              <DetailRow
                label="Full Address"
                value={selectedCompany.full_address}
              />
              <DetailRow
                label="Approval Status"
                value={selectedCompany.approval_status}
              />
              <DetailRow
                label="Active"
                value={selectedCompany.is_active ? "Yes" : "No"}
              />
              <DetailRow
                label="Employee Count"
                value={selectedCompany.employee_count}
              />
              <DetailRow label="Phone" value={selectedCompany.phone} />
              <DetailRow label="Email" value={selectedCompany.email} />

              {selectedCompany.tax_card_image && (
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tax Card
                  </p>
                  <img
                    src={selectedCompany.tax_card_image}
                    alt="Tax Card"
                    className="rounded-lg border shadow-sm w-full object-cover"
                  />
                </div>
              )}
              {selectedCompany.commercial_registration_image && (
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Commercial Registration
                  </p>
                  <img
                    src={selectedCompany.commercial_registration_image}
                    alt="CR"
                    className="rounded-lg border shadow-sm w-full object-cover"
                  />
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end">
              <button
                className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition shadow-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Reject Company
            </h2>
            <label className="block text-gray-600 dark:text-gray-300 mb-2">
              Reason for rejection:
            </label>
            <textarea
              className="w-full border rounded p-2 min-h-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Write the rejection reason..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded hover:bg-gray-500 dark:hover:bg-gray-500 transition"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-800 transition"
                onClick={async () => {
                  if (!rejectReason.trim()) {
                    alert("Please enter a rejection reason");
                    return;
                  }
                  try {
                    await axiosInstance.post(
                      `/api/auth/admin/companies/${companyToReject?.id}/approve/`,
                      {
                        action: "reject",
                        reason: rejectReason,
                      }
                    );
                    setIsRejectModalOpen(false);
                    setRejectReason("");
                    fetchCompanies();
                  } catch (error) {
                    console.error(error);
                    alert("Failed to reject company");
                  }
                }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
