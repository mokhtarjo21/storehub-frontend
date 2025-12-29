import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { apiRequest, handleApiResponse } from "../utils/api";

interface RelatedServicesProps {
  slug: string;
}

const RelatedServices: React.FC<RelatedServicesProps> = ({ slug }) => {
  const { language } = useLanguage();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    const loadRelated = async () => {
      try {
        const response = await apiRequest(
          `/products/${slug}/service-related/`,
          { method: "GET" }
        );
        const data = await handleApiResponse(response);
        setServices(data);
      } catch (err) {
        console.error("Failed to load related services", err);
      } finally {
        setLoading(false);
      }
    };
    loadRelated();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!services || services.length === 0) return null;

  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        {language === "ar" ? "خدمات مشابهة" : "Related Services"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s, index) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/services/${s.slug}`}
              className="group block bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img
                  src={
                    s.image.startsWith("http") ? s.image : `${s.image}`
                  }
                  alt={language === "ar" ? s.title_ar || s.title : s.title}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col justify-between h-full">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
                  {language === "ar" ? s.title_ar || s.title : s.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm py-2 line-clamp-3">
                  {language === "ar"
                    ? s.description_ar || s.description
                    : s.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {language === "ar" ? "جنية" : "EGP"}{" "}
                    {parseFloat(s.price).toLocaleString()}
                  </span>

                  {s.is_active === true ? (
                    <span className="text-[#E97132] dark:text-[#E97132] text-sm font-medium">
                      {language === "ar" ? "متوفر" : "Available"} {s.stock}
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                      {language === "ar" ? "غير متوفر" : "Not Available"}
                    </span>
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

export default RelatedServices;
