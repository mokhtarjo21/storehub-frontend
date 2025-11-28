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

    // داخل AdminCompaniesPage.tsx
const url = "http://192.168.1.7:8000"; // تأكد من أن هذا هو نفس عنوان الـ baseURL في axiosInstance.ts
// AdminCompaniesPage.tsx
const openCompanyModal = async (id: number) => {
  try {
    // جلب التفاصيل من الباك إند
    const res = await axiosInstance.get(`/api/auth/admin/company/${id}/`);
    setSelectedCompany(res.data); // البيانات الكاملة من السيرفر
    console.log(res.data);
    
    setIsModalOpen(true);
  } catch (error) {
    console.error("Failed to fetch company details:", error);
    alert("Failed to load company details");
  }
};

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, search, filterStatus, sortField, sortOrder]);

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



  const handleDelete = async (companyId: number) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    try {
      await axiosInstance.delete(`/api/admin/companies/${companyId}/`);
      fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleActive = async (company: Company) => {
    try {
        if (company.approval_status === "reject" || company.approval_status === "pending") {
      await axiosInstance.post(`/api/auth/admin/companies/${company.id}/approve/`, {
     action:"approve"
      });}
        else {
        await axiosInstance.post(`/api/auth/admin/companies/${company.id}/approve/`, {   

        action:"reject"
        });
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Sort by field</option>
          <option value="name">Name</option>
          <option value="industry">Industry</option>
          <option value="approval_status">Status</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          className="border p-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Companies Table */}
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Industry</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="border-b">
              <td className="py-2 px-4">{company.name}</td>
              <td className="py-2 px-4">{company.industry}</td>
              <td className="py-2 px-4">{company.approval_status}</td>
              <td className="py-2 px-4 flex gap-2 flex-wrap">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => openCompanyModal(company.id)}
                >
                  View
                </button>
                <button
                  className={`px-2 py-1 rounded ${company.approval_status ==="approved" ? "bg-yellow-500" : "bg-green-500"} text-white`}
                  onClick={() => toggleActive(company)}
                >
                  {company.approval_status === "approved" ? "Reject" : "Approve"}
                </button>
               
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="px-3 py-1">{currentPage} / {totalPages}</span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal */}
   {/* Modal */}
{isModalOpen && selectedCompany && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-96 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Company Details</h2>
      <p><strong>Name:</strong> {selectedCompany.name}</p>
      <p><strong>Registration Number:</strong> {selectedCompany.registration_number}</p>
      <p><strong>Industry:</strong> {selectedCompany.industry}</p>
      <p><strong>Website:</strong> {selectedCompany.website}</p>
      <p><strong>Description:</strong> {selectedCompany.description}</p>
      <p>
        <strong>Address:</strong> {selectedCompany.address_line1}{" "}
        {selectedCompany.address_line2 ? selectedCompany.address_line2 : ""},{" "}
        {selectedCompany.city}, {selectedCompany.state}, {selectedCompany.postal_code}, {selectedCompany.country}
      </p>
      <p><strong>Phone:</strong> {selectedCompany.phone}</p>
      <p><strong>Email:</strong> {selectedCompany.email}</p>
      {selectedCompany.tax_card_image && (
        
          <img src={url +selectedCompany.tax_card_image}  alt="" />
        
      )}
      {selectedCompany.commercial_registration_image && (
        
          <img src={url +selectedCompany.commercial_registration_image} alt=""/>
        
      )}
      <div className="mt-4 flex justify-end">
        <button
          className="bg-gray-500 text-white px-3 py-1 rounded"
          onClick={() => setIsModalOpen(false)}
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
