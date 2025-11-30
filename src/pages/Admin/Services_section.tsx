import React, { useEffect, useMemo, useState } from "react";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE_URL = "http://192.168.1.7:8000";

type Category = { id: number; name: string; name_ar?: string };

type ServiceListItem = {
  id: number;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  slug?: string;
  price: string;
  deposit_required: string;
  duration: string;
  custom_duration?: string | null;
  category: number;
  category_name?: string;
  image?: string;
  is_active: boolean;
  is_featured: boolean;
  display_price?: string;
  display_deposit?: string;
  created_at?: string;
  updated_at?: string;
};

export default function AdminServicesSection() {
  const { language } = useLanguage();

  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | number>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ServiceListItem | null>(null);
  const { fetchServices, isLoading, fetchcategories } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const getServices = async () => {
    const [servicesData] = await Promise.allSettled([fetchServices()]);
    if (servicesData.status === "fulfilled") {
      const value = servicesData.value as any;
      const cdata = value?.results ?? value?.data ?? value;
      if (Array.isArray(cdata)) {
        setServices(cdata);
      }
    }
  };

  const getCategories = async () => {
    const [categoriesData] = await Promise.allSettled([fetchcategories()]);
    if (categoriesData.status === "fulfilled") {
      const value = categoriesData.value as any;
      const cdata = value?.results ?? value?.data ?? value;
      if (Array.isArray(cdata)) {
        setCategories(cdata);
      }
    }
  };

  useEffect(() => {
    getServices();
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory = categoryFilter
        ? String(service.category) === String(categoryFilter)
        : true;
      if (!matchesCategory) return false;

      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const title =
        (language === "ar"
          ? service.title_ar || service.title
          : service.title || ""
        )?.toLowerCase() || "";
      const desc =
        (language === "ar"
          ? service.description_ar || service.description
          : service.description || ""
        )?.toLowerCase() || "";
      const categoryName = (service.category_name || "").toLowerCase();
      return title.includes(q) || desc.includes(q) || categoryName.includes(q);
    });
  }, [services, query, categoryFilter, language]);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        language === "ar" ? "هل تريد حذف هذه الخدمة؟" : "Delete this service?"
      )
    )
      return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE_URL}/api/products/admin/services/${id}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        toast.success(
          language === "ar" ? "تم الحذف بنجاح" : "Deleted successfully"
        );
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(language === "ar" ? "خطأ أثناء الحذف" : "Delete failed");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (s: ServiceListItem) => {
    setEditing(s);
    setShowForm(true);
  };

  const onFormSaved = (saved: ServiceListItem) => {
    setShowForm(false);
    setEditing(null);
    setServices((prev) => {
      const exists = prev.find((x) => x.id === saved.id);
      if (exists) return prev.map((x) => (x.id === saved.id ? saved : x));
      return [saved, ...prev];
    });
    getServices();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([getServices(), getCategories()]);
    setRefreshing(false);
  };

  return (
    <div className="min-h-[70vh] p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2 w-full md:w-1/2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === "ar" ? "ابحث عن خدمة..." : "Search services..."
            }
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">
              {language === "ar" ? "كل الفئات" : "All categories"}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {language === "ar" ? c.name_ar || c.name : c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-sm"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>{language === "ar" ? "إضافة خدمة" : "Add service"}</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-60"
          >
            {refreshing
              ? language === "ar"
                ? "جاري التحديث..."
                : "Refreshing..."
              : language === "ar"
              ? "تحديث"
              : "Refresh"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "صورة" : "Image"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "العنوان" : "Title"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الفئة" : "Category"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "السعر" : "Price"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "العربون" : "Deposit"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "المدة" : "Duration"}
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
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-gray-500 dark:text-gray-400"
                >
                  {language === "ar" ? "جاري التحميل..." : "Loading..."}
                </td>
              </tr>
            ) : filteredServices.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-gray-500 dark:text-gray-400"
                >
                  {language === "ar" ? "لا توجد خدمات" : "No services found"}
                </td>
              </tr>
            ) : (
              filteredServices.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt={s.title}
                        className="w-16 h-16 object-fill rounded border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <PhotoIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {language === "ar" ? s.title_ar || s.title : s.title}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {s.category_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                    {s.display_price || `EGP ${Number(s.price).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {s.display_deposit ||
                      (Number(s.deposit_required) > 0
                        ? `EGP ${Number(s.deposit_required).toFixed(2)}`
                        : "—")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {s.duration === "custom" && s.custom_duration
                      ? s.custom_duration
                      : s.duration.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        s.is_active
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {s.is_active
                        ? language === "ar"
                          ? "نشط"
                          : "Active"
                        : language === "ar"
                        ? "غير نشط"
                        : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors duration-200"
                        title={language === "ar" ? "تعديل" : "Edit"}
                      >
                        <PencilSquareIcon className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
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
        <ServiceForm
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={onFormSaved}
          initial={editing}
          categories={categories}
        />
      )}
    </div>
  );
}

