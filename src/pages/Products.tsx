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
    { id: "all", name: "All Brands" },
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
        product.category?.toString() === selectedCategory;
      const matchesBrand =
        selectedBrand === "all" || product.brand?.toString() === selectedBrand;

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
      (i: any) => i.product.id.toString() === product.id.toString()
    );
    const maxQuantity = product.stock - (existingItem?.quantity || 0);

    const handleAddToCart = () => {
      if (!user){
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
      <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Link to={`/products/${product.slug}`}>
          <div className="aspect-w-16 aspect-h-9">
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
              className="w-full h-full object-fill"
            />
          </div>
        </Link>

        <div className="p-6">
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {language === "ar"
                ? product.name_ar || product.name
                : product.name}
            </h3>
          </Link>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {language === "ar"
              ? product.description_ar || product.description
              : product.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${parseFloat(product.price).toLocaleString()}
            </span>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={handleDecrease}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                -
              </button>
              <span className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                +
              </button>
              <button
                onClick={handleAddToCart}
                disabled={maxQuantity <= 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  maxQuantity <= 0
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>
                  {product.stock > 0
                    ? t("products.addToCart")
                    : t("products.outOfStock")}
                </span>
              </button>
            </div>
          </div>

          {product.stock > 0 && product.stock <= 10 && (
            <span className="text-orange-600 dark:text-orange-400">
              Only {product.stock} left
            </span>
          )}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("products.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our comprehensive range of network devices, software
            licenses, and professional services.
          </p>
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
                ? "Loading products..."
                : "No products found matching your criteria."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Products;
