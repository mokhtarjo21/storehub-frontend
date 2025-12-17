import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import { useCart } from "../contexts/CartContext";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";
import RelatedProducts from "../components/RelatedProducts";
import CustomerFormModal from "../components/FormCart";
import { apiRequest } from "../utils/api";
import { useActivityTracker } from "../hooks/useActivityTracker";
import { useAuth } from "../contexts/AuthContext";
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
    <div className="flex flex-col h-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <img
          src={currentImage}
          alt={`Product ${selectedImage + 1}`}
          className="w-full h-full object-fill"
        />
      </motion.div>

      {carouselImages.length > 1 && (
        <div className="flex gap-2 mt-2">
          {carouselImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${
                selectedImage === idx
                  ? "border-blue-600 scale-105"
                  : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
              }`}
            >
              <img
                src={img.image}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-fill"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Main ProductDetail Component ----------
const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const { trackProductView } = useActivityTracker();
  const { data: product, loading, error } = useApi(`/products/${slug}/`);
  const { user } = useAuth();
  const navigate = useNavigate();
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
  trackProductView(slug, product.name);
  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
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

  const handleCartClick = () => {
    if (product.product_role === "tocart") {
      if (!user) {
        navigate("/login");
        return;
      }
      handleAddToCart();
    } else if (product.product_role === "toform") {
      if (!user) {
        navigate("/login");
        return;
      }
      setFormOpen(true);
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-10 lg:gap-x-14">
          {/* العمود الأول: الصور */}
          <div>
            <ProductImageCarousel
              images={product.images}
              mainImage={product.image}
            />
          </div>

          {/* العمود الثاني: كل شيء آخر */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 flex flex-col"
          >
            {/* الاسم والوصف */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-snug">
              {language === "ar"
                ? product.name_ar || product.name
                : product.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed break-words">
              {language === "ar"
                ? product.description_ar || product.description
                : product.description}
            </p>

            {/* السعر + الخصم + حالة المخزون */}
            <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
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

              {/* Stock / Availability */}
              <div className="flex items-center gap-2 justify-center pt-4">
                {product.product_role === "tocart" ? (
                  // ------- PRODUCT: Show Stock -------
                  product.stock > 0 ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {" "}
                        {language === "ar"
                          ? "الكمية المتوفرة"
                          : "In Stock"}{" "}
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

            {/* المخزون + الكمية + زر السلة */}
            <div className="flex items-center gap-3 pt-3">
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
                disabled={product.product_role === "tocart" && maxQuantity <= 0}
                className={`flex-1 py-3 rounded-xl text-white font-medium shadow-md transition-all flex items-center justify-center gap-2 ${
                  product.product_role === "tocart"
                    ? maxQuantity > 0
                      ? "bg-[#155F82] hover:bg-[#124b66]"
                      : "bg-gray-400 cursor-not-allowed"
                    : "bg-[#44B3E1] hover:bg-[#3399cc]"
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {product.product_role === "tocart"
                  ? maxQuantity > 0
                    ? t("products.addToCart")
                    : t("products.outOfStock")
                  : t("services.requestService")}
              </button>
            </div>

            {/* ---------- Professional Specs Card ---------- */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* عنوان الكرت */}
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
                  {language === "ar" ? "بيانات المنتج" : "Product Details"}
                </h2>
              </div>

              {/* الجدول */}
              <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                <tbody>
                  {/* الفئة */}
                  {product.category &&
                    (product.category.name || product.category.name_ar) && (
                      <tr className="transition-all hover:bg-blue-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-5 font-medium w-1/3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {language === "ar" ? "الفئة" : "Category"}
                        </td>
                        <td className="py-3 px-5 border-b border-gray-200 dark:border-gray-700">
                          {language === "ar"
                            ? product.category.name_ar || product.category.name
                            : product.category.name}
                        </td>
                      </tr>
                    )}
                  {/* مواصفات المنتج */}
                  {product.specifications
                    ?.filter((spec) =>
                      language === "ar"
                        ? spec.value_ar || spec.name_ar
                        : spec.value || spec.name
                    )
                    .map((spec: any, i: number) => (
                      <tr
                        key={spec.id}
                        className={`transition-all ${
                          i % 2 === 0
                            ? "bg-gray-50 dark:bg-gray-800/50"
                            : "bg-white dark:bg-gray-800"
                        } hover:bg-blue-50 dark:hover:bg-gray-700`}
                      >
                        <td className="py-3 px-5 font-medium w-1/3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {language === "ar" && spec.name_ar
                            ? spec.name_ar
                            : spec.name}
                        </td>
                        <td className="py-3 px-5 border-b border-gray-200 dark:border-gray-700">
                          {language === "ar" && spec.value_ar
                            ? spec.value_ar
                            : spec.value}
                        </td>
                      </tr>
                    ))}
                  {/* معلومات إضافية */}
                  {[
                    {
                      label: language === "ar" ? "باركود" : "Barcode",
                      value: product.barcode,
                    },
                    {
                      label: language === "ar" ? "الوزن" : "Weight",
                      value: product.weight,
                    },
                    {
                      label: language === "ar" ? "الأبعاد" : "Dimensions",
                      value: product.dimensions,
                    },
                  ]
                    .filter((item) => item.value) // هنا نتأكد إن القيمة موجودة قبل العرض
                    .map((item, i) => (
                      <tr
                        key={i}
                        className={`transition-all ${
                          i % 2 === 0
                            ? "bg-gray-50 dark:bg-gray-800/50"
                            : "bg-white dark:bg-gray-800"
                        } hover:bg-blue-50 dark:hover:bg-gray-700`}
                      >
                        <td className="py-3 px-5 font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                          {item.label}
                        </td>
                        <td className="py-3 px-5 border-b border-gray-200 dark:border-gray-700">
                          {item.value}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        <div className="pt-12">
          {slug && <RelatedProducts productSlug={slug} />}
        </div>

        {/* Customer Form Modal */}

        <CustomerFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={(data) => {
            apiRequest("/orders/", {
              method: "post",
              body: JSON.stringify({
                phone: data.phone,
                notes: data.details,
                slug: product.slug,
                currency: product.currency,
              }),
            });
            setFormOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
