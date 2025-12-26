import { useEffect, useRef, useState } from "react";
import { createAdmin, updateAdmin } from "../utils/axiosInstance";
import { useLanguage } from "../contexts/LanguageContext";
import toast from "react-hot-toast";
import { Mail, User, Shield } from "lucide-react";

export default function AdminUserForm({ admin, onClose, onSuccess }) {
  const [form, setForm] = useState({
    email: admin?.email || "",
    full_name: admin?.full_name || "",
    role_admin: admin?.role_admin || "admin",
  });

  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const { t, isRTL } = useLanguage();

  /* ================= Esc Key Close ================= */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* ================= Outside Click Close ================= */
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  /* ================= Submit ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      if (admin) {
        await updateAdmin(admin.id, form);
      } else {
        await createAdmin(form);
      }
      toast.success(t("common.saved_successfully") || "Saved successfully");
      onSuccess();
      onClose();
    } catch (error) {
      const errData = error.response?.data;
      if (errData) {
        const messages = Object.values(errData).flat().join(" | ");
        toast.error(messages);
      } else {
        toast.error(t("common.error") || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      dir={isRTL ? "rtl" : "ltr"}
      onClick={handleOverlayClick}
    >
      {/* Modal */}
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 sm:p-8 animate-fadeIn"
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {admin ? t("edit_admin") : t("add_admin")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("admin_form_description") || "Enter admin details"}
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
            {t("email")}
          </label>
          <div className="relative">
            <Mail
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${
                isRTL ? "right-3" : "left-3"
              }`}
            />
            <input
              className={`w-full rounded-lg border dark:text-gray-50
border-gray-300 dark:border-gray-700
bg-white dark:bg-gray-800
py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"}
`}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
            {t("checkout.name")}
          </label>
          <div className="relative">
            <User
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${
                isRTL ? "right-3" : "left-3"
              }`}
            />
            <input
              className={`w-full rounded-lg border dark:text-gray-50
border-gray-300 dark:border-gray-700
bg-white dark:bg-gray-800
py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"}
`}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Role */}
        <div className="mb-6">
          <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
            {t("role")}
          </label>
          <div className="relative">
            <Shield
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${
                isRTL ? "right-3" : "left-3"
              }`}
            />
            <select
              className={`w-full rounded-lg border dark:text-gray-50
border-gray-300 dark:border-gray-700
bg-white dark:bg-gray-800
py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"}
`}
              value={form.role_admin}
              onChange={(e) => setForm({ ...form, role_admin: e.target.value })}
            >
              <option value="admin">{t("admin")}</option>
              <option value="moderator">{t("moderator")}</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div
          className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end ${
            isRTL ? "sm:flex-row-reverse" : ""
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto rounded-lg border dark:text-gray-50 border-gray-300 dark:border-gray-700 px-4 py-2 text-sm disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {t("common.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
