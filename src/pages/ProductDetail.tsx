import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";
import RelatedProducts from "../components/RelatedProducts";

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, loading, error } = useApi(`/products/${slug}/`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Product not found
          </h2>
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const images =
    product.images?.length > 0 ? product.images : [{ image: product.image }];
  const currentImage =
    images[selectedImage]?.image ||
    product.image ||
    "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg";

  const existingItem = items.find(
    (i: any) => i.product.id.toString() === product.id.toString()
  );
  const alreadyInCart = existingItem ? existingItem.quantity : 0;
  const maxQuantity = product.stock - alreadyInCart;

  const handleAddToCart = async () => {
    if (!product) return;

    if (maxQuantity <= 0) {
      toast.error(
        language === "ar"
          ? `لا يمكن إضافة أكثر من ${product.stock} من هذا المنتج`
          : `Cannot add more than ${product.stock} of this product`
      );
      return;
    }

    const finalQuantity = Math.min(quantity, maxQuantity);

    const cartProduct = {
      id: product.id.toString(),
      name: product.name,
      nameAr: product.name_ar || product.name,
      description: product.description,
      descriptionAr: product.description_ar || product.description,
      category: product.product_type,
      price: parseFloat(product.price),
      image:
        product.image ||
        product.images?.[0]?.image ||
        "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg",
      inStock: product.stock,
      specifications:
        product.specifications?.reduce((acc: any, spec: any) => {
          acc[spec.name] = spec.value;
          return acc;
        }, {}) || {},
      tags: [],
    };

    try {
      await addItem(cartProduct, finalQuantity);
      setQuantity(1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              to="/products"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {language === "ar"
                ? product.name_ar || product.name
                : product.name}
            </span>
          </nav>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Images Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="aspect-square bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-fill"
              />
            </div>

            {images.length > 1 && (
              <div className="flex space-x-3 rtl:space-x-reverse overflow-x-auto pb-2">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-full h-full rounded-xl overflow-hidden border-2 transition-all shadow-sm ${
                      selectedImage === index
                        ? "border-blue-600 scale-105"
                        : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-fill"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-snug">
              {language === "ar"
                ? product.name_ar || product.name
                : product.name}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-lg">
              {language === "ar"
                ? product.description_ar || product.description
                : product.description}
            </p>

            {/* Price */}
            <div className="flex items-end gap-3 mt-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {language === "ar" ? "جنية" : "EGP"}{" "}
                {parseFloat(product.price).toLocaleString()}
              </span>

              {product.compare_price && (
                <span className="text-xl line-through text-gray-400 dark:text-gray-500">
                  {parseFloat(product.compare_price).toLocaleString()}
                </span>
              )}

              {product.discount_percentage > 0 && (
                <span className="text-xl font-bold text-[#44B3E1]">
                  {product.discount_percentage}%{" "}
                  {language === "ar" ? "خصم" : "Off"}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
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
                  <span className="text-red-500 font-medium text-sm">
                    {language === "ar" ? "غير متوفر" : "Out of Stock"}
                  </span>
                </>
              )}
            </div>

            {/* Quantity + Cart */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => {
                  if (quantity <= 1)
                    return toast.error(
                      language === "ar"
                        ? "لا يمكن أن تكون الكمية أقل من 1"
                        : "Quantity cannot be less than 1"
                    );
                  setQuantity((q) => q - 1);
                }}
                className="w-10 h-10 bg-gray-200 dark:bg-gray-300 rounded-lg flex items-center justify-center text-lg font-bold"
              >
                -
              </button>

              <span className="px-5 py-2 border rounded-lg bg-white dark:bg-gray-100 text-sm">
                {quantity}
              </span>

              <button
                onClick={() => {
                  if (quantity >= maxQuantity)
                    return toast.error(
                      language === "ar"
                        ? `لا يمكن إضافة أكثر من ${maxQuantity}`
                        : `Cannot add more than ${maxQuantity}`
                    );
                  setQuantity((q) => q + 1);
                }}
                className="w-10 h-10 bg-gray-200 dark:bg-gray-300 rounded-lg flex items-center justify-center text-lg font-bold"
              >
                +
              </button>

              <button
                onClick={handleAddToCart}
                disabled={maxQuantity <= 0}
                className={`flex-1 py-3 rounded-xl text-white font-medium shadow-md transition-all flex items-center justify-center gap-2 ${
                  maxQuantity > 0
                    ? "bg-[#155F82] hover:bg-[#124b66]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {maxQuantity > 0
                  ? t("products.addToCart")
                  : t("products.outOfStock")}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        <div className="pt-12">
          {slug && <RelatedProducts productSlug={slug} />}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
