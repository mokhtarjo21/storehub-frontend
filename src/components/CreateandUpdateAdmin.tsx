import { useState } from "react";
import { createAdmin, updateAdmin } from "../utils/axiosInstance";
import { useLanguage } from "../contexts/LanguageContext";
import toast from "react-hot-toast";
export default function AdminUserForm({ admin, onClose, onSuccess }) {
  const [form, setForm] = useState({
    email: admin?.email || "",
    full_name: admin?.full_name || "",
    role_admin: admin?.role_admin || "admin",
  });

  const { t, language, isRTL } = useLanguage();

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (admin) {
      await updateAdmin(admin.id, form);
    } else {
      await createAdmin(form);
    }
    toast.success("Admin saved successfully");
    onSuccess();
    onClose();
  } catch (error) {
    console.error("Error creating/updating admin:", error);

    // Safely access backend validation errors
    const errData = error.response?.data;

    if (errData) {
      // Flatten all messages into one string
      const messages = Object.values(errData)
        .flat()
        .join(" | "); // or "\n" for new lines

      toast.error(messages);
    } else {
      toast.error("Error creating/updating admin");
    }
  }
};


  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      dir={isRTL ? "rtl" : "ltr"} // Support for right-to-left languages
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded w-full max-w-md"
        style={{ maxWidth: "70%" }} // Ensure responsiveness
      >
        <h2 className="text-xl font-semibold mb-4">
          {admin ? t("edit_admin") : t("add_admin")}
        </h2>

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder={t("email")}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder={t("checkout.name")}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />

        <select
          className="w-full border p-2 mb-4 rounded"
          value={form.role_admin}
          onChange={(e) => setForm({ ...form, role_admin: e.target.value })}
        >
          <option value="super">{t("super")}</option>
          <option value="admin">{t("admin")}</option>
          <option value="moderator">{t("moderator")}</option>
        </select>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            {t("common.cancel")}
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded">
            {t("common.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
