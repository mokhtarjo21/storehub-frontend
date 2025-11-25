import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  LinkIcon,
  PhotoIcon,
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

const API_BASE_URL = "http://192.168.1.7:8000/api";

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
        language === "ar" ? "فشل في جلب العلامات" : "Failed to load brands"
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
      const fields = [
        brand.name,
        brand.description || "",
        brand.website || "",
      ]
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
          ? "هل تريد حذف هذه العلامة؟"
          : "Delete this brand permanently?"
      )
    )
      return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_BASE_URL}/products/brands/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Delete failed");
      }
      toast.success(language === "ar" ? "تم حذف العلامة" : "Brand deleted");
      setBrands((prev) => prev.filter((brand) => brand.id !== id));
    } catch (error) {
      console.error(error);
      toast.error(language === "ar" ? "فشل الحذف" : "Failed to delete brand");
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
    <div className="min-h-[70vh] p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-3 w-full md:w-1/2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === "ar" ? "ابحث عن علامة..." : "Search brands..."
            }
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-sm"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>{language === "ar" ? "إضافة علامة" : "Add brand"}</span>
          </button>
          <button
            onClick={loadBrands}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {language === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الشعار" : "Logo"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الاسم" : "Name"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الموقع" : "Website"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الوصف" : "Description"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الحالة" : "Status"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "التحكم" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500 dark:text-gray-400"
                >
                  {language === "ar" ? "جارٍ التحميل..." : "Loading brands..."}
                </td>
              </tr>
            ) : filteredBrands.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500 dark:text-gray-400"
                >
                  {language === "ar" ? "لا توجد علامات" : "No brands found"}
                </td>
              </tr>
            ) : (
              filteredBrands.map((brand) => (
                <tr
                  key={brand.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                >
                  <td className="px-4 py-3">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-16 h-16 rounded object-cover border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <PhotoIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {brand.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">
                          {brand.website}
                        </span>
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    <p className="line-clamp-2">
                      {brand.description || (language === "ar" ? "—" : "—")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(brand)}
                        className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition"
                        title={language === "ar" ? "تعديل" : "Edit"}
                      >
                        <PencilSquareIcon className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                        title={language === "ar" ? "حذف" : "Delete"}
                      >
                        <TrashIcon className="w-5 h-5 text-red-700 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
        language === "ar" ? "تم حفظ العلامة" : "Brand saved successfully"
      );
      onSaved(data);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message ||
          (language === "ar" ? "فشل الحفظ" : "Failed to save brand")
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {initial
                    ? language === "ar"
                      ? "تعديل العلامة"
                      : "Edit brand"
                    : language === "ar"
                    ? "إضافة علامة"
                    : "Add brand"}
                </Dialog.Title>
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الاسم" : "Name"}
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الموقع" : "Website"}
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الوصف" : "Description"}
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الشعار" : "Logo"}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {language === "ar" ? "نشط" : "Active"}
                  </label>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                    >
                      {submitting
                        ? language === "ar"
                          ? "جاري الحفظ..."
                          : "Saving..."
                        : language === "ar"
                        ? "حفظ"
                        : "Save"}
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

