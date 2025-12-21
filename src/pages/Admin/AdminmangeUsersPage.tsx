import { useEffect, useState } from "react";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../utils/axiosInstance";
import AdminUserForm from "../../components/CreateAndUpdateAdmin";
import { useLanguage } from "../../contexts/LanguageContext";
import { PlusCircleIcon, TrashIcon } from "lucide-react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

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
const getRoleDisplayName = (role) => {
    switch (role) {
      case "super":
        return language === "ar" ? "مشرف فائق" : "Super Admin";
      case "admin":
        return language === "ar" ? "مشرف" : "Admin";
        case "moderator":
        return language === "ar" ? "مشرف محتوى" : "Moderator";
      default:
        return role;
    }
  };
  return (
    <div className="p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center mb-6">
        <h1
          className={`text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white ${
            language === "ar" ? "text-right" : "text-left"
          }`}
        >
          {t("admin_users")}
        </h1>
        <button
          onClick={() => {
            setSelectedAdmin(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-sm"
        >
          <PlusCircleIcon className="w-5 h-5" />
          {t("add_admin")}
        </button>
      </div>

      {loading ? (
        <p>{t("loading")}</p>
      ) : (
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-300 ">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900 tracking-wider">{t("email")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900 tracking-wider">{t("name")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900 tracking-wider">{t("role")}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900 tracking-wider">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wider">
                    {admin.email}
                  </td>
                  <td className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wider">
                    {admin.full_name}
                  </td>
                  <td className="px-4 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wider">
                    {/* {admin.role_admin} */}
                    {getRoleDisplayName(admin.role_admin)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-start text-sm">
                    <div className="flex gap-2 rtl:gap-2">
                      <button
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowForm(true);
                        }}
                        className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors duration-200"
                      >
                        <PencilSquareIcon className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                      >
                        <TrashIcon className="w-5 h-5 text-red-700 dark:text-red-400" />
                      </button>
                    </div>
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
