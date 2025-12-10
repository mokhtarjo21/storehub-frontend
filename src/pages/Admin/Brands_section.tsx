import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  LinkIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

type BrandItem = {
  id: number;
  name: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
};

const API_BASE_URL = "http://72.60.181.116:8000/api";

export default function AdminBrandsSection() {
  const { language } = useLanguage();
  const { fetchbrands } = useAuth();
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BrandItem | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await fetchbrands();
      const data = res.results ?? res.data ?? res;
      if (Array.isArray(data)) {
        setBrands(data);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        language === "ar"
          ? "فشل في جلب العلامات التجارية"
          : "Failed to load brands"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBrands = useMemo(() => {
    if (!query.trim()) return brands;
    const q = query.toLowerCase();
    return brands.filter((brand) => {
      const fields = [brand.name, brand.description || "", brand.website || ""]
        .join(" ")
        .toLowerCase();
      return fields.includes(q);
    });
  }, [brands, query]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (brand: BrandItem) => {
    setEditing(brand);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        language === "ar"
          ? "هل أنت متأكد من حذف هذه العلامة التجارية؟"
          : "Are you sure you want to delete this brand?"
      )
    )
      return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/products/brands/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Delete failed");
      }
      toast.success(
        language === "ar"
          ? "تم حذف العلامة التجارية"
          : "Brand deleted successfully"
      );
      setBrands((prev) => prev.filter((brand) => brand.id !== id));
    } catch (error) {
      console.error(error);
      toast.error(
        language === "ar" ? "فشل في الحذف" : "Failed to delete brand"
      );
    }
  };

  const handleSaved = (saved: BrandItem) => {
    setShowForm(false);
    setEditing(null);
    setBrands((prev) => {
      const exists = prev.find((b) => b.id === saved.id);
      if (exists) {
        return prev.map((b) => (b.id === saved.id ? saved : b));
      }
      return [saved, ...prev];
    });
  };

  return (
    <div className="min-h-[70vh] p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        <div className="flex gap-3 w-full lg:w-1/2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === "ar" ? "ابحث عن علامة تجارية..." : "Search brands..."
            }
            className={`flex-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              language === "ar" ? "text-right" : "text-left"
            }`}
            dir={language === "ar" ? "rtl" : "ltr"}
          />
        </div>
        <div
          className={`flex items-center gap-2 ${
            language === "ar" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-sm text-sm sm:text-base"
          >
            <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>
              {language === "ar" ? "إضافة علامة تجارية" : "Add Brand"}
            </span>
          </button>
          <button
            onClick={loadBrands}
            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm sm:text-base"
          >
            {language === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-max w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {/* Logo */}
                <th
                  className={`px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الشعار" : "Logo"}
                </th>

                {/* Name */}
                <th
                  className={`px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الاسم" : "Name"}
                </th>

                {/* Website */}
                <th
                  className={`px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap  ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الموقع الإلكتروني" : "Website"}
                </th>

                {/* Description  */}
                <th
                  className={`px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap  ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الوصف" : "Description"}
                </th>

                {/* Status */}
                <th
                  className={`px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {language === "ar" ? "الحالة" : "Status"}
                </th>

                {/* Actions */}
                <th
                  className={`px-3 py-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap ${
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
                  <td
                    colSpan={6}
                    className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base"
                  >
                    {language === "ar"
                      ? "جارٍ التحميل..."
                      : "Loading brands..."}
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base"
                  >
                    {language === "ar"
                      ? "لا توجد علامات تجارية"
                      : "No brands found"}
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                  >
                    {/* Logo */}
                    <td className="px-3 py-3">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        <PhotoIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
                      )}
                    </td>

                    {/* Name */}
                    <td
                      className={`px-3 py-3 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {brand.name}
                        </div>
                      </div>
                    </td>

                    {/* Website */}
                    <td
                      className={`px-3 py-3  ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span className="truncate max-w-[150px]">
                            {brand.website}
                          </span>
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td
                      className={`px-3 py-3  ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xs">
                        {brand.description || "—"}
                      </p>
                    </td>

                    {/* Status */}
                    <td
                      className={`px-3 py-3 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          brand.is_active
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                            : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                        }`}
                      >
                        {brand.is_active
                          ? language === "ar"
                            ? "نشط"
                            : "Active"
                          : language === "ar"
                          ? "غير نشط"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className={`px-3 py-3 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(brand)}
                          className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition"
                        >
                          <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-700 dark:text-yellow-400" />
                        </button>

                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                        >
                          <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-700 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <BrandForm
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
          initial={editing}
        />
      )}
    </div>
  );
}

function BrandForm({
  onClose,
  onSaved,
  initial,
}: {
  onClose: () => void;
  onSaved: (brand: BrandItem) => void;
  initial: BrandItem | null;
}) {
  const { language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("name", name);
      if (website) formData.append("website", website);
      if (description) formData.append("description", description);
      formData.append("is_active", String(Number(isActive)));
      if (logoFile) formData.append("logo", logoFile);

      let url = `${API_BASE_URL}/products/brands/`;
      let method: "POST" | "PUT" = "POST";
      if (initial?.id) {
        url = `${API_BASE_URL}/products/brands/${initial.id}/`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Save failed");
      }

      toast.success(
        language === "ar"
          ? "تم حفظ العلامة التجارية بنجاح"
          : "Brand saved successfully"
      );
      onSaved(data);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message ||
          (language === "ar"
            ? "فشل في حفظ العلامة التجارية"
            : "Failed to save brand")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 text-left shadow-xl transition-all mx-2">
                {/* Header */}
                <div
                  className={`flex items-center justify-between mb-4 sm:mb-6 ${
                    language === "ar" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Dialog.Title
                    className={`text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex-1 ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {initial
                      ? language === "ar"
                        ? "تعديل العلامة التجارية"
                        : "Edit Brand"
                      : language === "ar"
                      ? "إضافة علامة تجارية جديدة"
                      : "Add New Brand"}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-4 sm:space-y-6">
                  {/* Name */}
                  <div
                    className={language === "ar" ? "text-right" : "text-left"}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === "ar"
                        ? "اسم العلامة التجارية"
                        : "Brand Name"}{" "}
                      *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                      placeholder={
                        language === "ar"
                          ? "أدخل اسم العلامة التجارية"
                          : "Enter brand name"
                      }
                      dir={language === "ar" ? "rtl" : "ltr"}
                    />
                  </div>

                  {/* Website */}
                  <div
                    className={language === "ar" ? "text-right" : "text-left"}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === "ar" ? "الموقع الإلكتروني" : "Website"}
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                      dir="ltr"
                    />
                  </div>

                  {/* Description */}
                  <div
                    className={language === "ar" ? "text-right" : "text-left"}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === "ar" ? "الوصف" : "Description"}
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                      placeholder={
                        language === "ar"
                          ? "أدخل وصف العلامة التجارية"
                          : "Enter brand description"
                      }
                      dir={language === "ar" ? "rtl" : "ltr"}
                    />
                  </div>

                  {/* Logo Upload */}
                  <div
                    className={language === "ar" ? "text-right" : "text-left"}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === "ar"
                        ? "شعار العلامة التجارية"
                        : "Brand Logo"}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 ${
                        language === "ar"
                          ? "file:ml-4 file:mr-0 text-right"
                          : "file:mr-4 text-left"
                      }`}
                      dir={language === "ar" ? "rtl" : "ltr"}
                    />
                  </div>

                  {/* Active Checkbox */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === "ar" ? "علامة تجارية نشطة" : "Active Brand"}
                    </span>
                  </label>

                  {/* Actions */}
                  <div
                    className={`flex flex-col-reverse gap-3 ${
                      language === "ar"
                        ? "sm:flex-row-reverse justify-end"
                        : "sm:flex-row justify-end"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex-1 sm:flex-none"
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium flex-1 sm:flex-none"
                    >
                      {submitting
                        ? language === "ar"
                          ? "جاري الحفظ..."
                          : "Saving..."
                        : language === "ar"
                        ? "حفظ العلامة التجارية"
                        : "Save Brand"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
