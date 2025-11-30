import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { updateUserInfo } from "../../utils/api";

const profileSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string(),
  address: yup.string(),
  companyName: yup.string(),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

const MyInfo: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const profileForm = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      companyName: user?.companyName || "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await updateUserInfo({
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        company_name: data.companyName,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {t("profile.tabs.profile")}
      </h2>
      <form
        onSubmit={profileForm.handleSubmit(onProfileSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("auth.name")}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...profileForm.register("name")}
                className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            {profileForm.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("auth.email")}
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...profileForm.register("email")}
                type="email"
                className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            {profileForm.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {profileForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className={isRTL ? "text-right" : "text-left"}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("profile.phone")}
            </label>
            <div className="relative">
              <PhoneIcon
                className={`absolute ${
                  isRTL ? "right-3" : "left-3"
                } top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400`}
              />
              <input
                {...profileForm.register("phone")}
                type="tel"
                className={`w-full ${
                  isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                } py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm lg:text-base`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          </div>

          {user?.role === "company_admin" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("auth.companyName")}
              </label>
              <input
                {...profileForm.register("companyName")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("profile.address")}
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 rtl:left-auto rtl:right-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              {...profileForm.register("address")}
              rows={3}
              className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            {t("common.save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MyInfo;
