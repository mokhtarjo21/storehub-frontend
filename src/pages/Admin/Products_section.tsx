import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "../../components/Card";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  bulkAddProducts,
  downloadtempfile,
  bulkEditProducts,
  downloadProductsCSV,
} from "../../utils/axiosInstance";
import BulkProductUpload from "../../components/BulkUpload";
type Category = { id: number; name: string };
type Brand = { id: number; name: string };

type ProductListItem = {
  id: number;
  name: string;
  name_ar: string | null;
  description: string;
  description_ar: string | null;
  slug: string;
  price: string; // لأن القيمة وصلت كنص "1.00"
  compare_price: string | null;
  cost_price: string | null;
  stock: number;
  currency: string;
  low_stock_threshold: number;
  sku: string;
  barcode: string | null;
  weight: string | null;
  dimensions: string | null;
  category: Category | null;
  brand: Brand | null;
  product_type: string;
  product_role: string;
  image: string | null;
  datasheet: string | null;
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_digital: boolean;
  requires_shipping: boolean;
  average_rating: string;
  review_count: number;
  images: {
    id: number;
    image: string;
    alt_text?: string | null;
  }[];
  specifications: {
    id: number;
    name: string;
    name_ar: string;
    value: string;
    value_ar: string;
    sort_order: number;
  }[];
  discount_percentage: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string;
  brand_name?: string;
  primary_image?: string | null;
};

