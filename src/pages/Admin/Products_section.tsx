import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
/**
 * AdminProductsSection.tsx
 * Single-file React component (TypeScript) for Admin Product Management
 * - lists products
 * - search + basic filters (category, brand)
 * - create / update (modal form) with image upload
 * - delete with confirmation
 *
 * Notes:
 * - Tailwind CSS is used for styling (project already uses Tailwind)
 * - It expects the following backend endpoints (as provided):
 *    GET  /api/admin/products/               -> list products (returns array or {results})
 *    POST /api/admin/products/create/        -> create product (multipart/form-data)
 *    PUT  /api/admin/products/<id>/update/   -> update product (multipart/form-data)
 *    DELETE /api/admin/products/<id>/delete/ -> delete product
 * - It also attempts to fetch categories and brands from /api/categories/ and /api/brands/
 *   if those endpoints exist, they will populate the selects. If they don't exist, selects
 *   fall back to text inputs for category_id / brand_id.
 */

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
};


// const API_BASE = '/api/admin/products/' // list
// const CREATE_ENDPOINT = '/api/admin/products/create/'

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

  // fetch list
  const getProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (query) params.search = query;
      if (categoryFilter) params.category = categoryFilter;
      if (brandFilter) params.brand = brandFilter;

      const res = await fetchProducts(params);
      console.log("Fetched products:", res);
      // backend might return {results: [...]} or plain array
      const data = res.results ?? res;
      setProducts(Array.isArray(data) ? data : []);
      console.log(products);
      
    } catch (err: any) {
      console.error("fetchProducts error", err);
      toast.error(
        language === "ar" ? "فشل في جلب المنتجات" : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  // try fetch categories and brands to populate selects
  const fetchCategoriesAndBrands = async () => {
    try {
      const [cRes, bRes] = await Promise.allSettled([
        fetchcategories(),
        fetchbrands(),
      ]);
      console.log(cRes, bRes);

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
    getProducts();
    fetchCategoriesAndBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // simple debounce for search
    const t = setTimeout(() => getProducts(), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryFilter, brandFilter]);

  const handleDelete = async (id: number | string) => {
    if (
      !confirm(
        language === "ar" ? "هل تريد حذف هذا المنتج؟" : "Delete this product?"
      )
    )
      return;
    try {
      console.log("Deleting product with id:", id);
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
    // if editing, replace, else prepend
    setShowForm(false);
    setEditing(null);
    setProducts((prev) => {
      const exists = prev.find((x) => x.id === saved.id);
      if (exists) return prev.map((x) => (x.id === saved.id ? saved : x));
      return [saved, ...prev];
    });
  };

  return (
    <div className="min-h-[70vh] p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2 w-full md:w-1/2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === "ar" ? "ابحث عن منتج..." : "Search products..."
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
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-sm"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>{language === "ar" ? "إضافة منتج" : "Add product"}</span>
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
                {language === "ar" ? "الاسم" : "Name"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "الفئة" : "Category"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "البراند" : "Brand"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "السعر" : "Price"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "المخزون" : "Stock"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {language === "ar" ? "التحكم" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500 dark:text-gray-400">
                  {language === "ar" ? "جاري التحميل..." : "Loading..."}
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500 dark:text-gray-400">
                  {language === "ar" ? "لا توجد منتجات" : "No products found"}
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr 
                  key={p.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {p.primary_image ? (
                      <img
                        src={ p.primary_image}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded border border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <PhotoIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {p.category_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {p.brand_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                    EGP {Number(p.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      p.stock > 10 
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
                        : p.stock > 0 
                        ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors duration-200"
                        title={language === "ar" ? "تعديل" : "Edit"}
                      >
                        <PencilSquareIcon className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
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
    </div>
  );
}

/**
 * ProductForm - handles create & update
 * - expects initial to be ProductListItem or null
 * - posts multipart/form-data to CREATE_ENDPOINT or PUT to update endpoint
 */
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

  // form state
  const [name, setName] = useState(initial?.name ?? "");
  const [nameAr, setNameAr] = useState(initial?.name_ar ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionAr, setDescriptionAr] = useState(initial?.description_ar ?? "");
  const [price, setPrice] = useState(initial?.price ?? 1);
  const [comparePrice, setComparePrice] = useState<number | "">(initial?.compare_price ?? "");
  const [costPrice, setCostPrice] = useState<number | "">(initial?.cost_price ?? "");
  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [lowStockThreshold, setLowStockThreshold] = useState(initial?.low_stock_threshold ?? 10);
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");
  const [weight, setWeight] = useState(initial?.weight ?? "");
  const [dimensions, setDimensions] = useState(initial?.dimensions ?? "");
  const [categoryId, setCategoryId] = useState<number | "">(initial?.category?.id ?? "");
  const [brandId, setBrandId] = useState<number | "">(initial?.brand?.id ?? "");
  const [productType, setProductType] = useState(initial?.product_type ?? "network-device");
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState<boolean>(initial?.is_featured ?? false);
  const [isDigital, setIsDigital] = useState(initial?.is_digital ?? false);
  const [requiresShipping, setRequiresShipping] = useState(initial?.requires_shipping ?? true);
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [productRole, setProductRole] = useState(initial?.product_role ?? "tocart");
  const { fetchProduct, createProduct, updateProduct } = useAuth()
  const [specifications, setSpecifications] = useState(initial?.specifications ?? []);
  const [imageFile, setImageFile] = useState<File | null>(null);
// إضافة صف جديد
const addSpec = () => setSpecifications([...specifications, { name: "", value: "" ,id:0, name_ar: "", value_ar: "", sort_order:0}]);
const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
  };
// تحديث صف
const updateSpec = (index: number, key: 'name' | 'value', value: string) => {
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
    if (initial && initial.id) {
      (async () => {
        try {
          const data = await fetchProduct(initial.slug || String(initial.id));
          setName(data.name ?? "");
          setNameAr(data.name_ar ?? "");
          setDescription(data.description ?? "");
          setDescriptionAr(data.description_ar ?? "");
          setPrice(data.price ?? 0);
          setComparePrice(data.compare_price ?? "");
          setCostPrice(data.cost_price ?? "");
          setStock(data.stock ?? 0);
          setLowStockThreshold(data.low_stock_threshold ?? 10);
          setBarcode(data.barcode ?? "");
          setWeight(data.weight ?? "");
          setDimensions(data.dimensions ?? "");
          setProductType(data.product_type ?? "network-device");
          setIsActive(data.is_active ?? true);
          setIsFeatured(data.is_featured ?? false);
          setIsDigital(data.is_digital ?? false);
          setRequiresShipping(data.requires_shipping ?? true);
          setMetaTitle(data.meta_title ?? "");
          setMetaDescription(data.meta_description ?? "");

          if (data.category?.id) setCategoryId(data.category.id);
          if (data.brand?.id) setBrandId(data.brand.id);
        } catch (e) {
          console.warn("fetch product detail failed", e);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

 const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files ? Array.from(e.target.files) : [];
  setImageFiles(files);
};


  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      imageFiles.forEach((file) => fd.append('images', file));
fd.append('specifications', JSON.stringify(specifications));
fd.append("name", name);
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
      console.log(fd);
      
      const res = initial?.id ? await updateProduct(initial.id, fd) : await createProduct(fd);

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
      };

      onSaved(normalized);
    } catch (err: any) {
      console.error("save product error", err);
      const msg = err?.response?.data || (language === "ar" ? "فشل الحفظ" : "Save failed");
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initial
              ? language === "ar"
                ? "تعديل المنتج"
                : "Edit product"
              : language === "ar"
              ? "إضافة منتج"
              : "Add product"}
          </h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">✕</button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 gap-4">
          {/* الحقول الأساسية والجديدة تباعا مثل name, name_ar, description, price ... */}
          {/* مثال: */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">{language === "ar" ? "اسم المنتج (إنجليزي)" : "Name"}</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">{language === "ar" ? "اسم المنتج (عربي)" : "Name (AR)"}</label>
              <input value={nameAr} onChange={e => setNameAr(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
              {/* الوصف بالإنجليزي والعربي */}
<div className="grid grid-cols-1 gap-4">
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "الوصف (إنجليزي)" : "Description"}
    </label>
    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      rows={3}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "الوصف (عربي)" : "Description (AR)"}
    </label>
    <textarea
      value={descriptionAr}
      onChange={(e) => setDescriptionAr(e.target.value)}
      rows={3}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
</div>
<div className="flex flex-col">
  <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
    {language === "ar" ? "الصورة الرئيسية" : "Primary Image"}
  </label>
  <input type="file" accept="image/*" onChange={handleFile} />
  {imageFile && (
    <span className="text-sm mt-1 text-gray-600 dark:text-gray-400">{imageFile.name}</span>
  )}
</div>

<div className="flex flex-col">
  <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
    {language === "ar" ? "الفئة" : "Category"}
  </label>
  {categories ? (
    <select
      value={categoryId}
      onChange={(e) => setCategoryId(Number(e.target.value))}
      required
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        setCategoryId(e.target.value === "" ? "" : Number(e.target.value))
      }
      placeholder={language === "ar" ? "رقم الفئة" : "Category ID"}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  )}
</div>
<div className="flex flex-col">
  <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
    {language === "ar" ? "البراند" : "Brand"}
  </label>
  {brands ? (
    <select
      value={brandId}
      onChange={(e) => setBrandId(e.target.value === "" ? "" : Number(e.target.value))}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">
        {language === "ar" ? "اختر براند (اختياري)" : "Select brand (optional)"}
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
        setBrandId(e.target.value === "" ? "" : Number(e.target.value))
      }
      placeholder={language === "ar" ? "رقم البراند (اختياري)" : "Brand ID (optional)"}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  )}
</div>
<div className="flex flex-col">
  <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
    {language === "ar" ? "نوع المنتج" : "Product Type"}
  </label>
  <select
    value={productType}
    onChange={(e) => setProductType(e.target.value)}
    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="network-device">{language === "ar" ? "جهاز شبكات" : "Network Device"}</option>
    <option value="software-license">{language === "ar" ? "ترخيص برمجي" : "Software License"}</option>
    <option value="installation-service">{language === "ar" ? "خدمة تركيب" : "Installation Service"}</option>
  </select>
</div>
<div className="flex flex-col">
  <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
    {language === "ar" ? "دور المنتج" : "Product Role"}
  </label>
  <select
    value={productRole}
    onChange={(e) => setProductRole(e.target.value)}
    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="tocart">{language === "ar" ? "الي السله" : "To Cart"}</option>
    <option value="toform">{language === "ar" ? "املا قائمة" : "To Form"}</option>
    
  </select>
</div>


  

<div className="grid grid-cols-1 gap-2">
  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
    {language === "ar" ? "مواصفات المنتج" : "Product Specifications"}
  </label>

  {specifications.map((spec, idx) => (
    <div key={idx} className="flex gap-2">
      <input
        type="text"
        placeholder={language === "ar" ? "اسم" : "Name"}
        value={spec.name}
        onChange={(e) => updateSpec(idx, 'name', e.target.value)}
        className="p-2 border rounded flex-1"
      />
      <input
        type="text"
        placeholder={language === "ar" ? "القيمة" : "Value"}
        value={spec.value}
        onChange={(e) => updateSpec(idx, 'value', e.target.value)}
        className="p-2 border rounded flex-1"
      />
      <button type="button" onClick={() => removeSpec(idx)} className="px-2 bg-red-500 text-white rounded">
        ×
      </button>
    </div>
  ))}

  <button type="button" onClick={addSpec} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">
    {language === "ar" ? "أضف مواصفة" : "Add Specification"}
  </button>
</div>


          {/* باقي الحقول (description, descriptionAr, price, compare_price, cost_price ...) بنفس أسلوب المدخلات السابقة */}
          {/* الصورة */}
          <div className="flex flex-col">
  <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
    {language === "ar" ? "الصور" : "Images"}
  </label>
  <input type="file" accept="image/*" multiple onChange={handleFiles} />
  {imageFiles.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {imageFiles.map((file, index) => (
        <span
          key={index}
          className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-1 rounded"
        >
          {file.name}
        </span>
      ))}
    </div>
  )}
</div>
{/* السعر والمخزون */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Price */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "السعر" : "Price"}
    </label>
    <input
      required
      type="number"
      step="0.01"
      value={price}
      onChange={(e) => setPrice(Number(e.target.value))}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  {/* Stock */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "المخزون" : "Stock"}
    </label>
    <input
      type="number"
      value={stock}
      onChange={(e) => setStock(Number(e.target.value))}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  {/* Low stock threshold */}
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "حد التحذير من نقص المخزون" : "Low Stock Threshold"}
    </label>
    <input
      type="number"
      value={lowStockThreshold}
      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
</div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "سعر المقارنة" : "Compare Price"}
    </label>
    <input
      type="number"
      step="0.01"
      value={comparePrice as any}
      onChange={(e) =>
        setComparePrice(e.target.value === "" ? "" : Number(e.target.value))
      }
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "سعر التكلفة" : "Cost Price"}
    </label>
    <input
      type="number"
      step="0.01"
      value={costPrice as any}
      onChange={(e) =>
        setCostPrice(e.target.value === "" ? "" : Number(e.target.value))
      }
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
</div>


<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "الباركود" : "Barcode"}
    </label>
    <input
      type="text"
      value={barcode}
      onChange={(e) => setBarcode(e.target.value)}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "الوزن" : "Weight"}
    </label>
    <input
      type="text"
      value={weight}
      onChange={(e) => setWeight(e.target.value)}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {language === "ar" ? "الأبعاد" : "Dimensions"}
    </label>
    <input
      type="text"
      value={dimensions}
      onChange={(e) => setDimensions(e.target.value)}
      className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={isDigital}
      onChange={(e) => setIsDigital(e.target.checked)}
      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    />
    <label className="text-sm text-gray-700 dark:text-gray-300">
      {language === "ar" ? "رقمي" : "Digital"}
    </label>
  </div>

  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={requiresShipping}
      onChange={(e) => setRequiresShipping(e.target.checked)}
      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    />
    <label className="text-sm text-gray-700 dark:text-gray-300">
      {language === "ar" ? "يحتاج شحن" : "Requires Shipping"}
    </label>
  </div>
</div>
<div className="flex flex-col">
  <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
    {language === "ar" ? "عنوان الميتا" : "Meta Title"}
  </label>
  <input
    type="text"
    value={metaTitle}
    onChange={(e) => setMetaTitle(e.target.value)}
    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>

<div className="flex flex-col">
  <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
    {language === "ar" ? "وصف الميتا" : "Meta Description"}
  </label>
  <textarea
    value={metaDescription}
    onChange={(e) => setMetaDescription(e.target.value)}
    rows={2}
    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</div>



          {/* أزرار الحفظ والإلغاء */}
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">{language === "ar" ? "إلغاء" : "Cancel"}</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">{submitting ? (language === "ar" ? "جاري الحفظ..." : "Saving...") : (language === "ar" ? "حفظ" : "Save")}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


