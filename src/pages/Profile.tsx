import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { updateAvatar } from "../utils/api";
import toast from "react-hot-toast";

import {
  UserIcon,
  CameraIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { changePassword } from "../utils/api";
import MyInfo from "../components/Profile/MyInfo";
import MyOrders from "../components/Profile/MyOrders";
import MyNotifications from "../components/Profile/MyNotifications";


const passwordSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

type PasswordFormData = yup.InferType<typeof passwordSchema>;

const Profile: React.FC = () => {
  const { user,checkApiConnection } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("info");
  const [imageFile, setImageFile] = useState<File | null>(null); // Add state for image
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Add state for image preview

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });


  const isRTL = language === "ar";

  const passwordForm = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      toast.success(t("profile.passwordChanged"));
      passwordForm.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("profile.passwordChangeFailed");
      toast.error(errorMessage);
    }
  };

  // ترجمة التبويبات
  const getTabName = (id: string) => {
    const tabNames: { [key: string]: { en: string; ar: string } } = {
      info: { en: "My Info", ar: "معلوماتي" },
      orders: { en: "My Orders", ar: "طلباتي" },
      notifications: { en: "Notifications", ar: "الإشعارات" },
      activity: { en: "My Activity", ar: "نشاطي" },
      security: { en: "Security", ar: "الأمان" },
      preferences: { en: "Preferences", ar: "التفضيلات" },
      company: { en: "Company Panel", ar: "لوحة الشركة" },
      affiliate: { en: "Affiliate Panel", ar: "لوحة المسوق" },
    };
    return tabNames[id]?.[language] || id;
  };

  const baseTabs = [
    { id: "info", icon: UserIcon },
    { id: "orders", icon: ShoppingBagIcon },
    { id: "notifications", icon: BellIcon },
    
    { id: "security", icon: KeyIcon },
    { id: "preferences", icon: GlobeAltIcon },
  ];

  const additionalTabs = [];
  if (user?.role === "company_admin") {
    additionalTabs.push({ id: "company", icon: BuildingOfficeIcon });
  }
  if (user?.role === "affiliate") {
    additionalTabs.push({ id: "affiliate", icon: ChartBarIcon });
  }

  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl); // Show a preview of the selected image

    try {
      // Add sleep function to delay execution
      await sleep(3000); // 3000ms = 3 seconds

      // Prepare FormData with the image file and other user data
      const formData = new FormData();
      formData.append("avatar", file);  // Appending the image file (use 'file' instead of 'imageFile')

      // Pass the formData directly to the updateAvatar function
      await updateAvatar(formData);
      await checkApiConnection()
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(t("profile.imageUpdateFailed"));
    }
  }
};

