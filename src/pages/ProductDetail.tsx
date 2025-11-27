import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";
import RelatedProducts from "../components/RelatedProducts";
import CustomerFormModal from "../components/FormCart";
// ---------- Helper Component ----------
const InfoItem = ({ label, value }: any) => (
  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
    <p className="text-gray-900 dark:text-white font-medium">{label}</p>
    <p className="text-gray-600 dark:text-gray-300 mt-1">{value || "-"}</p>
  </div>
);

// ---------- Image Carousel ----------
interface ProductImage {
  id: number;
  image: string;
  alt_text?: string | null;
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  mainImage?: string | null;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images,
  mainImage,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const carouselImages =
    images.length > 0 ? images : [{ id: 0, image: mainImage || "" }];
  const currentImage = carouselImages[selectedImage]?.image;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full aspect-square bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <img
          src={currentImage}
          alt={`Product ${selectedImage + 1}`}
          className="w-full h-full object-fill"
        />
      </motion.div>

      {carouselImages.length > 1 && (
        <div className="flex flex-nowrap gap-2 overflow-x-hidden overflow-y-hidden">
          {carouselImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all overflow-hidden ${
                selectedImage === idx
                  ? "border-blue-600 scale-105"
                  : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
            >
              <img
                src={img.image}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ----

// ---------- Main ProductDetail Component ----------
const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const { data: product, loading, error } = useApi(`/products/${slug}/`);
  console.log(product);

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
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

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
      image: product.image || product.images?.[0]?.image || "",
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
      toast.success(
        language === "ar" ? "تم إضافة المنتج للسلة" : "Product added to cart"
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ---------- Handle Cart Click ----------
  const handleCartClick = () => {
    if (product.product_role === "tocart") {
      handleAddToCart();
    } else if (product.product_role === "toform") {
      setFormOpen(true);
    }
  };

  const handleFormSubmit = (customerData: any) => {
    console.log("Customer Data:", customerData);
    handleAddToCart();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
            <span className="text-gray-900 dark:text-white font-medium">
              {language === "ar"
                ? product.name_ar || product.name
                : product.name}
            </span>
          </nav>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          <ProductImageCarousel
            images={product.images}
            mainImage={product.image}
          />

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
                <span className="text-xl font-semibold px-2 py-1 rounded bg-[#44B3E1]/10 text-[#44B3E1]">
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
                    {language === "ar" ? "الكمية المتوفرة" : "In Stock"}{" "}
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
                onClick={handleCartClick}
                disabled={product.product_role === "tocart" && maxQuantity <= 0} // تعطيل فقط للـ tocart حسب المخزون
                className={`flex-1 py-3 rounded-xl text-white font-medium shadow-md transition-all flex items-center justify-center gap-2 ${
                  product.product_role === "tocart"
                    ? maxQuantity > 0
                      ? "bg-[#155F82] hover:bg-[#124b66]"
                      : "bg-gray-400 cursor-not-allowed"
                    : "bg-[#44B3E1] hover:bg-[#3399cc]" // لون مختلف للخدمة
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {
                  product.product_role === "tocart"
                    ? maxQuantity > 0
                      ? t("products.addToCart")
                      : t("products.outOfStock")
                    : t(
                        "services.requestService"
                      ) /* أضف هذا المفتاح في ملفات الترجمة */
                }
              </button>
            </div>
          </motion.div>
        </div>

        {/* ---------- Full Product Details ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === "ar" ? "تفاصيل المنتج" : "Product Details"}
          </h2>

          {/* Specifications */}
          {product.specifications?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {language === "ar" ? "المواصفات" : "Specifications"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.specifications.map((spec: any) => (
                  <div
                    key={spec.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {language === "ar" && spec.name_ar
                        ? spec.name_ar
                        : spec.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      {language === "ar" && spec.value_ar
                        ? spec.value_ar
                        : spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          {product.category && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {language === "ar" ? "الفئة" : "Category"}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">
                    {language === "ar" ? "الاسم:" : "Name:"}
                  </span>{" "}
                  {language === "ar"
                    ? product.category.name_ar || product.category.name
                    : product.category.name}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">
                    {language === "ar" ? "الوصف:" : "Description:"}
                  </span>{" "}
                  {language === "ar"
                    ? product.category.description_ar ||
                      product.category.description
                    : product.category.description}
                </p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {language === "ar" ? "بيانات إضافية" : "Additional Info"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoItem label="SKU" value={product.sku} />
              <InfoItem
                label={language === "ar" ? "الباركود" : "Barcode"}
                value={product.barcode}
              />
              <InfoItem
                label={language === "ar" ? "النوع" : "Type"}
                value={product.product_type}
              />
              <InfoItem
                label={language === "ar" ? "الدور" : "Role"}
                value={product.product_role}
              />
              <InfoItem
                label={language === "ar" ? "متوفر؟" : "In Stock?"}
                value={product.is_in_stock ? "Yes" : "No"}
              />
              <InfoItem
                label={language === "ar" ? "مخزون منخفض؟" : "Low Stock?"}
                value={product.is_low_stock ? "Yes" : "No"}
              />
              <InfoItem
                label={language === "ar" ? "السعر السابق" : "Compare Price"}
                value={product.compare_price || "-"}
              />
              <InfoItem
                label={language === "ar" ? "الوزن" : "Weight"}
                value={product.weight || "-"}
              />
              <InfoItem
                label={language === "ar" ? "الأبعاد" : "Dimensions"}
                value={product.dimensions || "-"}
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {language === "ar" ? "التواريخ" : "Dates"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoItem
                label={language === "ar" ? "تاريخ الإنشاء" : "Created At"}
                value={new Date(product.created_at).toLocaleString()}
              />
              <InfoItem
                label={language === "ar" ? "آخر تحديث" : "Updated At"}
                value={new Date(product.updated_at).toLocaleString()}
              />
            </div>
          </div>
        </motion.div>

        <div className="pt-12">
          {slug && <RelatedProducts productSlug={slug} />}
        </div>

        {/* Customer Form Modal */}
        <CustomerFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
