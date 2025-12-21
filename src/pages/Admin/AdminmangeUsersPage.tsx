import { useEffect, useState } from "react";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../utils/axiosInstance";
import AdminUserForm from "../../components/CreateandUpdateAdmin";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AdminMangeUsersPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { t, language, isRTL } = useLanguage();

  const fetchAdmins = async () => {
    setLoading(true);
    const res = await getAdmins();
    setAdmins(res.data.results);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm(t("delete_confirmation"))) return;
    await deleteAdmin(id);
    fetchAdmins();
  };

  return (
    <div className="p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("admin_users")}</h1>
        <button
          onClick={() => {
            setSelectedAdmin(null);
            setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + {t("add_admin")}
        </button>
      </div>

      {loading ? (
        <p>{t("loading")}</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">{t("email")}</th>
                <th className="p-3">{t("name")}</th>
                <th className="p-3">{t("role")}</th>
                <th className="p-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-t">
                  <td className="p-3">{admin.email}</td>
                  <td className="p-3 text-center">{admin.full_name}</td>
                  <td className="p-3 text-center">{admin.role_admin}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      {t("edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-600 hover:underline"
                    >
                      {t("delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <AdminUserForm
          admin={selectedAdmin}
          onClose={() => setShowForm(false)}
          onSuccess={fetchAdmins}
        />
      )}
    </div>
  );
}