// Sleep function to introduce delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


  const tabs = [...baseTabs, ...additionalTabs];

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1
            className={`text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("profile.title")}
          </h1>
          <p
            className={`mt-2 text-gray-600 dark:text-gray-300 text-sm lg:text-base ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {t("profile.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              {/* Avatar */}
              <div className={"text-center mb-6"}>
                <div className="relative inline-block">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-blue-500 rounded-full flex items-center justify-center">
                    <img
                      src={imagePreview || user?.avatar || "/default-avatar.png"} // Show preview or default image
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => document.getElementById("fileInput")?.click()}
                    className={`absolute bottom-0 ${isRTL ? "left-0" : "right-0"} bg-white dark:bg-gray-700 rounded-full p-1 lg:p-2 shadow-lg border border-gray-200 dark:border-gray-600`}
                  >
                    <CameraIcon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  {/* Hidden file input */}
                  <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                  <div className="p-4 lg:p-6">
                {/* Add a button to trigger the image upload */}
                
              </div>
                <h3 className="mt-3 lg:mt-4 text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                  {user?.full_name}
                </h3>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
                <span
                  className={`inline-flex mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                    user?.role === "super_admin"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : user?.role === "company_admin"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : user?.role === "company_staff"
                      ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
                      : user?.role === "affiliate"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {user?.role}
                </span>
              </div>
              {/* Navigation */}
              <nav
                className={`space-y-1 ${isRTL ? "text-right" : "text-left"}`}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors  ${
                      activeTab === tab.id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <tab.icon
                      className={`w-4 h-4 lg:w-5 lg:h-5 ${
                        isRTL ? "ml-3" : "mr-3"
                      }`}
                    />
                    <span className="text-xs lg:text-sm">
                      {getTabName(tab.id)}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-[500px]">
              
             
              {/* My Info Tab */}
              {activeTab === "info" && <MyInfo />}

              {/* My Orders Tab */}
              {activeTab === "orders" && (
                <div className="p-4 lg:p-6">
                  <h2
                    className={`text-lg font-semibold text-gray-900 dark:text-white mb-6 `}
                  >
                    {getTabName("orders")}
                  </h2>
                  <MyOrders />
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="p-4 lg:p-6">
                  <h2
                    className={`text-lg font-semibold text-gray-900 dark:text-white mb-6 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {getTabName("notifications")}
                  </h2>
                  <MyNotifications />
                </div>
              )}

              

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="p-4 lg:p-6">
                  <h2
                    className={`text-lg font-semibold text-gray-900 dark:text-white mb-6 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {getTabName("security")}
                  </h2>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-4 lg:space-y-6"
                  >
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("profile.currentPassword")}
                      </label>
                      <input
                        {...passwordForm.register("currentPassword")}
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {
                            passwordForm.formState.errors.currentPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className={isRTL ? "text-right" : "text-left"}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("profile.newPassword")}
                      </label>
                      <input
                        {...passwordForm.register("newPassword")}
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className={isRTL ? "text-right" : "text-left"}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t("profile.confirmPassword")}
                      </label>
                      <input
                        {...passwordForm.register("confirmPassword")}
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {
                            passwordForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div
                      className={`flex ${
                        isRTL ? "justify-start" : "justify-end"
                      }`}
                    >
                      <button
                        type="submit"
                        className="px-4 lg:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm lg:text-base"
                      >
                        {t("profile.changePassword")}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Company Panel Tab */}
              {activeTab === "company" && user?.role === "company_admin" && (
                <div className="p-4 lg:p-6">
                  <h2
                    className={`text-lg font-semibold text-gray-900 dark:text-white mb-6 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {getTabName("company")}
                  </h2>
                  <div className="text-center py-8 lg:py-12">
                    <BuildingOfficeIcon className="w-12 h-12 lg:w-16 lg:h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm lg:text-base">
                      {language === "ar"
                        ? "إدارة إعدادات الشركة والموظفين"
                        : "Manage your company settings and employees"}
                    </p>
                    <Link
                      to="/company"
                      className="inline-block px-4 lg:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm lg:text-base"
                    >
                      {language === "ar"
                        ? "الذهاب إلى لوحة الشركة"
                        : "Go to Company Dashboard"}
                    </Link>
                  </div>
                </div>
              )}

              {/* Affiliate Panel Tab */}
              {activeTab === "affiliate" && user?.role === "affiliate" && (
                <div className="p-4 lg:p-6">
                  <h2
                    className={`text-lg font-semibold text-gray-900 dark:text-white mb-6 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {getTabName("affiliate")}
                  </h2>
                  <div className="text-center py-8 lg:py-12">
                    <ChartBarIcon className="w-12 h-12 lg:w-16 lg:h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm lg:text-base">
                      {language === "ar"
                        ? "تتبع الإحالات والعمولات الخاصة بك"
                        : "Track your referrals and commissions"}
                    </p>
                    <Link
                      to="/affiliate"
                      className="inline-block px-4 lg:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm lg:text-base"
                    >
                      {language === "ar"
                        ? "الذهاب إلى لوحة المسوق"
                        : "Go to Affiliate Dashboard"}
                    </Link>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="p-4 lg:p-6">
                  <h2
                    className={`text-lg font-semibold text-gray-900 dark:text-white mb-6 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {getTabName("preferences")}
                  </h2>
                  <div className="space-y-4 lg:space-y-6">
                    <div
                      className={`flex items-center justify-between ${
                        isRTL ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {t("profile.language")}
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                          {t("profile.language.desc")}
                        </p>
                      </div>
                      <select
                        value={language}
                        onChange={(e) =>
                          setLanguage(e.target.value as "en" | "ar")
                        }
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base"
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>

                    <div
                      className={`flex items-center justify-between ${
                        isRTL ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {t("profile.theme")}
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                          {t("profile.theme.desc")}
                        </p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`flex items-center space-x-2 ${
                          isRTL
                            ? "space-x-reverse flex-row-reverse"
                            : "flex-row"
                        } px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm lg:text-base`}
                      >
                        {theme === "light" ? (
                          <>
                            <MoonIcon className="w-4 h-4" />
                            <span>{t("profile.theme.dark")}</span>
                          </>
                        ) : (
                          <>
                            <SunIcon className="w-4 h-4" />
                            <span>{t("profile.theme.light")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
