import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";
import ServiceFormModal, { CustomerInfo } from "../components/ServiceFormModal";

const Services: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { addService } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"title" | "price">("title");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from API
  const { data: services = [], loading: servicesLoading } = useApi(
    "/products/services/"
  );
  console.log(services);

  // const { data: categories = [] } = useApi('/products/categories/');
  const { data: categoriesData } = useApi("/products/categories/");

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : Array.isArray(categoriesData?.results)
    ? categoriesData.results
    : [];

  const categoryOptions = [
    { id: "all", name: t("products.category.all") },
    ...categories.map((cat: any) => ({
      id: cat.id?.toString?.() || String(cat.id),
      name: language === "ar" ? cat.name_ar || cat.name : cat.name,
    })),
  ];

  const durationOptions = [
    { id: "all", name: t("services.allDurations") },
    { id: "1-2_hours", name: t("services.duration.1-2_hours") },
    { id: "half_day", name: t("services.duration.half_day") },
    { id: "full_day", name: t("services.duration.full_day") },
    { id: "2-3_days", name: t("services.duration.2-3_days") },
    { id: "1_week", name: t("services.duration.1_week") },
    { id: "2_weeks", name: t("services.duration.2_weeks") },
    { id: "1_month", name: t("services.duration.1_month") },
    { id: "custom", name: t("services.duration.custom") },
  ];

  const filteredServices = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return (services?.results || [])
      .filter((service: any) => {
        // البحث على الإنجليزي + العربي
        const titleMatch =
          service.title?.toLowerCase().includes(term) ||
          service.title_ar?.toLowerCase().includes(term);

        // فلاتر أخرى
        const categoryMatch =
          selectedCategory === "all" ||
          service.category?.toString() === selectedCategory;

        const durationMatch =
          selectedDuration === "all" || service.duration === selectedDuration;

        return titleMatch && categoryMatch && durationMatch;
      })
      .sort((a, b) => {
        if (sortBy === "price")
          return parseFloat(a.price) - parseFloat(b.price);
        // sort by title with fallback to Arabic
        const titleA = language === "ar" ? a.title_ar || a.title : a.title;
        const titleB = language === "ar" ? b.title_ar || b.title : b.title;
        return titleA.localeCompare(titleB);
      });
  }, [
    services,
    searchTerm,
    selectedCategory,
    selectedDuration,
    sortBy,
    language,
  ]);

  const handleRequestService = (service: any) => {
    if (!user) {
      toast.error(
        language === "ar"
          ? "يرجى تسجيل الدخول لطلب خدمة"
          : "Please login to request a service"
      );
      return;
    }

    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleServiceFormSubmit = async (customerInfo: CustomerInfo) => {
    if (!selectedService) return;

    try {
      await addService(selectedService, customerInfo);
      toast.success(
        language === "ar"
          ? "تم إضافة الخدمة بنجاح"
          : "Service added successfully"
      );
      setIsModalOpen(false);
      setSelectedService(null);
      // Navigate to checkout page
      navigate("/checkout");
    } catch (error) {
      console.error("Error adding service:", error);
      throw error;
    }
  };

  const ServiceCard: React.FC<{ service: any }> = ({ service }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/services/${service.slug}`)}
      className="cursor-pointer bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm 
            hover:shadow-lg transition-all duration-300 overflow-hidden 
            border border-gray-400 dark:border-gray-700"
    >
      {service.image && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={service.image}
            alt={
              language === "ar"
                ? service.title_ar || service.title
                : service.title
            }
            className="w-full h-64 object-fill"
          />
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-tight pb-2">
          {language === "ar"
            ? service.title_ar || service.title
            : service.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {language === "ar"
            ? service.description_ar || service.description
            : service.description}
        </p>

        {/* Prices */}
        <div className="pb-4">
          <div className="flex items-center gap-2 rtl:space-x-reverse">
            {/* Main Price */}
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {language === "ar" ? "جنية" : "EGP"}{" "}
              {parseFloat(service.price).toLocaleString()}
            </span>
            <div className="ml-auto">
              {service.is_active === true ? (
                <span className="text-[#E97132] dark:text-[#E97132] text-sm font-medium">
                  {language === "ar" ? "متوفر" : "Available"} {service.stock}
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                  {language === "ar" ? "غير متوفر" : "Not Available"}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation(); // ← مهم جداً علشان ما يفتحش صفحة التفاصيل!
            handleRequestService(service);
          }}
          className="w-full bg-[#155F82]/80 hover:bg-[#155F82]/90 text-white font-medium py-3 rounded-lg"
        >
          {t("services.requestService")}
        </button>
      </div>
    </motion.div>
  );

  if (servicesLoading) {
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
          className="text-center p-4"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("services.title")}
          </h1>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t("services.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {durationOptions.map((duration) => (
                  <option key={duration.id} value={duration.id}>
                    {duration.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "title" | "price")}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="title">{t("services.sortByName")}</option>
                <option value="price">{t("services.sortByPrice")}</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </motion.div>

        {filteredServices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {servicesLoading
                ? t("services.loading")
                : t("services.noServices")}
            </p>
          </motion.div>
        )}
      </div>

      {/* Service Form Modal */}
      {selectedService && (
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          onSubmit={handleServiceFormSubmit}
        />
      )}
    </div>
  );
};

export default Services;
