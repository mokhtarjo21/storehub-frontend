import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { apiRequest } from "../utils/api";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import CustomerFormModal from "../components/FormCart";
import { useActivityTracker } from "../hooks/useActivityTracker";
type Category = { id: number; name: string };
type Brand = { id: number; name: string };

const Products: React.FC = () => {
  const { t, language } = useLanguage();
  const { addItem, items } = useCart();
  const { user, fetchProducts, fetchcategories, fetchbrands } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | number>("");
  const [selectedBrand, setSelectedBrand] = useState<string | number>("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const { trackProductClick, trackAddToCart } = useActivityTracker();
  const [formProduct, setFormProduct] = useState<any | null>(null); // product with toform

  // Fetch products
  const getProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, page_size: pageSize };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;

      const productsData = await fetchProducts(params);
      setProducts(productsData.results ?? productsData);
    } catch (err) {
      console.error(err);
      toast.error(
        language === "ar" ? "فشل في جلب المنتجات" : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      console.warn("categories/brands fetch failed", err);
    }
  };

  useEffect(() => {
    fetchCategoriesAndBrands();
    getProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => getProducts(), 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedBrand, currentPage]);

  // -------- Product Card --------
  const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const existingItem = items.find(
      (i: any) => i?.product?.id?.toString() === product.id.toString()
    );
    const maxQuantity = product.stock - (existingItem?.quantity || 0);

    const handleAddToCart = () => {
      if (!user) {
        toast.error(
          language === "ar"
            ? "يرجى تسجيل الدخول لإضافة منتجات"
            : "Please log in to add products"
        );
        return;
      }
      if (maxQuantity <= 0) {
        toast.error(
          language === "ar"
            ? `لا يمكن إضافة أكثر من ${product.stock}`
            : `Cannot add more than ${product.stock}`
        );
        return;
      }
      const quantityToAdd = Math.min(quantity, maxQuantity);
      const cartProduct = {
        id: product.id.toString(),
        name: product.name,
        nameAr: product.name_ar || product.name,
        description: product.description,
        descriptionAr: product.description_ar || product.description,
        category: product.product_type,
        price: parseFloat(product.price),
        image:
          product.primary_image ||
          "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg",
        inStock: product.stock,
        specifications: {},
        tags: [],
      };
      trackAddToCart(product.slug, product.name, product.product_role);
      addItem(cartProduct, quantityToAdd);

      setQuantity(1);
    };

    const handleCartClick = () => {
      if (product.product_role === "tocart") handleAddToCart();
      else if (product.product_role === "toform") setFormProduct(product);
    };

    return (
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg overflow-hidden border border-gray-300 dark:border-gray-700 transition-all duration-300 h-full flex flex-col">
        <Link
          to={`/products/${product.slug}`}
          onClick={() => trackProductClick(product.id, product.name)}
        >
          <div className="relative bg-gray-100 dark:bg-gray-700 h-52 flex items-center justify-center overflow-hidden">
            <img
              src={
                product.primary_image ||
                "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg"
              }
              alt={
                language === "ar"
                  ? product.name_ar || product.name
                  : product.name
              }
              className="h-full w-full object-fill"
            />
          </div>
        </Link>

        <div className="p-4 flex flex-col flex-1">
          {/* Title */}
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-2">
              {language === "ar"
                ? product.name_ar || product.name
                : product.name}
            </h3>
          </Link>

          {/* Category */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {product.category_name}
          </p>

          {/* Description */}
          <p
            className={`text-gray-600 dark:text-gray-300 text-xs mt-2 flex-1 ${
              product.product_role === "tocart"
                ? "line-clamp-2"
                : "line-clamp-4"
            }`}
          >
            {language === "ar"
              ? product.description_ar || product.description
              : product.description}
          </p>

          {/* Price & Discount */}
          {product.product_role === "tocart" && (
            <div className="flex flex-wrap items-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {product.currency}
                  {parseFloat(product.price).toLocaleString()}
                </span>

                {product.compare_price &&
                  parseFloat(product.compare_price) >
                    parseFloat(product.price) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {parseFloat(product.compare_price).toLocaleString()}
                    </span>
                  )}
              </div>

              {product.discount_percentage > 0 && (
                <span className="text-sm font-semibold px-2 py-1 rounded-lg bg-[#44B3E1]/10 text-[#44B3E1]">
                  {product.discount_percentage}%{" "}
                  {language === "ar" ? "خصم" : "Off"}
                </span>
              )}
            </div>
          )}

          {/* Add to Cart & Stock */}
          <div className="mt-auto pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              {/* Quantity */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-300 rounded"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm text-gray-900 dark:text-gray-900 bg-white dark:bg-gray-100 border border-gray-300 rounded">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(q + 1, maxQuantity))
                  }
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-300 rounded"
                >
                  +
                </button>
              </div>

              {/* Cart Button */}
              <button
                onClick={handleCartClick}
                disabled={product.product_role === "tocart" && maxQuantity <= 0}
                className={`flex items-center gap-2 rounded-lg font-semibold transition-all whitespace-nowrap
    w-full md:w-auto justify-center
    ${
      product.product_role === "tocart"
        ? maxQuantity <= 0
          ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed px-4 py-2"
          : "bg-[#155F82]/80 hover:bg-[#155F82]/90 text-white px-4 py-2"
        : "bg-[#44B3E1]/80 hover:bg-[#44B3E1]/90 text-white text-sm px-2 py-2"
    }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {product.product_role === "tocart"
                  ? product.stock > 0
                    ? t("products.addToCart")
                    : t("products.outOfStock")
                  : t("services.requestService")}
              </button>
            </div>

            {/* Stock / Availability */}
            <div className="flex items-center gap-2 justify-center pt-4">
              {product.product_role === "tocart" ? (
                // ------- PRODUCT: Show Stock -------
                product.stock > 0 ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {" "}
                      {language === "ar" ? "الكمية المتوفرة" : "In Stock"}{" "}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {language === "ar"
                        ? "غير متوفر في المخزون"
                        : "Out of Stock"}
                    </span>
                  </>
                )
              ) : (
                // ------- SERVICE: Show Availability -------
                <>
                  {product.product_role ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {language === "ar"
                          ? "الخدمة متاحة"
                          : "Service Available"}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {language === "ar" ? "غير متاحة" : "Not Available"}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("common.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {language === "ar" ? "كل الفئات" : "All Categories"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Brand */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {language === "ar" ? "كل الماركات" : "All Brands"}
              </option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        {/* Pagination */}
        {products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {loading
                ? language === "ar"
                  ? "جاري تحميل المنتجات..."
                  : "Loading products..."
                : language === "ar"
                ? "لم يتم العثور على منتجات"
                : "No products found"}
            </p>
          </motion.div>
        )}
      </div>

      {/* Customer Form Modal */}
      {formProduct && (
        <CustomerFormModal
          open={!!formProduct}
          onClose={() => setFormProduct(null)}
          onSubmit={(data) => {
            apiRequest("/orders/", {
              method: "post",

              body: JSON.stringify({
                phone: data.phone,
                notes: data.details,
                slug: formProduct.slug,
                currency: formProduct.currency,
              }),
            });
            setFormProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default Products;
