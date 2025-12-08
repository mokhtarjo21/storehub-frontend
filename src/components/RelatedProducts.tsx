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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

                  {/* Description */}
                  <p
                    className={`text-gray-600 dark:text-gray-300 text-xs mt-2 flex-1 ${
                      product.product_role === "tocart"
                        ? "line-clamp-2"
                        : "line-clamp-8"
                    }`}
                  >
                    {language === "ar"
                      ? product.description_ar || product.description
                      : product.description}
                  </p>
                </div>

                {/* Price & Discount */}
                {product.product_role === "tocart" && (
                  <div className="flex flex-wrap items-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {language === "ar" ? "جنيه" : "EGP"}{" "}
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
                <div className="flex items-center gap-2 justify-center mt-4">
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
                          {product.stock}
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
                      {product.stock ? (
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
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
