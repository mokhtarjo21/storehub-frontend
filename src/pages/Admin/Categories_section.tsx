import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

type CategoryItem = {
  id: number;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  slug?: string;
  image?: string | null;
  sort_order?: number;
  is_active: boolean;
  product_count?: number;
};

const API_BASE_URL = "http://192.168.1.7:8000/api";

export default function AdminCategoriesSection() {
  const { language } = useLanguage();
  const { fetchcategories } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetchcategories();
      const data = res.results ?? res.data ?? res;
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        language === "ar" ? "فشل في جلب الفئات" : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase();
    return categories.filter((category) => {
      const text = [
        category.name,
        category.name_ar || "",
        category.description || "",
        category.description_ar || "",
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [categories, query]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (category: CategoryItem) => {
    setEditing(category);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        language === "ar"
          ? "هل تريد حذف هذه الفئة؟"
          : "Delete this category permanently?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_BASE_URL}/products/categories/${id}/`,
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
      toast.success(language === "ar" ? "تم حذف الفئة" : "Category deleted");
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (error) {
      console.error(error);
      toast.error(
        language === "ar" ? "فشل حذف الفئة" : "Failed to delete category"
      );
    }
  };

  const handleSaved = (saved: CategoryItem) => {
    setShowForm(false);
    setEditing(null);
    setCategories((prev) => {
      const exists = prev.find((c) => c.id === saved.id);
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? saved : c));
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
              language === "ar" ? "ابحث عن فئة..." : "Search categories..."
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
            <span>{language === "ar" ? "إضافة فئة" : "Add category"}</span>
          </button>
          <button
            onClick={loadCategories}
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
                {language === "ar" ? "الصورة" : "Image"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الاسم" : "Name"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الوصف" : "Description"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الترتيب" : "Sort order"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "عدد المنتجات" : "Products"}
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
                  colSpan={7}
                  className="p-6 text-center text-gray-500 dark:text-gray-400"
                >
                  {language === "ar" ? "جارٍ التحميل..." : "Loading categories"}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-gray-500 dark:text-gray-400"
                >
                  {language === "ar" ? "لا توجد فئات" : "No categories found"}
                </td>
              </tr>
            ) : (
              filtered.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                >
                  <td className="px-4 py-3">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 rounded object-cover border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <PhotoIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    <div>{category.name}</div>
                    {category.name_ar && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {category.name_ar}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    <p className="line-clamp-1">
                      {category.description || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {category.sort_order ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {category.product_count ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category.is_active
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200"
                          : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200"
                      }`}
                    >
                      {category.is_active
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
                        onClick={() => openEdit(category)}
                        className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition"
                        title={language === "ar" ? "تعديل" : "Edit"}
                      >
                        <PencilSquareIcon className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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
        <CategoryForm
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

function CategoryForm({
  onClose,
  onSaved,
  initial,
}: {
  onClose: () => void;
  onSaved: (category: CategoryItem) => void;
  initial: CategoryItem | null;
}) {
  const { language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [nameAr, setNameAr] = useState(initial?.name_ar ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(
    initial?.description_ar ?? ""
  );
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [sortOrder, setSortOrder] = useState<number | "">(
    initial?.sort_order ?? ""
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!slug && name) {
      setSlug(
        name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      );
    }
  }, [name, slug]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("name", name);
      if (nameAr) formData.append("name_ar", nameAr);
      if (description) formData.append("description", description);
      if (descriptionAr) formData.append("description_ar", descriptionAr);
      if (slug) formData.append("slug", slug);
      if (sortOrder !== "") formData.append("sort_order", String(sortOrder));
      formData.append("is_active", String(Number(isActive)));
      if (imageFile) formData.append("image", imageFile);

      let url = `${API_BASE_URL}/products/categories/`;
      let method: "POST" | "PUT" = "POST";
      if (initial?.id) {
        url = `${API_BASE_URL}/products/categories/${initial.id}/`;
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
        language === "ar" ? "تم حفظ الفئة بنجاح" : "Category saved successfully"
      );
      onSaved(data);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.message ||
          (language === "ar" ? "فشل الحفظ" : "Failed to save category")
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {initial
                    ? language === "ar"
                      ? "تعديل الفئة"
                      : "Edit category"
                    : language === "ar"
                    ? "إضافة فئة"
                    : "Add category"}
                </Dialog.Title>
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar" ? "الاسم (إنجليزي)" : "Name (EN)"}
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
                        {language === "ar" ? "الاسم (عربي)" : "Name (AR)"}
                      </label>
                      <input
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 line-clamp-1">
                        {language === "ar"
                          ? "الوصف (إنجليزي)"
                          : "Description (EN)"}
                      </label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          e.target.style.height = "auto";
                          e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        style={{ overflow: "hidden" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar"
                          ? "الوصف (عربي)"
                          : "Description (AR)"}
                      </label>
                      <textarea
                        rows={3}
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar" ? "المسار (Slug)" : "Slug"}
                      </label>
                      <input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar" ? "ترتيب العرض" : "Sort order"}
                      </label>
                      <input
                        type="number"
                        value={sortOrder as number | string}
                        onChange={(e) =>
                          setSortOrder(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الصورة" : "Image"}
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
