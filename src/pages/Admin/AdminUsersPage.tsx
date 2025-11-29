import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params: any = {
        page: currentPage,
        search,
        role: roleFilter,
      };
      const res = await axiosInstance.get("/api/auth/admin/users/", { params });
      setUsers(res.data.results);
      setTotalPages(Math.ceil(res.data.count / perPage));
    } catch (error) {
      console.error(error);
    }
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const toggleActive = async (user: User) => {
    try {
      await axiosInstance.patch(`/api/auth/admin/users/${user.id}/`, {
        is_active: !user.is_verified,
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(`/api/auth/admin/users/${id}/`);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          className="border p-2 rounded flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="individual">Individual</option>
          <option value="company_staff">Company Staff</option>
          <option value="company_admin">Company Admin</option>
          <option value="affiliate">Affiliate</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Phone</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Verified</th>
              <th className="py-2 px-4 text-left">Company</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{u.full_name}</td>
                <td className="py-2 px-4">{u.email}</td>
                <td className="py-2 px-4">{u.phone}</td>
                <td className="py-2 px-4 capitalize">{u.role.replace("_", " ")}</td>
                <td className="py-2 px-4">{u.is_verified ? "Yes" : "No"}</td>
                <td className="py-2 px-4">{u.company_name || "-"}</td>
                <td className="py-2 px-4 flex gap-2 flex-wrap">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() => openViewModal(u)}
                  >
                    View
                  </button>
                  <button
                    className={`px-2 py-1 rounded text-white ${
                      u.is_verified ? "bg-red-500" : "bg-green-500"
                    }`}
                    onClick={() => toggleActive(u)}
                  >
                    {u.is_verified ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>
        <span className="px-3 py-1">
          {currentPage} / {totalPages}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">User Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <p><strong>Name:</strong> {selectedUser.full_name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Verified:</strong> {selectedUser.is_verified ? "Yes" : "No"}</p>
              <p><strong>Points:</strong> {selectedUser.points}</p>
              <p><strong>Affiliate Code:</strong> {selectedUser.affiliate_code || "-"}</p>
              <p><strong>Address:</strong> {selectedUser.address || "-"}</p>
              <p><strong>Date Joined:</strong> {new Date(selectedUser.date_joined).toLocaleString()}</p>
            </div>

            {selectedUser.company && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Company Details</h3>
                <p><strong>Name:</strong> {selectedUser.company.name}</p>
                <p><strong>Email:</strong> {selectedUser.company.email}</p>
                <p><strong>Status:</strong> {selectedUser.company.approval_status}</p>
                {selectedUser.company.rejection_reason && <p><strong>Rejection Reason:</strong> {selectedUser.company.rejection_reason}</p>}
                <div className="flex gap-4 mt-2">
                  {selectedUser.company.tax_card_image && (
                    <img src={selectedUser.company.tax_card_image} alt="Tax Card" className="w-24 h-24 object-cover border" />
                  )}
                  {selectedUser.company.commercial_registration_image && (
                    <img src={selectedUser.company.commercial_registration_image} alt="CR" className="w-24 h-24 object-cover border" />
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded"
                onClick={() => setIsViewModalOpen(false)}
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
