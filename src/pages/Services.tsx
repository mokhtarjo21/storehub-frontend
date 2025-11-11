import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import toast from 'react-hot-toast';

const Services: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'price'>('title');

  // Fetch data from API
  const { data: services = [], loading: servicesLoading } = useApi('/products/services/');
  const { data: categories = [] } = useApi('/products/categories/');

  const categoryOptions = [
    { id: 'all', name: 'All Categories' },
    ...categories.map((cat: any) => ({
      id: cat.id.toString(),
      name: language === 'ar' ? cat.name_ar || cat.name : cat.name
    }))
  ];

  const durationOptions = [
    { id: 'all', name: 'All Durations' },
    { id: '1-2_hours', name: '1-2 Hours' },
    { id: 'half_day', name: 'Half Day (4 hours)' },
    { id: 'full_day', name: 'Full Day (8 hours)' },
    { id: '2-3_days', name: '2-3 Days' },
    { id: '1_week', name: '1 Week' },
    { id: '2_weeks', name: '2 Weeks' },
    { id: '1_month', name: '1 Month' },
    { id: 'custom', name: 'Custom Duration' },
  ];

  const filteredServices = useMemo(() => {
    let filtered = services.filter((service: any) => {
      const matchesSearch = language === 'ar' 
        ? (service.title_ar || service.title).toLowerCase().includes(searchTerm.toLowerCase())
        : service.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || service.category?.toString() === selectedCategory;
      const matchesDuration = selectedDuration === 'all' || service.duration === selectedDuration;
      
      return matchesSearch && matchesCategory && matchesDuration;
    });

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        default:
          return language === 'ar' 
            ? (a.title_ar || a.title).localeCompare(b.title_ar || b.title)
            : a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [services, searchTerm, selectedCategory, selectedDuration, sortBy, language]);

  const handleRequestService = async (service: any) => {
    if (!user) {
      toast.error('Please login to request a service');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/products/cart/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          item_type: 'service',
          item_id: service.id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add service to cart');
      }

      toast.success(
        language === 'ar' 
          ? `تم إضافة ${service.title_ar || service.title} إلى السلة`
          : `${service.title} added to cart`
      );
    } catch (error) {
      toast.error('Failed to add service to cart');
    }
  };

  const ServiceCard: React.FC<{ service: any }> = ({ service }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      {service.image && (
        <div className="aspect-w-16 aspect-h-9">
          <img 
            src={service.image} 
            alt={language === 'ar' ? service.title_ar || service.title : service.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {service.category_name}
          </span>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-4 h-4 mr-1" />
            {durationOptions.find(d => d.id === service.duration)?.name || service.custom_duration}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          {language === 'ar' ? service.title_ar || service.title : service.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {language === 'ar' ? service.description_ar || service.description : service.description}
        </p>

        {/* Features */}
        {service.features_list && service.features_list.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Features:
            </h4>
            <ul className="space-y-1">
              {service.features_list.slice(0, 3).map((feature: string, index: number) => (
                <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
              {service.features_list.length > 3 && (
                <li className="text-sm text-gray-500 dark:text-gray-400">
                  +{service.features_list.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600 mr-1" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${parseFloat(service.price).toLocaleString()}
              </span>
            </div>
            {service.deposit_required > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Deposit: ${parseFloat(service.deposit_required).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        <button 
          onClick={() => handleRequestService(service)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>Request Service</span>
          <ArrowRightIcon className="w-4 h-4" />
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Network Services
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional network installation, configuration, and maintenance services by certified experts.
          </p>
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
                placeholder="Search services..."
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
                {categoryOptions.map(category => (
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
                {durationOptions.map(duration => (
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
                onChange={(e) => setSortBy(e.target.value as 'title' | 'price')}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="title">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
              {servicesLoading ? 'Loading services...' : 'No services found matching your criteria.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Services;