function ServiceForm({
  onClose,
  onSaved,
  initial,
  categories,
}: {
  onClose: () => void;
  onSaved: (s: ServiceListItem) => void;
  initial: ServiceListItem | null;
  categories: Category[];
}) {
  const { language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [titleAr, setTitleAr] = useState(initial?.title_ar ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(
    initial?.description_ar ?? ""
  );
  const [price, setPrice] = useState(initial?.price ?? "0");
  const [depositRequired, setDepositRequired] = useState(
    initial?.deposit_required ?? "0"
  );
  const [duration, setDuration] = useState(initial?.duration ?? "1-2_hours");
  const [customDuration, setCustomDuration] = useState(
    initial?.custom_duration ?? ""
  );
  const [categoryId, setCategoryId] = useState<number | "">(
    initial?.category ?? ""
  );
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const durationOptions = [
    { value: "1-2_hours", label: "1-2 Hours" },
    { value: "half_day", label: "Half Day (4 hours)" },
    { value: "full_day", label: "Full Day (8 hours)" },
    { value: "2-3_days", label: "2-3 Days" },
    { value: "1_week", label: "1 Week" },
    { value: "2_weeks", label: "2 Weeks" },
    { value: "1_month", label: "1 Month" },
    { value: "custom", label: "Custom Duration" },
  ];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error(
          language === "ar" ? "يرجى تسجيل الدخول" : "Please login first"
        );
        return;
      }

      // Validate required fields
      if (!title.trim()) {
        toast.error(language === "ar" ? "العنوان مطلوب" : "Title is required");
        return;
      }

      if (!categoryId) {
        toast.error(
          language === "ar" ? "الفئة مطلوبة" : "Category is required"
        );
        return;
      }

      const fd = new FormData();
      fd.append("title", title.trim());
      if (titleAr?.trim()) fd.append("title_ar", titleAr.trim());
      if (description?.trim()) fd.append("description", description.trim());
      if (descriptionAr?.trim())
        fd.append("description_ar", descriptionAr.trim());
      fd.append("price", String(price || "0"));
      fd.append("deposit_required", String(depositRequired || "0"));
      fd.append("duration", duration);
      if (duration === "custom" && customDuration?.trim()) {
        fd.append("custom_duration", customDuration.trim());
      }
      fd.append("category", String(categoryId));
      fd.append("is_active", String(Number(isActive)));
      fd.append("is_featured", String(Number(isFeatured)));
      if (imageFile) fd.append("image", imageFile);

      // Log FormData for debugging
      console.log("Submitting service:", {
        title,
        categoryId,
        price,
        duration,
        hasImage: !!imageFile,
      });

      let url = `${API_BASE_URL}/api/products/admin/services/`;
      let method = "POST";
      if (initial && initial.id) {
        url = `${API_BASE_URL}/api/products/admin/services/${initial.id}/update/`;
        method = "PUT";
      }

      console.log("API Request:", { url, method });

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok) {
        const saved = responseData;
        console.log("Service saved successfully:", saved);
        onSaved(saved);
        toast.success(
          language === "ar" ? "تم الحفظ بنجاح" : "Saved successfully"
        );
      } else {
        console.error("API Error Response:", responseData);
        const errorMessage =
          responseData.detail ||
          responseData.message ||
          (typeof responseData === "string" ? responseData : null) ||
          Object.values(responseData).flat().join(", ") ||
          `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error("Save error", err);
      const errorMessage =
        err?.message || (language === "ar" ? "فشل الحفظ" : "Failed to save");
      toast.error(errorMessage);
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                >
                  {initial
                    ? language === "ar"
                      ? "تعديل الخدمة"
                      : "Edit Service"
                    : language === "ar"
                    ? "إضافة خدمة"
                    : "Add Service"}
                </Dialog.Title>

                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar" ? "العنوان (إنجليزي)" : "Title (EN)"}
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar" ? "العنوان (عربي)" : "Title (AR)"}
                      </label>
                      <input
                        type="text"
                        value={titleAr}
                        onChange={(e) => setTitleAr(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar"
                          ? "الوصف (إنجليزي)"
                          : "Description (EN)"}
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar"
                          ? "الوصف (عربي)"
                          : "Description (AR)"}
                      </label>
                      <textarea
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar" ? "السعر" : "Price"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar" ? "العربون" : "Deposit"}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={depositRequired}
                        onChange={(e) => setDepositRequired(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar" ? "الفئة" : "Category"}
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) =>
                          setCategoryId(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        required
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">
                          {language === "ar" ? "اختر الفئة" : "Select category"}
                        </option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {language === "ar" ? c.name_ar || c.name : c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "المدة" : "Duration"}
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {durationOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {duration === "custom" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {language === "ar"
                          ? "المدة المخصصة"
                          : "Custom Duration"}
                      </label>
                      <input
                        type="text"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        placeholder={
                          language === "ar" ? "مثال: 12 ساعة" : "e.g., 12 hours"
                        }
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

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

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {language === "ar" ? "نشط" : "Active"}
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {language === "ar" ? "مميز" : "Featured"}
                      </span>
                    </label>
                  </div>

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
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
