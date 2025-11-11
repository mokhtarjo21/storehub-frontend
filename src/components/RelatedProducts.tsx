import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../hooks/useApi';

interface RelatedProductsProps {
  productSlug: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ productSlug }) => {
  const { language } = useLanguage();
  const { data: products, loading } = useApi(`/products/${productSlug}/related/`);

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
        {language === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: any, index: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/products/${product.slug}`}
              className="group block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img
                  src={product.image || product.images?.[0]?.image || 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg'}
                  alt={language === 'ar' ? product.name_ar || product.name : product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {language === 'ar' ? product.name_ar || product.name : product.name}
                </h3>

                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.average_rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 rtl:ml-0 rtl:mr-2 text-xs text-gray-500 dark:text-gray-400">
                    ({product.review_count || 0})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.compare_price && parseFloat(product.compare_price) > parseFloat(product.price) && (
                    <span className="text-sm text-gray-500 line-through">
                      ${parseFloat(product.compare_price).toFixed(2)}
                    </span>
                  )}
                </div>

                {product.stock > 0 ? (
                  <span className="inline-block mt-2 text-xs text-green-600 dark:text-green-400">
                    {language === 'ar' ? 'متوفر' : 'In Stock'}
                  </span>
                ) : (
                  <span className="inline-block mt-2 text-xs text-red-600 dark:text-red-400">
                    {language === 'ar' ? 'غير متوفر' : 'Out of Stock'}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