export default function AdminProductsSection() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | number>("");
  const [brandFilter, setBrandFilter] = useState<string | number>("");
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const { fetchProducts, fetchbrands, fetchcategories, deleteProduct } =
    useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductListItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalPages, setTotalPages] = useState(1);
  const getProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };

      if (query) params.search = query;
      if (categoryFilter) params.category = categoryFilter;
      if (brandFilter) params.brand = brandFilter;

      const res = await fetchProducts(params);

      const data = res.results ?? res;
      setProducts(Array.isArray(data) ? data : []);

      // ✅ حساب عدد الصفحات
      if (res.count) {
        setTotalPages(Math.ceil(res.count / pageSize));
      }
    } catch (err: any) {
      console.error("fetchProducts error", err);
      toast.error(
        language === "ar" ? "فشل في جلب المنتجات" : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };
  const downloaddata = async () => {
    const res = await downloadProductsCSV();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
  };
  const fetchCategoriesAndBrands = async () => {
    try {
      const [cRes, bRes] = await Promise.allSettled([
        fetchcategories(),
        fetchbrands(),
      ]);

      if (cRes.status === "fulfilled") {
        const cdata = (cRes.value.results ?? cRes.value.data) as Category[];
        if (Array.isArray(cdata)) setCategories(cdata);
      }
      if (bRes.status === "fulfilled") {
        const bdata = (bRes.value.results ?? bRes.value.data) as Brand[];
        if (Array.isArray(bdata)) setBrands(bdata);
      }
    } catch (e) {
      // ignore - selects will be manual
      console.warn("categories/brands fetch failed", e);
    }
  };
  useEffect(() => {
    fetchCategoriesAndBrands();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => getProducts(), 400);
    return () => clearTimeout(t);
  }, [query, categoryFilter, brandFilter, currentPage]);

  const handleDelete = async (id: number | string) => {
    if (
      !confirm(
        language === "ar" ? "هل تريد حذف هذا المنتج؟" : "Delete this product?"
      )
    )
      return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      toast.error(language === "ar" ? "خطأ أثناء الحذف" : "Delete failed");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: ProductListItem) => {
    setEditing(p);
    setShowForm(true);
  };

  const onFormSaved = (saved: ProductListItem) => {
    setShowForm(false);
    setEditing(null);
    setProducts((prev) => {
      const exists = prev.find((x) => x.id === saved.id);
      if (exists) return prev.map((x) => (x.id === saved.id ? saved : x));
      return [saved, ...prev];
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="mb-4 space-y-4">
        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              language === "ar" ? "ابحث عن منتج..." : "Search products..."
            }
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {language === "ar" ? "كل الفئات" : "All categories"}
            </option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {language === "ar" ? "كل العلامات" : "All brands"}
            </option>
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div
          className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-2 ${
            language === "ar" ? "lg:justify-start" : "lg:justify-end"
          }`}
        >
          <button
            onClick={openCreate}
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium ${
              language === "ar" ? "flex-row-reverse" : ""
            }`}
          >
            <PlusCircleIcon className="w-5 h-5" />
            {language === "ar" ? "إضافة منتج" : "Add product"}
          </button>

          <button
            onClick={downloaddata}
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium ${
              language === "ar" ? "flex-row-reverse" : ""
            }`}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {language === "ar" ? "استخراج المنتجات" : "Export products"}
          </button>

          <BulkProductUpload
            title={language === "ar" ? "إضافة جماعية" : "Bulk Add"}
            onUpload={bulkAddProducts}
            onDownloadTemplate={downloadtempfile}
          />

          <BulkProductUpload
            title={language === "ar" ? "تعديل جماعي" : "Bulk Edit"}
            onUpload={bulkEditProducts}
            onDownloadTemplate={downloadtempfile}
          />
        </div>
      </div>

      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-300">
              <tr>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900  tracking-wider">
                  {language === "ar" ? "صورة" : "Image"}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900  tracking-wider">
                  {language === "ar" ? "الاسم" : "Name"}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900  tracking-wider">
                  {language === "ar" ? "الفئة" : "Category"}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900  tracking-wider">
                  {language === "ar" ? "البراند" : "Brand"}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900  tracking-wider">
                  {language === "ar" ? "السعر" : "Price"}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900  tracking-wider">
                  {language === "ar" ? "المخزون" : "Stock"}
                </th>
                <th className="px-4 py-3 text-start text-xs font-medium text-gray-900  tracking-wider">
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
                    {language === "ar" ? "جاري التحميل..." : "Loading..."}
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    {language === "ar" ? "لا توجد منتجات" : "No products found"}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    {/* Image */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.primary_image ? (
                        <img
                          src={p.primary_image}
                          alt={p.name}
                          className="w-16 h-16 rounded border border-gray-200 dark:border-gray-600 object-contain"
                        />
                      ) : (
                        <PhotoIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3  text-start text-sm text-gray-900 dark:text-white">
                      {language === "ar" ? p.name_ar || p.name : p.name}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap text-start text-sm text-gray-500 dark:text-gray-400">
                      {p.category_name ?? "—"}
                    </td>

                    {/* Brand */}
                    <td className="px-4 py-3 whitespace-nowrap text-start text-sm text-gray-500 dark:text-gray-400">
                      {p.brand_name ?? "—"}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 whitespace-nowrap text-start text-sm text-gray-900 dark:text-white font-semibold">
                      {p.currency} {Number(p.price).toFixed(2)}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 whitespace-nowrap text-start text-sm text-gray-900 dark:text-white">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          p.stock > 10
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : p.stock > 0
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-start text-sm">
                      <div
                        className={`flex gap-1.5 sm:gap-2 ${
                          language === "ar" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow"
                          title={language === "ar" ? "تعديل" : "Edit"}
                          aria-label={language === "ar" ? "تعديل" : "Edit"}
                        >
                          <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-700 dark:text-yellow-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow"
                          title={language === "ar" ? "حذف" : "Delete"}
                          aria-label={language === "ar" ? "حذف" : "Delete"}
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
        <ProductForm
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={onFormSaved}
          initial={editing}
          categories={categories}
          brands={brands}
        />
      )}
      {/* Pagination */}
      <div
        className={`flex items-center gap-3 sm:gap-6 justify-center mt-4 ${
          language === "ar" ? "text-right" : "text-left"
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm font-medium hover:shadow-sm active:scale-95 ${
              language === "ar" ? "flex-row-reverse" : "flex-row"
            }`}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            {language === "ar" ? "السابق" : "Previous"}
          </button>
          {/* Page Info */}
          <span className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
            {language === "ar"
              ? `الصفحة ${currentPage} من ${totalPages}`
              : `Page ${currentPage} of ${totalPages}`}
          </span>
          <button
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm font-medium hover:shadow-sm active:scale-95 ${
              language === "ar" ? "flex-row-reverse" : "flex-row"
            }`}
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

function ProductForm({
  onClose,
  onSaved,
  initial,
  categories,
  brands,
}: {
  onClose: () => void;
  onSaved: (p: ProductListItem) => void;
  initial: ProductListItem | null;
  categories: Category[] | null;
  brands: Brand[] | null;
}) {
  const { language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"];
  const MAX_FILE_SIZE_MB = 5;
  const MAX_IMAGES = 5;
  // form state
  const [name, setName] = useState(initial?.name ?? "");
  const [nameAr, setNameAr] = useState(initial?.name_ar ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(
    initial?.description_ar ?? ""
  );
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);

  type ExistingImage = {
    id: number;
    image: string;
  };

  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [price, setPrice] = useState(initial?.price ?? 0);
  const [comparePrice, setComparePrice] = useState<number | "">(
    initial?.compare_price ?? 0
  );
  const [costPrice, setCostPrice] = useState<number | "">(
    initial?.cost_price ?? 0
  );
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initial?.low_stock_threshold ?? 10
  );
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");
  const [weight, setWeight] = useState(initial?.weight ?? "");
  const [dimensions, setDimensions] = useState(initial?.dimensions ?? "");
  const [categoryId, setCategoryId] = useState<number | "">(
    initial?.category?.id ?? ""
  );
  const [brandId, setBrandId] = useState<number | "">(initial?.brand?.id ?? "");
  const [productType, setProductType] = useState(
    initial?.product_type ?? "product"
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "EGP");
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(
    initial?.is_featured ?? false
  );
  const [isDigital, setIsDigital] = useState(initial?.is_digital ?? false);
  const [requiresShipping, setRequiresShipping] = useState(
    initial?.requires_shipping ?? true
  );
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.meta_description ?? ""
  );

  const [productRole, setProductRole] = useState(
    initial?.product_role ?? "tocart"
  );
  const { fetchProduct, createProduct, updateProduct } = useAuth();
  const [specifications, setSpecifications] = useState(
    initial?.specifications ?? []
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [datasheetFile, setDatasheetFile] = useState<File | null>(null);
  const [datasheetUrl, setDatasheetUrl] = useState<string | null>(
    initial?.datasheet ?? null
  );
  const removeExistingImage = (imageUrl: string) => {
    setDeletedImageIds((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((img) => img.image !== imageUrl));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // إضافة صف جديد
  const addSpec = () =>
    setSpecifications([
      ...specifications,
      { name: "", value: "", id: 0, name_ar: "", value_ar: "", sort_order: 0 },
    ]);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    // 🧾 تحقق من الامتداد
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      setImageError(
        language === "ar"
          ? `نوع الملف غير مسموح (${ALLOWED_EXTENSIONS.join(", ")})`
          : `Invalid file type (${ALLOWED_EXTENSIONS.join(", ")})`
      );
      setImageFile(null);
      return;
    }

    // 🧪 تحقق من نوع MIME (أمان إضافي)
    if (!file.type.startsWith("image/")) {
      setImageError(
        language === "ar"
          ? "الملف ليس صورة صالحة"
          : "Selected file is not a valid image"
      );
      setImageFile(null);
      return;
    }

    // 📦 تحقق من الحجم
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(
        language === "ar"
          ? `حجم الصورة أكبر من ${MAX_FILE_SIZE_MB}MB`
          : `The image size is larger than ${MAX_FILE_SIZE_MB}MB`
      );
      input.value = "";
      return;
    }

    setImageError(null);
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPrimaryPreview(previewUrl);

  };

  const handleDatasheetFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      toast.error(
        language === "ar"
          ? "يجب أن يكون الملف من نوع PDF"
          : "File must be a PDF"
      );
      setDatasheetFile(null);
      return;
    }

    setDatasheetFile(file);
    setDatasheetUrl(null); // Clear old URL when new file is selected
  };

  // تحديث صف
  const updateSpec = (
    index: number,
    key: "name" | "value" | "name_ar" | "value_ar",
    value: string
  ) => {
    const newSpecs = [...specifications];
    newSpecs[index][key] = value;
    setSpecifications(newSpecs);
  };

  // حذف صف
  const removeSpec = (index: number) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);
  };

  useEffect(() => {
    // إعادة تعيين حالة الملف عند فتح النموذج
    setDatasheetFile(null);

    if (initial && initial.id) {
      (async () => {
        try {
          const data = await fetchProduct(initial.slug || String(initial.id));
          setName(data.name ?? "");
          setNameAr(data.name_ar ?? "");

          setExistingImages(data.images);
          setDescription(data.description ?? "");
          setDescriptionAr(data.description_ar ?? "");
          setPrice(data.price ?? 0);
          setComparePrice(data.compare_price ?? "");
          setSku(data.sku ?? "");
          setCostPrice(data.cost_price ?? "");
          setStock(data.stock ?? 0);
          setLowStockThreshold(data.low_stock_threshold ?? 10);
          setBarcode(data.barcode ?? "");
          setWeight(data.weight ?? "");
          setDimensions(data.dimensions ?? "");
          setProductType(data.product_type ?? "product");
          setIsActive(data.is_active ?? true);
          setIsFeatured(data.is_featured ?? false);
          setIsDigital(data.is_digital ?? false);
          setRequiresShipping(data.requires_shipping ?? true);
          setMetaTitle(data.meta_title ?? "");
          setMetaDescription(data.meta_description ?? "");
          setCurrency(data.currency ?? "EGP");
          setSpecifications(data.specifications);
          if (data.category?.id) setCategoryId(data.category.id);
          if (data.brand?.id) setBrandId(data.brand.id);
          if (data.image) {
            setPrimaryPreview(data.image);
          }
          if (data.datasheet) {
            setDatasheetUrl(data.datasheet);
          } else {
            setDatasheetUrl(null);
          }
        } catch (e) {
          console.warn("fetch product detail failed", e);
        }
      })();
    } else {
      // إعادة تعيين عند إنشاء منتج جديد
      setDatasheetUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      newImages.forEach((file) => {
        fd.append("images", file);
      });
      if (deletedImageIds.length > 0) {
        fd.append("deleted_images", JSON.stringify(deletedImageIds));
      }
      fd.append("specifications", JSON.stringify(specifications));
      fd.append("name", name);
      fd.append("sku", sku);
      if (nameAr) fd.append("name_ar", nameAr);
      if (description) fd.append("description", description);
      if (descriptionAr) fd.append("description_ar", descriptionAr);
      fd.append("price", String(price));
      if (comparePrice !== "") fd.append("compare_price", String(comparePrice));
      if (costPrice !== "") fd.append("cost_price", String(costPrice));
      fd.append("stock", String(stock));
      fd.append("low_stock_threshold", String(lowStockThreshold));
      if (barcode) fd.append("barcode", barcode);
      if (weight) fd.append("weight", weight);
      if (dimensions) fd.append("dimensions", dimensions);
      if (categoryId) fd.append("category_id", String(categoryId));
      if (brandId) fd.append("brand_id", String(brandId));
      fd.append("product_type", productType);
      fd.append("is_active", String(Number(isActive)));
      fd.append("is_featured", String(Number(isFeatured)));
      fd.append("is_digital", String(Number(isDigital)));
      fd.append("requires_shipping", String(Number(requiresShipping)));
      fd.append("product_role", productRole);
      if (metaTitle) fd.append("meta_title", metaTitle);
      if (metaDescription) fd.append("meta_description", metaDescription);
      if (imageFile) fd.append("image", imageFile);
      if (currency) fd.append("currency", currency);

      // إضافة ملف Datasheet إذا كان موجوداً
      if (datasheetFile) {
        fd.append("datasheet", datasheetFile);
      }

      const res = initial?.id
        ? await updateProduct(initial.id, fd)
        : await createProduct(fd);

      const saved = res;

      const normalized: ProductListItem = {
        id: saved.id,
        name: saved.name,
        name_ar: saved.name_ar ?? undefined,
        price: saved.price ?? 0,
        compare_price: saved.compare_price ?? null,
        stock: saved.stock ?? 0,
        category_name: saved.category?.name ?? saved.category_name ?? undefined,
        brand_name: saved.brand?.name ?? saved.brand_name ?? undefined,
        primary_image: saved.image ?? saved.primary_image ?? null,
        is_active: saved.is_active ?? true,
        is_featured: saved.is_featured ?? false,
        slug: saved.slug,
        datasheet: saved.datasheet ?? null,
      };

      onSaved(normalized);
      setDeletedImageIds([]);
      setNewImages([]);
      setNewPreviews([]);
    } catch (err: any) {
      console.error("save product error", err);
      const msg =
        err?.response?.data ||
        (language === "ar" ? "فشل الحفظ" : "Save failed");
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };
  const modalRef = useRef(null);

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
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 🔢 تحقق من العدد الإجمالي
    if (existingImages.length + newImages.length + files.length > MAX_IMAGES) {
      toast.error(
        language === "ar"
          ? `الحد الأقصى للصور هو ${MAX_IMAGES}`
          : `Maximum ${MAX_IMAGES} images allowed`
      );
      return;
    }

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of files) {
      // 🧾 تحقق من الامتداد
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(
          language === "ar"
            ? `نوع الملف غير مسموح: ${file.name}`
            : `Invalid file type: ${file.name}`
        );
        continue;
      }

      // 📦 تحقق من الحجم
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(
          language === "ar"
            ? `حجم الصورة كبير جدًا (${file.name})`
            : `Image is too large: ${file.name}`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // ➕ إضافة الصور الصالحة
    setNewImages((prev) => [...prev, ...validFiles]);

    // 🖼️ إنشاء previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewPreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // 🔄 إعادة تعيين input (مهم)
    e.target.value = "";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4"
      onClick={handleOverlayClick}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 ${
            language === "ar" ? "flex-row" : "flex-row"
          }`}
        >
          <h3
            className={`text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex-1 ${
              language === "ar" ? "text-right pr-3" : "text-left pl-3"
            }`}
          >
            {initial
              ? language === "ar"
                ? "تعديل المنتج"
                : "Edit Product"
              : language === "ar"
              ? "إضافة منتج جديد"
              : "Add New Product"}
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              language === "ar" ? "ml-2" : "mr-2"
            }`}
            title={language === "ar" ? "إغلاق" : "Close"}
            aria-label={language === "ar" ? "إغلاق النافذة" : "Close window"}
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar"
                  ? "اسم المنتج (إنجليزي) *"
                  : "Product Name (EN) *"}
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                placeholder={
                  language === "ar"
                    ? "أدخل اسم المنتج بالإنجليزية"
                    : "Enter product name in English"
                }
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar"
                  ? "اسم المنتج (عربي) * "
                  : "Product Name (AR) *"}
              </label>
              <input
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                placeholder={
                  language === "ar"
                    ? "أدخل اسم المنتج بالعربية"
                    : "Enter product name in Arabic"
                }
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>
          <div className={language === "ar" ? "text-right" : "text-left"}>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              {language === "ar" ? "الاسم التعريفي *" : "SKU *"}
            </label>
            <input
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                language === "ar" ? "text-right" : "text-left"
              }`}
              placeholder={
                language === "ar" ? "أدخل SKU المنتج " : "Enter product SKU "
              }
              dir={language === "ar" ? "rtl" : "ltr"}
            />
          </div>
          {/* Description Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                placeholder={
                  language === "ar"
                    ? "أدخل وصف المنتج بالإنجليزية"
                    : "Enter product description in English"
                }
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "الوصف (عربي)" : "Description (AR)"}
              </label>
              <textarea
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                rows={3}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                placeholder={
                  language === "ar"
                    ? "أدخل وصف المنتج بالعربية"
                    : "Enter product description in Arabic"
                }
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>

          {/* Category and Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "الفئة *" : "Category *"}
              </label>
              {categories ? (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  required
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                  dir={language === "ar" ? "rtl" : "ltr"}
                >
                  <option value="">
                    {language === "ar" ? "اختر فئة" : "Select category"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={categoryId as any}
                  onChange={(e) =>
                    setCategoryId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder={language === "ar" ? "رقم الفئة" : "Category ID"}
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                  dir="ltr"
                />
              )}
            </div>

            {/* Brand */}
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "العلامة التجارية" : "Brand"}
              </label>
              {brands ? (
                <select
                  value={brandId}
                  onChange={(e) =>
                    setBrandId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                  dir={language === "ar" ? "rtl" : "ltr"}
                >
                  <option value="">
                    {language === "ar" ? "اختر علامة تجارية " : "Select brand"}
                  </option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={brandId as any}
                  onChange={(e) =>
                    setBrandId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder={
                    language === "ar"
                      ? "رقم العلامة التجارية (اختياري)"
                      : "Brand ID (optional)"
                  }
                  className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                  dir="ltr"
                />
              )}
            </div>
          </div>

          {/* Product Type and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "نوع المنتج" : "Product Type"}
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                <option value="product">
                  {language === "ar" ? "منتج" : "Product"}
                </option>

                <option value="service">
                  {language === "ar" ? "خدمة " : " Service"}
                </option>
              </select>
            </div>

            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "دور المنتج" : "Product Role"}
              </label>
              <select
                value={productRole}
                onChange={(e) => setProductRole(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                <option value="tocart">
                  {language === "ar" ? "إلى السلة" : "Direct"}
                </option>
                <option value="toform">
                  {language === "ar" ? "إلى النموذج" : "In Direct"}
                </option>
              </select>
            </div>
          </div>

          {/* Specifications */}
          <div className={language === "ar" ? "text-right" : "text-left"}>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              {language === "ar" ? "مواصفات المنتج" : "Product Specifications"}
            </label>

            <div className="space-y-2">
              {specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${
                    language === "ar" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <input
                    type="text"
                    placeholder={
                      language === "ar"
                        ? "اسم المواصفة انجليزي"
                        : "Specification Name EG"
                    }
                    value={spec.name}
                    onChange={(e) => updateSpec(idx, "name", e.target.value)}
                    className={`flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                    dir={language === "ar" ? "rtl" : "ltr"}
                  />
                  <input
                    type="text"
                    placeholder={
                      language === "ar"
                        ? "قيمة المواصفة انجليزي"
                        : "Specification Value EG"
                    }
                    value={spec.value}
                    onChange={(e) => updateSpec(idx, "value", e.target.value)}
                    className={`flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                    dir={language === "ar" ? "rtl" : "ltr"}
                  />

                  <input
                    type="text"
                    placeholder={
                      language === "ar"
                        ? " اسم المواصفة بالعربي"
                        : "Specification Name Ar"
                    }
                    value={spec.name_ar}
                    onChange={(e) => updateSpec(idx, "name_ar", e.target.value)}
                    className={`flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                    dir={language === "ar" ? "rtl" : "ltr"}
                  />
                  <input
                    type="text"
                    placeholder={
                      language === "ar"
                        ? "قيمة المواصفة عربي"
                        : "Specification Value Ar"
                    }
                    value={spec.value_ar}
                    onChange={(e) =>
                      updateSpec(idx, "value_ar", e.target.value)
                    }
                    className={`flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                    dir={language === "ar" ? "rtl" : "ltr"}
                  />

                  <button
                    type="button"
                    onClick={() => removeSpec(idx)}
                    className="px-3 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSpec}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              {language === "ar"
                ? "+ أضف مواصفة جديدة"
                : "+ Add New Specification"}
            </button>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 gap-4">
            {/* Primary Image */}
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "الصورة الرئيسية" : "Primary Image"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className={`cursor-pointer w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 ${
                  language === "ar"
                    ? "file:ml-4 file:mr-0 text-right"
                    : "file:mr-4 text-left"
                }`}
                dir={language === "ar" ? "rtl" : "ltr"}
              />
              {primaryPreview && (
                <div className="mt-3">
                  <img
                    src={primaryPreview}
                    alt="Primary Preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                </div>
              )}
              <p className="mt-1 text-sm text-[#E97132] dark:text-[#E97132]">
                {language === "ar"
                  ? `مسموح بالملفات: ${ALLOWED_EXTENSIONS.join(
                      ", "
                    )}. الحد الأقصى: ${MAX_FILE_SIZE_MB}MB`
                  : `Allowed types: ${ALLOWED_EXTENSIONS.join(
                      ", "
                    )}. Max size: ${MAX_FILE_SIZE_MB}MB`}
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
            {/* Additional Images */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {language === "ar" ? "الصور الإضافية" : "Additional Images"}
              </h2>

              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="service-images"
                  />
                  <label
                    htmlFor="service-images"
                    className="cursor-pointer text-primary-600 hover:text-primary-500 font-medium"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    {language === "ar"
                      ? " اختر الصور أو اسحبها هنا"
                      : "Select Images or Drop hire"}
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    {language === "ar"
                      ? `مسموح بالملفات: ${ALLOWED_EXTENSIONS.join(
                          ", "
                        )}. الحد الأقصى: ${MAX_FILE_SIZE_MB}MB`
                      : `Allowed types: ${ALLOWED_EXTENSIONS.join(
                          ", "
                        )}. Max size: ${MAX_FILE_SIZE_MB}MB`}
                  </p>
                </div>

                {/* Image Previews */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.image}
                          alt={`Preview ${index + 1}`}
                          className="full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.image)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {newPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {newPreviews.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Preview ${index + 1}`}
                          className="full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Datasheet PDF */}
          <div className={language === "ar" ? "text-right" : "text-left"}>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              {language === "ar" ? "Datasheet (PDF)" : "Datasheet (PDF)"}
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleDatasheetFile}
              className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 ${
                language === "ar"
                  ? "file:ml-4 file:mr-0 text-right"
                  : "file:mr-4 text-left"
              }`}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
            {datasheetUrl && !datasheetFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {language === "ar" ? "الملف الحالي: " : "Current file: "}
                <a
                  href={datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {datasheetUrl.split("/").pop()}
                </a>
              </p>
            )}
            {datasheetFile && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                {language === "ar" ? "ملف جديد: " : "New file: "}
                {datasheetFile.name}
              </p>
            )}
            <p className="mt-1 text-sm text-[#E97132] dark:text-[#E97132]">
              {language === "ar"
                ? "مسموح بالملفات: PDF. لا يوجد حد أقصى للحجم"
                : "Allowed types: PDF. No size limit"}
            </p>
          </div>

          {productRole == "tocart" && (
            <>
              {/* Pricing and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {language === "ar" ? "السعر *" : "Price *"}
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                    dir="ltr"
                  />
                </div>

                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {language === "ar" ? "المخزون" : "Stock"}
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                    dir="ltr"
                  />
                </div>

                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {language === "ar" ? "حد إنذار المخزون" : "Low Stock Alert"}
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) =>
                      setLowStockThreshold(Number(e.target.value))
                    }
                    className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Additional Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={language === "ar" ? "text-right" : "text-left"}>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                    {language === "ar" ? "سعر المقارنة" : "Compare Price"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={comparePrice as any}
                    onChange={(e) =>
                      setComparePrice(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                    dir="ltr"
                  />
                </div>
              </div>
            </>
          )}

          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            {language === "ar" ? "العملة" : "Currency"}
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              language === "ar" ? "text-right" : "text-left"
            }`}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <option value="EGP">{language === "ar" ? "جنية" : "EGP"}</option>
            <option value="USD">{language === "ar" ? "دولا" : "USD"}</option>
          </select>
          <label
            className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 ${
              language === "ar" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === "ar" ? "نشط" : "Is Active"}
            </span>
          </label>
          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "الباركود" : "Barcode"}
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                dir="ltr"
              />
            </div>

            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "الوزن" : "Weight"}
              </label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                placeholder={language === "ar" ? "كجم" : "kg"}
                dir="ltr"
              />
            </div>

            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "الأبعاد" : "Dimensions"}
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                placeholder={
                  language === "ar" ? "الطول × العرض × الارتفاع" : "L × W × H"
                }
                dir="ltr"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 ${
                language === "ar" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <input
                type="checkbox"
                checked={isDigital}
                onChange={(e) => setIsDigital(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === "ar" ? "منتج رقمي" : "Digital Product"}
              </span>
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 ${
                language === "ar" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <input
                type="checkbox"
                checked={requiresShipping}
                onChange={(e) => setRequiresShipping(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === "ar" ? "يتطلب شحن" : "Requires Shipping"}
              </span>
            </label>
          </div>

          {/* SEO Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "عنوان SEO" : "SEO Title"}
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                placeholder={
                  language === "ar"
                    ? "عنوان محسن لمحركات البحث"
                    : "SEO optimized title"
                }
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>

            <div className={language === "ar" ? "text-right" : "text-left"}>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {language === "ar" ? "وصف SEO" : "SEO Description"}
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
                placeholder={
                  language === "ar"
                    ? "وصف محسن لمحركات البحث"
                    : "SEO optimized description"
                }
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>

          {/* Actions */}
          <div
            className={`flex flex-col-reverse gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 ${
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
                ? "حفظ المنتج"
                : "Save Product"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
