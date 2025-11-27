import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useApi } from "../hooks/useApi";

interface RelatedProductsProps {
  productSlug: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ productSlug }) => {
  const { language } = useLanguage();
  const { data: products, loading } = useApi(
    `/products/${productSlug}/related/`
  );
  console.log(products);
  if (loading) {
    return (
      <div className="py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        {language === "ar" ? "منتجات ذات صلة" : "Related Products"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: any, index: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex"
          >
            <Link
              to={`/products/${product.slug}`}
              className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden w-full h-full transform hover:-translate-y-1 duration-300"
            >
              {/* صورة المنتج */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                <img
                  src={
                    product.primary_image ||
                    product.primary_image?.image ||
                    "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg"
                  }
                  alt={
                    language === "ar"
                      ? product.name_ar || product.name
                      : product.name
                  }
                  className="w-full h-full object-fill group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* محتوى الكارد */}
              <div className="p-4 flex flex-col justify-between flex-1">
                {/* الاسم والوصف */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                    {language === "ar"
                      ? product.name_ar || product.name
                      : product.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-lg line-clamp-2">
                    {language === "ar"
                      ? product.description_ar || product.description
                      : product.description}
                  </p>
                </div>

                {/* السعر والخصم */}
                <div className="py-2 flex flex-wrap items-center gap-2 rtl:space-x-reverse mt-2">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {language === "ar" ? "جنية" : "EGP"}{" "}
                    {parseFloat(product.price).toLocaleString()}
                  </span>

                  {product.compare_price &&
                    parseFloat(product.compare_price) >
                      parseFloat(product.price) && (
                      <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                        {parseFloat(product.compare_price).toLocaleString()}
                      </span>
                    )}

                  {parseFloat(product.discount_percentage || "0") > 0 && (
                    <span className="text-sm font-semibold px-2 py-1 rounded-lg bg-gradient-to-r from-[#44B3E1]/20 to-[#44B3E1]/10 text-[#44B3E1]">
                      {parseFloat(product.discount_percentage)}%{" "}
                      {language === "ar" ? "خصم" : "Off"}
                    </span>
                  )}
                </div>

                {/* حالة المخزون */}
                <div className="flex items-center justify-center pt-4 gap-2">
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
                      <span className="text-red-600 dark:text-red-400 font-medium text-sm">
                        {language === "ar"
                          ? "غير متوفر في المخزون"
                          : "Out of Stock"}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
