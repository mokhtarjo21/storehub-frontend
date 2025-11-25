import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
type Category = { id: number; name: string };
type Brand = { id: number; name: string };

import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useApi } from "../hooks/useApi";
import { useActivityTracker } from "../hooks/useActivityTracker";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { set } from "react-hook-form";
const Products: React.FC = () => {
  const { t, language } = useLanguage();
  const { addItem, items } = useCart();
  const { trackAddToCart } = useActivityTracker();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | number>("");
  const [selectedBrand, setSelectedBrand] = useState<string | number>("");
  const API_BASE_URL = "http://192.168.1.7:8000";
  const [loading, setLoading] = useState(false);
  const { user, fetchProducts, fetchcategories, fetchbrands } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // const { data: productsData, loading: productsLoading } = useApi("/products/")
  let productsData: any = null;
  const [products, setProducts] = useState<any[]>([]);
  const getProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;

      productsData = await fetchProducts(params);
      console.log("Fetched products:", productsData);
      // backend might return {results: [...]} or plain array
      setProducts(productsData.results ?? productsData);
    } catch (err: any) {
      console.error("fetchProducts error", err);
      toast.error(
        language === "ar" ? "فشل في جلب المنتجات" : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategoriesAndBrands();
    getProducts();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      getProducts();
    }, 400);

    return () => clearTimeout(t);
  }, [searchTerm, selectedCategory, selectedBrand]);

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

  const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    const [quantity, setQuantity] = useState(1);

    const existingItem = items.find(
      (i: any) =>
        i?.product && i.product.id?.toString?.() === product.id.toString()
    );

    const maxQuantity = product.stock - (existingItem?.quantity || 0);

    const handleAddToCart = () => {
      if (!user) {
        toast.error(
          language === "ar"
            ? "يرجى تسجيل الدخول لإضافة منتجات إلى السلة"
            : "Please log in to add products to the cart"
        );
        return;
      }

      if (maxQuantity <= 0) {
        toast.error(
          language === "ar"
            ? `لا يمكن إضافة أكثر من ${product.stock} من هذا المنتج`
            : `Cannot add more than ${product.stock} of this product`
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

      addItem(cartProduct, quantityToAdd);
      trackAddToCart(product.id.toString(), product.name, product.product_type);

      setQuantity(1);
    };

    const handleDecrease = () => {
      if (quantity <= 1) {
        toast.error(
          language === "ar"
            ? "الحد الأدنى للكمية هو 1"
            : "Minimum quantity is 1"
        );
        return;
      }
      setQuantity(quantity - 1);
    };

    const handleIncrease = () => {
      if (quantity >= maxQuantity) {
        toast.error(
          language === "ar"
            ? `لا يمكن زيادة الكمية أكثر من ${maxQuantity}`
            : `Cannot increase quantity more than ${maxQuantity}`
        );
        return;
      }
      setQuantity(quantity + 1);
    };

    return (
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg overflow-hidden border border-gray-300 dark:border-gray-700 transition-all duration-300">
        <Link to={`/products/${product.slug}`}>
          <div className="relative bg-gray-100 dark:bg-gray-700 h-52 flex items-center justify-center overflow-hidden">
            {/* Image */}
            <img
              src={
                API_BASE_URL + product.primary_image ||
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

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
              {language === "ar"
                ? product.name_ar || product.name
                : product.name}
            </h3>
          </Link>

          {/* Prices */}
          <div className="mt-2">
            <div className="flex items-center gap-2 rtl:space-x-reverse">
              {/* Main Price */}
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {language === "ar" ? "جنية" : "EGP"}{" "}
                {parseFloat(product.price).toLocaleString()}
              </span>

              {/* Compare Price */}
              {product.compare_price &&
                parseFloat(product.compare_price) >
                  parseFloat(product.price) && (
                  <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                    {parseFloat(product.compare_price).toLocaleString()}
                  </span>
                )}

              {product.discount_percentage > 0 && (
                <span className="text-xl font-semibold pl-6 text-[#44B3E1] dark:text-[#44B3E1]">
                  {product.discount_percentage}%{" "}
                  {language === "ar" ? "خصم" : "Off"}
                </span>
              )}
            </div>
          </div>

          {/* Short Description */}
          <p className="text-gray-600 dark:text-gray-300 text-xs mt-2 line-clamp-2">
            {language === "ar"
              ? product.description_ar || product.description
              : product.description}
          </p>

          {/* Add to Cart Section */}
          <div className="flex items-center justify-between mt-4">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrease}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-300 rounded"
              >
                -
              </button>
              <span className="px-3 py-1 border dark:bg-gray-100 border-gray-300 rounded text-sm">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-300 rounded"
              >
                +
              </button>
            </div>

            {/* Add to Cart Noon Yellow Button */}
            <button
              onClick={handleAddToCart}
              disabled={maxQuantity <= 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                maxQuantity <= 0
                  ? "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                  : "bg-[#155F82]/80 hover:bg-[#155F82]/90 text-white"
              }`}
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {product.stock > 0
                ? t("products.addToCart")
                : t("products.outOfStock")}
            </button>
          </div>

          {/* Stock */}
          <div className="flex items-center pt-4 space-x-2 rtl:space-x-reverse">
            {product.stock > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#E97132] to-[#DF1783]"></div>
                <span className="text-sm font-medium bg-gradient-to-r from-[#E97132] to-[#DF1783] bg-clip-text text-transparent">
                  {language === "ar" ? "الكمية المتوفرة" : " In Stock"}{" "}
                  {product.stock}
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {language === "ar" ? "غير متوفر في المخزون" : "Out of Stock"}{" "}
                  {product.outofstock}
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("products.title")}
          </h1>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
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
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>

            {/* Brand */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  {language === "ar" ? "كل الماركات" : "All Brands"}
                </option>
                {brands.map((brand) => (
                  console.log(brands),
                  
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

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
                ? "لم يتم العثور على منتجات تطابق معايير البحث."
                : "No products found matching your criteria."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;
