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

    // داخل AdminCompaniesPage.tsx

// AdminCompaniesPage.tsx
const openCompanyModal = async (company: Company) => {
  try {
    
    
    setSelectedCompany(company); // البيانات الكاملة من السيرفر
    console.log(company);
    
    setIsModalOpen(true);
  } catch (error) {
    console.error("Failed to fetch company details:", error);
    alert("Failed to load company details");
  }
};
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-900 font-medium break-words">{value || "-"}</span>
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
      const res = await axiosInstance.get("/api/auth/admin/companies/", { params });
      setCompanies(res.data.results);
      setTotalPages(Math.ceil(res.data.count / perPage));
    } catch (error) {
      console.error(error);
    }
  };



  const toggleActive = async (company: Company) => {
    try {
        if (company.approval_status === "rejected" || company.approval_status === "pending") {
      await axiosInstance.post(`/api/auth/admin/companies/${company.id}/approve/`, {
     action:"approve"
      });}
        else {

          
        await axiosInstance.post(`/api/auth/admin/companies/${company.id}/approve/`, {   

        action:"reject",
        reason:rejectReason
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
                  onClick={() => openCompanyModal(company)}
                >
                  View
                </button>
               <button
  className={`px-2 py-1 rounded ${
    company.approval_status === "approved"
      ? "bg-yellow-500"
      : "bg-red-500"
  } text-white`}
  onClick={() => {
    if (company.approval_status === "pending" || company.approval_status === "approved") {
      setCompanyToReject(company);
      setIsRejectModalOpen(true);
    } else {
      toggleActive(company);
    }
  }}
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
{isModalOpen && selectedCompany && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-slideUp">
      
      {/* Header */}
   {/* Header */}
<div className="p-5 border-b flex items-center justify-between">
  <h2 className="text-xl font-semibold text-gray-800">
    Company Details
  </h2>

  <button
    onClick={() => setIsModalOpen(false)}
    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
  >
    ✕
  </button>
</div>


      {/* Content */}
      <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
        <DetailRow label="Name" value={selectedCompany.name} />
        <DetailRow label="Registration Number" value={selectedCompany.registration_number} />
        <DetailRow label="Industry" value={selectedCompany.industry} />
        <DetailRow label="Website" value={selectedCompany.website} />
        <DetailRow label="Description" value={selectedCompany.description} />

        <DetailRow
          label="Address"
          value={`${selectedCompany.address_line1 || ""} ${
            selectedCompany.address_line2 || ""
          }, ${selectedCompany.city}, ${selectedCompany.state}, ${
            selectedCompany.postal_code
          }, ${selectedCompany.country}`}
        />
        <DetailRow label="Full Address" value={selectedCompany.full_address} />
        <DetailRow label="Approval Status" value={selectedCompany.approval_status} />
        <DetailRow label="Active" value={selectedCompany.is_active ? "Yes" : "No"} />
        <DetailRow label="employee_count" value={selectedCompany.employee_count} />
        <DetailRow label="Phone" value={selectedCompany.phone} />
        <DetailRow label="Email" value={selectedCompany.email} />

        {/* Images */}
        {selectedCompany.tax_card_image && (
          <div>
            <p className="font-medium text-gray-700 mb-1">Tax Card</p>
            <img
              src={selectedCompany.tax_card_image}
              alt="Tax Card"
              className="rounded-lg border shadow-sm w-full object-cover"
            />
          </div>
        )}

        {selectedCompany.commercial_registration_image && (
          <div>
            <p className="font-medium text-gray-700 mb-1">Commercial Registration</p>
            <img
              src={selectedCompany.commercial_registration_image}
              alt="CR"
              className="rounded-lg border shadow-sm w-full object-cover"
            />
          </div>
        )}
      </div>
{/* Footer */}
<div className="p-4 border-t bg-gray-50 flex justify-end">
  <button
    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition shadow-sm"
    onClick={() => setIsModalOpen(false)}
  >
    Close
  </button>
</div>

    </div>
  </div>
)}
{isRejectModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Reject Company</h2>

      <label className="block text-gray-600 mb-2">Reason for rejection:</label>
      <textarea
        className="w-full border rounded p-2 min-h-[120px]"
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        placeholder="Write the rejection reason..."
      />

      <div className="flex justify-end gap-3 mt-4">
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded"
          onClick={() => {
            setIsRejectModalOpen(false);
            setRejectReason("");
          }}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-red-600 text-white rounded"
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
