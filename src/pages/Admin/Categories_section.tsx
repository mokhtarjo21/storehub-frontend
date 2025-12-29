import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
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

const apiBase = import.meta.env.VITE_API_BASE;
const API_BASE_URL = apiBase + "/api";

export default function AdminCategoriesSection() {
  const { language } = useLanguage();
  const { fetchcategories } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetchcategories({
        page: currentPage,
        page_size: pageSize,
        search: query || undefined,
      });

      setCategories(res.results ?? []);
      setTotalPages(Math.max(1, Math.ceil(res.count / pageSize)));
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
  }, [currentPage, query]);

  // const filtered = useMemo(() => {
  //   if (!query.trim()) return categories;
  //   const q = query.toLowerCase();
  //   return categories.filter((category) => {
  //     const text = [
  //       category.name,
  //       category.name_ar || "",
  //       category.description || "",
  //       category.description_ar || "",
  //     ]
  //       .join(" ")
  //       .toLowerCase();
  //     return text.includes(q);
  //   });
  // }, [categories, query]);

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
    <div
      className="min-h-screen p-4 sm:p-6 bg-gray-50 dark:bg-gray-900"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex gap-3 w-full lg:w-1/2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              language === "ar" ? "ابحث عن فئة..." : "Search categories..."
            }
            className="flex-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-sm text-sm sm:text-base"
          >
            <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{language === "ar" ? "إضافة فئة" : "Add category"}</span>
          </button>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            dir={language === "ar" ? "rtl" : "ltr"}
            className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 whitespace-nowrap"
          >
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th
                  className="px-4 py-3 text-left rtl:text-right
 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {language === "ar" ? "الصورة" : "Image"}
                </th>
                <th
                  className="px-4 py-3 text-left rtl:text-right
 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {language === "ar" ? "الاسم" : "Name"}
                </th>
                <th
                  className="px-4 py-3 text-left rtl:text-right
 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {language === "ar" ? "الوصف" : "Description"}
                </th>
                <th
                  className="px-4 py-3 text-left rtl:text-right
 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {language === "ar" ? "عدد المنتجات" : "Products"}
                </th>
                <th
                  className="px-4 py-3 text-left rtl:text-right
 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {language === "ar" ? "الحالة" : "Status"}
                </th>
                <th
                  className="px-4 py-3 text-left rtl:text-right
 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {language === "ar" ? "التحكم" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base"
                  >
                    {language === "ar"
                      ? "جارٍ التحميل..."
                      : "Loading categories"}
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm sm:text-base"
                  >
                    {language === "ar" ? "لا توجد فئات" : "No categories found"}
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                  >
                    {/* Image */}
                    <td className="px-4 py-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0 object-contain"
                        />
                      ) : (
                        <PhotoIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                          {language === "ar"
                            ? category.name_ar || category.name
                            : category.name}
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {language === "ar"
                          ? category.description_ar ||
                            category.description ||
                            "—"
                          : category.description || "—"}
                      </p>
                    </td>

                    {/* Product Count */}
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {category.product_count ?? 0}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
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

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition flex-shrink-0"
                          title={language === "ar" ? "تعديل" : "Edit"}
                        >
                          <PencilSquareIcon className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition flex-shrink-0"
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
      {/* Pagination */}
      <div
        className={`flex items-center gap-6 justify-center mt-4 ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        <div className="flex gap-2">
          <button
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            {language === "ar" ? "السابق" : "Previous"}
          </button>
          {/* Page Info */}
          <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
            {language === "ar"
              ? `الصفحة ${currentPage} من ${totalPages}`
              : `Page ${currentPage} of ${totalPages}`}
          </span>
          <button
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            {language === "ar" ? "التالي" : "Next"}
          </button>
        </div>
      </div>
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
  const [imageError, setImageError] = useState<string | null>(null);
  const MAX_FILE_SIZE_MB = 1;
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
              <Dialog.Panel
                dir={language === "ar" ? "rtl" : "ltr"}
                className="w-full max-w-2xl lg:max-w-3xl transform overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 text-left shadow-xl transition-all mx-2"
              >
                {/* Header */}
                <div
                  className={`flex items-center justify-between pb-6 ${
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
                        ? "تعديل الفئة"
                        : "Edit category"
                      : language === "ar"
                      ? "إضافة فئة"
                      : "Add category"}
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
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 gap-4">
                    <div
                      className={language === "ar" ? "text-right" : "text-left"}
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === "ar" ? "الاسم (إنجليزي)" : "Name (EN)"} *
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
                            ? "أدخل الاسم بالإنجليزية"
                            : "Enter name in English"
                        }
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div
                      className={language === "ar" ? "text-right" : "text-left"}
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === "ar" ? "الاسم (عربي)" : "Name (AR)"}
                      </label>
                      <input
                        value={nameAr}
                        onChange={(e) => setNameAr(e.target.value)}
                        className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                        placeholder={
                          language === "ar"
                            ? "أدخل الاسم بالعربية"
                            : "Enter name in Arabic"
                        }
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                  </div>

                  {/* Description Fields */}
                  <div className="grid grid-cols-1 gap-4">
                    <div
                      className={language === "ar" ? "text-right" : "text-left"}
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                        className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                        style={{ overflow: "hidden" }}
                        placeholder={
                          language === "ar"
                            ? "أدخل الوصف بالإنجليزية"
                            : "Enter description in English"
                        }
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div
                      className={language === "ar" ? "text-right" : "text-left"}
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === "ar"
                          ? "الوصف (عربي)"
                          : "Description (AR)"}
                      </label>
                      <textarea
                        rows={3}
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                        placeholder={
                          language === "ar"
                            ? "أدخل الوصف بالعربية"
                            : "Enter description in Arabic"
                        }
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div
                    className={language === "ar" ? "text-right" : "text-left"}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === "ar" ? "الصورة" : "Image"}
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
                    <p className="mt-1 text-sm text-[#E97132] dark:text-[#E97132]">
                      {language === "ar"
                        ? `أقصى حجم مسموح للصورة: ${MAX_FILE_SIZE_MB}MB`
                        : `Maximum allowed image size: ${MAX_FILE_SIZE_MB}MB`}
                    </p>

                    {imageError && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {imageError}.{" "}
                        {language === "ar"
                          ? `الحجم الأقصى: ${MAX_FILE_SIZE_MB}MB`
                          : `Max size: ${MAX_FILE_SIZE_MB}MB`}
                      </p>
                    )}
                  </div>

                  {/* Active Checkbox */}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 `}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === "ar" ? "فئة نشطة" : "Active category"}
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
                        ? "حفظ الفئة"
                        : "Save Category"}
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
