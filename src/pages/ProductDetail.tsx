import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  StarIcon,
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
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
  const [isFavorite, setIsFavorite] = useState(false);

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

  // العثور على كمية المنتج في السلة إن وجدت
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
      toast.success(
        language === "ar"
          ? `تم إضافة ${finalQuantity} من ${
              product.name_ar || product.name
            } إلى السلة`
          : `Added ${finalQuantity} ${product.name} to cart`
      );
      setQuantity(1); // إعادة تعيين الكمية بعد الإضافة
    } catch (error) {
      console.error(error);
      toast.error(
        language === "ar"
          ? "فشل في إضافة المنتج إلى السلة"
          : "Failed to add product to cart"
      );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(
        language === "ar"
          ? "تم نسخ رابط المنتج!"
          : "Product link copied to clipboard!"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
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
            <span className="text-gray-900 dark:text-white">
              {language === "ar"
                ? product.name_ar || product.name
                : product.name}
            </span>
          </nav>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-fill"
              />
            </div>
            {images.length > 1 && (
              <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <img
                      src={image.image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {language === "ar"
                  ? product.name_ar || product.name
                  : product.name}
              </h1>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.average_rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 rtl:ml-0 rtl:mr-2 text-sm text-gray-600 dark:text-gray-400">
                    ({product.review_count || 0} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  SKU: {product.sku}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${parseFloat(product.price).toLocaleString()}
                </span>
                {product.compare_price &&
                  parseFloat(product.compare_price) >
                    parseFloat(product.price) && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        ${parseFloat(product.compare_price).toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded text-sm font-medium">
                        {product.discount_percentage}% OFF
                      </span>
                    </>
                  )}
              </div>
              {product.brand && (
                <p className="text-gray-600 dark:text-gray-400">
                  Brand:{" "}
                  <span className="font-medium">{product.brand.name}</span>
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {product.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* زر - */}
              <button
                onClick={() => {
                  if (quantity <= 1) {
                    toast.error(
                      language === "ar"
                        ? "لا يمكن أن تكون الكمية أقل من 1"
                        : "Quantity cannot be less than 1"
                    );
                    return;
                  }
                  setQuantity((prev) => Math.max(1, prev - 1));
                }}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-l-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                -
              </button>

              {/* الرقم الحالي */}
              <span className="px-4 py-2  border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                {quantity}
              </span>

              {/* زر + */}
              <button
                onClick={() => {
                  if (quantity >= maxQuantity) {
                    toast.error(
                      language === "ar"
                        ? `لا يمكن إضافة أكثر من ${maxQuantity} من هذا المنتج`
                        : `Cannot add more than ${maxQuantity} of this product`
                    );
                    return;
                  }
                  setQuantity((prev) => Math.min(prev + 1, maxQuantity));
                }}
                disabled={quantity >= maxQuantity}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                +
              </button>

              {/* زر إضافة للسلة */}
              <button
                onClick={handleAddToCart}
                disabled={maxQuantity <= 0}
                className={`ml-2 flex-1 ${
                  maxQuantity <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>{maxQuantity > 0 ? "Add to Cart" : "Out of Stock"}</span>
              </button>
            </div>

            {/* Favorite & Share */}
            <div className="flex space-x-4 rtl:space-x-reverse mt-4">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              <button
                onClick={handleShare}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ShareIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <TruckIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Free Shipping
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      On orders over $100
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Warranty
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      1 year manufacturer warranty
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {slug && <RelatedProducts productSlug={slug} />}
      </div>
    </div>
  );
};

export default ProductDetail;
