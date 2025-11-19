import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useApi } from "../hooks/useApi";
import { useActivityTracker } from "../hooks/useActivityTracker";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
const Products: React.FC = () => {
  const { t, language } = useLanguage();
  const { addItem, items } = useCart();
  const { trackAddToCart } = useActivityTracker();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<"name" | "price" | "category">("name");
  const API_BASE_URL = "http://192.168.1.7:8000";
  const { user } = useAuth();
  const { data: categoriesData } = useApi("/products/categories/");
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const categoryOptions = [
    { id: "all", name: t("products.category.all") },
    ...categories.map((cat: any) => ({
      id: cat.id?.toString?.() || String(cat.id),
      name: language === "ar" ? cat.name_ar || cat.name : cat.name,
    })),
  ];

  const { data: brandsData } = useApi("/products/brands/");
  const brands = Array.isArray(brandsData) ? brandsData : [];

  const brandOptions = [
    { id: "all", name: t("products.allBrands") },
    ...brands.map((brand: any) => ({
      id: brand.id?.toString?.() || String(brand.id),
      name: brand.name,
    })),
  ];

  const { data: productsData, loading: productsLoading } = useApi("/products/");
  const products = Array.isArray(productsData)
    ? productsData
    : Array.isArray(productsData?.results)
    ? productsData.results
    : Array.isArray(productsData?.products)
    ? productsData.products
    : [];
  console.log(products);

  const filteredProducts = useMemo(() => {
    let filtered = (products || []).filter((product: any) => {
      const matchesSearch =
        language === "ar"
          ? (product.name_ar || product.name)
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : product.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        product.category_name?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesBrand =
        selectedBrand === "all" ||
        product.brand_name?.toLowerCase() === selectedBrand.toLowerCase();

      const matchesPrice =
        (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
        (!priceRange.max || product.price <= parseFloat(priceRange.max));

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "category":
          return (a.category_name || "").localeCompare(b.category_name || "");
        default:
          return language === "ar"
            ? (a.name_ar || a.name).localeCompare(b.name_ar || b.name)
            : a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedBrand,
    priceRange,
    sortBy,
    language,
  ]);

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
                <div className="w-3 h-3 bg-[#E97132] dark:bg-[#E97132] rounded-full"></div>
                <span className="text-[#E97132] dark:text-[#E97132] font-medium">
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

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {brandOptions.map((brand) => (
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
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {productsLoading
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
