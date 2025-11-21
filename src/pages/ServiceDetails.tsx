import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";
import ServiceFormModal from "../components/ServiceFormModal";
import { useNavigate } from "react-router-dom";
import RelatedServices from "../components/RelatedServices";

const API_BASE_URL = "http://192.168.1.7:8000/api";

const ServiceDetails: React.FC = () => {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { addService } = useCart();
  const Navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch service by slug
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/services/${slug}/`);
        const data = await res.json();
        setService(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  const handleRequestService = () => {
    if (!user) {
      toast.error(
        language === "ar"
          ? "يرجى تسجيل الدخول لطلب الخدمة"
          : "Please login first"
      );
      return;
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (customerInfo: any) => {
    try {
      await addService(service, customerInfo);

      toast.success(
        language === "ar" ? "تم إضافة الخدمة للسلة" : "Service added"
      );

      setIsModalOpen(false);

      // انتقال لصفحة الشيك آوت مثل صفحة الـ Services
      Navigate("/checkout");
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error(
        language === "ar" ? "حدث خطأ أثناء الإضافة" : "Failed to add"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center mt-20 text-gray-600 dark:text-gray-300 text-lg">
        Service not found
      </div>
    );
  }

  const title =
    language === "ar" ? service.title_ar || service.title : service.title;
  const desc =
    language === "ar"
      ? service.description_ar || service.description
      : service.description;

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
              to="/services"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Services
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {language === "ar"
                ? service.name_ar || service.name
                : service.name}
            </span>
          </nav>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* LEFT — IMAGES */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Main Image */}
            <div className="aspect-square bg-white dark:bg-gray-800 shadow-md rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={service.image}
                alt={title}
                className="w-full h-full object-fill"
              />
            </div>
          </motion.div>
          {/* RIGHT — INFO */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-tight pb-2">
              {language === "ar"
                ? service.title_ar || service.title
                : service.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              {language === "ar"
                ? service.description_ar || service.description
                : service.description}
            </p>

            {/* Prices & Availability */}
            <div className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Main Price */}
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {language === "ar" ? "جنية" : "EGP"}{" "}
                  {parseFloat(service.price).toLocaleString()}
                </span>

                {/* Availability */}
                {service.is_active ? (
                  <span className="text-sm font-medium bg-gradient-to-r from-[#E97132] to-[#DF1783] bg-clip-text text-transparent">
                    {language === "ar" ? "متوفر" : "Available"} {service.stock}
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {language === "ar" ? "غير متوفر" : "Not Available"}
                  </span>
                )}
              </div>
            </div>

            {/* Request Button */}
            <button
              onClick={handleRequestService}
              className="w-full py-3 bg-[#155F82] hover:bg-[#124b66] text-white rounded-xl text-lg font-medium shadow-md transition-all"
            >
              {t("services.requestService")}
            </button>
          </motion.div>
        </div>
        {/* FORM MODAL */}
        {isModalOpen && (
          <ServiceFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            service={service}
            onSubmit={handleSubmit}
          />
        )}
        {/* Related */}
        <div className="pt-12">{slug && <RelatedServices slug={slug!} />}</div>
      </div>
    </div>
  );
};

export default ServiceDetails;
