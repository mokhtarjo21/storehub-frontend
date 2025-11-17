import React, { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useLanguage } from '../../contexts/LanguageContext'
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

type Category = { id: number; name: string }
type Brand = { id: number; name: string }

type ProductListItem = {
  id: number
  name: string
  name_ar?: string
  price: number
  compare_price?: number | null
  stock: number
  category_name?: string
  brand_name?: string | null
  primary_image?: string | null
  is_active?: boolean
  is_featured?: boolean
  slug?: string
}

// const API_BASE = '/api/admin/products/' // list
// const CREATE_ENDPOINT = '/api/admin/products/create/'

export default function AdminProductsSection() {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | number>('')
  const [brandFilter, setBrandFilter] = useState<string | number>('')
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [brands, setBrands] = useState<Brand[] | null>(null)
   const { fetchProducts,fetchbrands,
    fetchcategories,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,} = useAuth();
   

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ProductListItem | null>(null)

  // fetch list
  const getProducts = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (query) params.search = query
      if (categoryFilter) params.category = categoryFilter
      if (brandFilter) params.brand = brandFilter

      const res = await fetchProducts()

      // backend might return {results: [...]} or plain array
      const data = res.data?.results ?? res.data
      setProducts(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('fetchProducts error', err)
      toast.error(language === 'ar' ? 'فشل في جلب المنتجات' : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // try fetch categories and brands to populate selects
  const fetchCategoriesAndBrands = async () => {
    try {
      const [cRes, bRes] = await Promise.allSettled([
      fetchcategories(),
      fetchbrands()
      ])

      if (cRes.status === 'fulfilled') {
        const cdata = (cRes.value.data?.results ?? cRes.value.data) as Category[]
        if (Array.isArray(cdata)) setCategories(cdata)
      }
      if (bRes.status === 'fulfilled') {
        const bdata = (bRes.value.data?.results ?? bRes.value.data) as Brand[]
        if (Array.isArray(bdata)) setBrands(bdata)
      }
    } catch (e) {
      // ignore - selects will be manual
      console.warn('categories/brands fetch failed', e)
    }
  }

  useEffect(() => {
    getProducts()
    fetchCategoriesAndBrands()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // simple debounce for search
    const t = setTimeout(() => getProducts(), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryFilter, brandFilter])

  const handleDelete = async (id: number) => {
    if (!confirm(language === 'ar' ? 'هل تريد حذف هذا المنتج؟' : 'Delete this product?')) return
    try {
      await deleteProduct(id)
      toast.success(language === 'ar' ? 'تم الحذف' : 'Deleted')
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error(err)
      toast.error(language === 'ar' ? 'خطأ أثناء الحذف' : 'Delete failed')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  const openEdit = (p: ProductListItem) => {
    setEditing(p)
    setShowForm(true)
  }

  const onFormSaved = (saved: ProductListItem) => {
    // if editing, replace, else prepend
    setShowForm(false)
    setEditing(null)
    setProducts((prev) => {
      const exists = prev.find((x) => x.id === saved.id)
      if (exists) return prev.map((x) => (x.id === saved.id ? saved : x))
      return [saved, ...prev]
    })
    toast.success(language === 'ar' ? 'تم الحفظ' : 'Saved')
  }

  return (
    <div className="min-h-[70vh] p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2 w-full md:w-1/2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث عن منتج...' : 'Search products...'}
            className="flex-1 p-2 border rounded bg-white dark:bg-gray-800"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded bg-white dark:bg-gray-800"
          >
            <option value="">{language === 'ar' ? 'كل الفئات' : 'All categories'}</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="p-2 border rounded bg-white dark:bg-gray-800"
          >
            <option value="">{language === 'ar' ? 'كل العلامات' : 'All brands'}</option>
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>{language === 'ar' ? 'إضافة منتج' : 'Add product'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">{language === 'ar' ? 'صورة' : 'Image'}</th>
              <th className="px-4 py-3 text-left">{language === 'ar' ? 'الاسم' : 'Name'}</th>
              <th className="px-4 py-3 text-left">{language === 'ar' ? 'الفئة' : 'Category'}</th>
              <th className="px-4 py-3 text-left">{language === 'ar' ? 'البراند' : 'Brand'}</th>
              <th className="px-4 py-3 text-left">{language === 'ar' ? 'السعر' : 'Price'}</th>
              <th className="px-4 py-3 text-left">{language === 'ar' ? 'المخزون' : 'Stock'}</th>
              <th className="px-4 py-3 text-left">{language === 'ar' ? 'التحكم' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-3">
                    {p.primary_image ? (
                      // full URL expected from serializer
                      // keep image responsive and small
                      <img src={p.primary_image} alt={p.name} className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <PhotoIcon className="w-10 h-10 text-gray-400" />
                    )}
                  </td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.category_name ?? '—'}</td>
                  <td className="px-4 py-3">{p.brand_name ?? '—'}</td>
                  <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 bg-yellow-100 rounded hover:bg-yellow-200"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <PencilSquareIcon className="w-5 h-5 text-yellow-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 bg-red-100 rounded hover:bg-red-200"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <TrashIcon className="w-5 h-5 text-red-700" />
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
            setShowForm(false)
            setEditing(null)
          }}
          onSaved={onFormSaved}
          initial={editing}
          categories={categories}
          brands={brands}
        />
      )}
    </div>
  )
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
  onClose: () => void
  onSaved: (p: ProductListItem) => void
  initial: ProductListItem | null
  categories: Category[] | null
  brands: Brand[] | null
}) {
  const { language } = useLanguage()
  const [submitting, setSubmitting] = useState(false)

  // form state
  const [name, setName] = useState(initial?.name ?? '')
  const [nameAr, setNameAr] = useState(initial?.name_ar ?? '')
  const [description, setDescription] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [price, setPrice] = useState(initial?.price ?? 0)
  const [comparePrice, setComparePrice] = useState<number | ''>(initial?.compare_price ?? '')
  const [stock, setStock] = useState(initial?.stock ?? 0)
  const [categoryId, setCategoryId] = useState<number | ''>(initial?.id ? '' : '')
  const [brandId, setBrandId] = useState<number | ''>('')
  const [productType, setProductType] = useState('network-device')
  const [isActive, setIsActive] = useState<boolean>((initial?.is_active as boolean) ?? true)
  const [isFeatured, setIsFeatured] = useState<boolean>((initial?.is_featured as boolean) ?? false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    // if editing, try to pre-fill categoryId/brandId by fetching detail
    if (initial && initial.id) {
      // fetch full detail by slug or id: API has detail by slug; but admin views also expose list of products
      // We'll try GET /api/admin/products/<id>/ (some backends expose id-based detail); fallback to nothing
      (async () => {
        try {
          const res = await axios.get(`/api/admin/products/${initial.id}/`)
          const data = res.data
          setName(data.name ?? '')
          setNameAr(data.name_ar ?? '')
          setDescription(data.description ?? '')
          setDescriptionAr(data.description_ar ?? '')
          setPrice(data.price ?? 0)
          setComparePrice(data.compare_price ?? '')
          setStock(data.stock ?? 0)
          setProductType(data.product_type ?? 'network-device')
          setIsActive(data.is_active ?? true)
          setIsFeatured(data.is_featured ?? false)
          if (data.category && data.category.id) setCategoryId(data.category.id)
          if (data.brand && data.brand.id) setBrandId(data.brand.id)
        } catch (e) {
          // ignore - maybe endpoint uses slug lookup only
          console.warn('fetch product detail failed', e)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setImageFile(f)
  }

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      if (nameAr) fd.append('name_ar', nameAr)
      if (description) fd.append('description', description)
      if (descriptionAr) fd.append('description_ar', descriptionAr)
      fd.append('price', String(price))
      if (comparePrice !== '') fd.append('compare_price', String(comparePrice))
      fd.append('stock', String(stock))
      if (categoryId) fd.append('category_id', String(categoryId))
      if (brandId) fd.append('brand_id', String(brandId))
      fd.append('product_type', productType)
      fd.append('is_active', String(Number(isActive)))
      fd.append('is_featured', String(Number(isFeatured)))
      if (imageFile) fd.append('image', imageFile)

      let res
      if (initial && initial.id) {
        res = await axios.put(`/api/admin/products/${initial.id}/update/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        res = await axios.post(CREATE_ENDPOINT, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      const saved = res.data
      // Normalize saved product for the list shape
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
      }

      onSaved(normalized)
    } catch (err: any) {
      console.error('save product error', err)
      const msg = err?.response?.data || (language === 'ar' ? 'فشل الحفظ' : 'Save failed')
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initial ? (language === 'ar' ? 'تعديل المنتج' : 'Edit product') : language === 'ar' ? 'إضافة منتج' : 'Add product'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'ar' ? 'اسم المنتج (انجليزي)' : 'Name'}
              className="p-2 border rounded bg-white dark:bg-gray-900"
            />
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder={language === 'ar' ? 'اسم المنتج (عربي)' : 'Name (AR)'}
              className="p-2 border rounded bg-white dark:bg-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder={language === 'ar' ? 'السعر' : 'Price'}
              className="p-2 border rounded bg-white dark:bg-gray-900"
            />
            <input
              type="number"
              step="0.01"
              value={comparePrice as any}
              onChange={(e) => setComparePrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={language === 'ar' ? 'سعر المقارنة' : 'Compare price'}
              className="p-2 border rounded bg-white dark:bg-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              placeholder={language === 'ar' ? 'المخزون' : 'Stock'}
              className="p-2 border rounded bg-white dark:bg-gray-900"
            />

            {categories ? (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                required
                className="p-2 border rounded bg-white dark:bg-gray-900"
              >
                <option value="">{language === 'ar' ? 'اختر فئة' : 'Select category'}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={categoryId as any}
                onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={language === 'ar' ? 'رقم الفئة (category_id)' : 'Category ID'}
                className="p-2 border rounded bg-white dark:bg-gray-900"
              />
            )}
          </div>

          {brands ? (
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value === '' ? '' : Number(e.target.value))}
              className="p-2 border rounded bg-white dark:bg-gray-900"
            >
              <option value="">{language === 'ar' ? 'اختر براند (اختياري)' : 'Select brand (optional)'}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={brandId as any}
              onChange={(e) => setBrandId(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={language === 'ar' ? 'رقم البراند (brand_id) - اختياري' : 'Brand ID (optional)'}
              className="p-2 border rounded bg-white dark:bg-gray-900"
            />
          )}

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={language === 'ar' ? 'الوصف (انجليزي)' : 'Description'}
            className="p-2 border rounded bg-white dark:bg-gray-900"
            rows={3}
          />
          <textarea
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            placeholder={language === 'ar' ? 'الوصف (عربي)' : 'Description (AR)'}
            className="p-2 border rounded bg-white dark:bg-gray-900"
            rows={2}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="p-2 border rounded bg-white dark:bg-gray-900"
            >
              <option value="network-device">{language === 'ar' ? 'جهاز شبكات' : 'Network Device'}</option>
              <option value="software-license">{language === 'ar' ? 'ترخيص برمجي' : 'Software License'}</option>
              <option value="installation-service">{language === 'ar' ? 'خدمة تركيب' : 'Installation Service'}</option>
            </select>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span className="text-sm">{language === 'ar' ? 'نشط' : 'Active'}</span>
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <span className="text-sm">{language === 'ar' ? 'مميز' : 'Featured'}</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={handleFile} />
            {imageFile && <span className="text-sm">{imageFile.name}</span>}
            <div className="flex-1 text-right text-xs text-gray-500">{language === 'ar' ? 'الصورة للاستخدام كصورة رئيسية' : 'Primary image (optional)'}</div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">
              {submitting ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : language === 'ar' ? 'حفظ' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
