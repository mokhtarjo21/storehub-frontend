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
  registration_number?: string;
  website?: string;
  description?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_card_image?: string;
  commercial_registration_image?: string;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const url = "http://192.168.1.7:8000"; // baseURL for images

  const fetchCompanies = async () => {
    try {
      const params: any = {
        page: currentPage,
        search,
        status: filterStatus,
        ordering: sortField ? `${sortOrder === "desc" ? "-" : ""}${sortField}` : undefined,
      };
      const res = await axiosInstance.get("/api/auth/admin/companies/", { params });
      setCompanies(res.data.results);
      setTotalPages(Math.ceil(res.data.count / perPage));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, search, filterStatus, sortField, sortOrder]);

  const openCompanyModal = async (id: number) => {
    try {
      const res = await axiosInstance.get(`/api/auth/admin/company/${id}/`);
      setSelectedCompany(res.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch company details:", error);
      alert("Failed to load company details");
    }
  };

  const toggleActive = async (company: Company) => {
    try {
      const action = company.approval_status === "approved" ? "reject" : "approve";
      await axiosInstance.post(`/api/auth/admin/companies/${company.id}/approve/`, { action });
      fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-3xl font-bold">Companies</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border p-2 rounded flex-1 min-w-[200px] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          <option value="">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          <option value="">Sort by</option>
          <option value="name">Name</option>
          <option value="industry">Industry</option>
          <option value="approval_status">Status</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border p-2 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Companies Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Industry</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2">{company.name}</td>
                <td className="px-4 py-2">{company.industry}</td>
                <td className="px-4 py-2 capitalize">{company.approval_status}</td>
                <td className="px-4 py-2 flex gap-2 flex-wrap">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => openCompanyModal(company.id)}
                  >
                    View
                  </button>
                  <button
                    className={`px-3 py-1 rounded text-white ${
                      company.approval_status === "approved" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    }`}
                    onClick={() => toggleActive(company)}
                  >
                    {company.approval_status === "approved" ? "Reject" : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
        >
          Prev
        </button>
        <span>
          Page <strong>{currentPage}</strong> of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto space-y-4">
            <h2 className="text-2xl font-bold">{selectedCompany.name}</h2>
            <p><strong>Registration Number:</strong> {selectedCompany.registration_number || "-"}</p>
            <p><strong>Industry:</strong> {selectedCompany.industry}</p>
            <p><strong>Website:</strong> {selectedCompany.website || "-"}</p>
            <p><strong>Description:</strong> {selectedCompany.description || "-"}</p>
            <p>
              <strong>Address:</strong>{" "}
              {selectedCompany.address_line1 || ""} {selectedCompany.address_line2 || ""},{" "}
              {selectedCompany.city || ""}, {selectedCompany.state || ""}, {selectedCompany.postal_code || ""}, {selectedCompany.country || ""}
            </p>
            <p><strong>Phone:</strong> {selectedCompany.phone}</p>
            <p><strong>Email:</strong> {selectedCompany.email}</p>

            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {selectedCompany.tax_card_image && (
                <img
                  src={url + selectedCompany.tax_card_image}
                  alt="Tax Card"
                  className="max-h-52 rounded shadow"
                />
              )}
              {selectedCompany.commercial_registration_image && (
                <img
                  src={url + selectedCompany.commercial_registration_image}
                  alt="Commercial Registration"
                  className="max-h-52 rounded shadow"
                />
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
