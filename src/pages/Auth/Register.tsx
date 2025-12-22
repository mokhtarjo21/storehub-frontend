import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import toast from "react-hot-toast";

export const useRegisterSchema = () => {
  const { language } = useLanguage();

  const messages = {
    en: {
      nameRequired: "Name is required",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 6 characters",
      roleRequired: "Role is required",
      companyNameRequired: "Company name is required",
      // companyEmailRequired: "Company email is required",
      // companyEmailInvalid: "Invalid company email",
      commercialRegisterRequired: "Commercial registration image is required",
      taxCardRequired: "Tax card image is required",
      affiliateCompanyRequired: "Company name is required",
      affiliateJobTitleRequired: "Job title is required",
      affiliateReasonRequired: "Please provide a reason",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Invalid  phone number",
    },
    ar: {
      nameRequired: "الاسم مطلوب",
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "البريد الإلكتروني غير صالح",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordMin: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      roleRequired: "اختر نوع الحساب",
      companyNameRequired: "اسم الشركة مطلوب",
      // companyEmailRequired: "البريد الإلكتروني للشركة مطلوب",
      // companyEmailInvalid: "البريد الإلكتروني للشركة غير صالح",
      commercialRegisterRequired: "صورة السجل التجاري مطلوبة",
      taxCardRequired: "صورة البطاقة الضريبية مطلوبة",
      affiliateCompanyRequired: "اسم الشركة مطلوب",
      affiliateJobTitleRequired: "المسمى الوظيفي مطلوب",
      affiliateReasonRequired: "الرجاء تقديم السبب",
      phoneRequired: "رقم الهاتف مطلوب",
      phoneInvalid: "رقم الهاتف غير صالح",
    },
  };

  return yup.object({
    name: yup.string().required(messages[language].nameRequired),
    email: yup
      .string()
      .email(messages[language].emailInvalid)
      .required(messages[language].emailRequired)
      .when("role", {
        is: "company_admin",
        then: (schema) =>
          schema.test(
            "company-email-only",
            messages[language].companyEmailOnly ||
              "Please use a company email address",
            (value) => {
              if (!value) return false;

              const blockedDomains = [
                "gmail.com",
                "yahoo.com",
                "hotmail.com",
                "outlook.com",
              ];

              const domain = value.split("@")[1]?.toLowerCase();
              return !blockedDomains.includes(domain);
            }
          ),
        otherwise: (schema) => schema, // لو مش شركة → مفيش test إضافي
      }),

    phone: yup
      .string()
      .required(messages[language].phoneRequired)
      .matches(/^01[0-9]{9}$/, messages[language].phoneInvalid),
    password: yup
      .string()
      .min(6, messages[language].passwordMin)
      .required(messages[language].passwordRequired),
    role: yup.string().required(messages[language].roleRequired),
    companyName: yup.string().when("role", {
      is: "company_admin",
      then: (schema) => schema.required(messages[language].companyNameRequired),
    }),
    commercialRegister: yup.mixed().when("role", {
      is: "company_admin",
      then: (schema) =>
        schema.test(
          "required",
          messages[language].commercialRegisterRequired,
          (value) => value && value.length > 0
        ),
    }),
    taxCard: yup.mixed().when("role", {
      is: "company_admin",
      then: (schema) =>
        schema.test(
          "required",
          messages[language].taxCardRequired,
          (value) => value && value.length > 0
        ),
    }),
    affiliateCompany: yup.string().when("role", {
      is: "affiliate",
      then: (schema) =>
        schema.required(messages[language].affiliateCompanyRequired),
    }),
    affiliateJobTitle: yup.string().when("role", {
      is: "affiliate",
      then: (schema) =>
        schema.required(messages[language].affiliateJobTitleRequired),
    }),
    affiliateReason: yup.string().when("role", {
      is: "affiliate",
      then: (schema) =>
        schema.required(messages[language].affiliateReasonRequired),
    }),
  });
};

const Register: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const schema = useRegisterSchema();
  const [agree, setAgree] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
  });

  const selectedRole = watch("role");
  const commercialRegisterFile = watch("commercialRegister");
  const taxCardFile = watch("taxCard");
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

  const onSubmit = async (data: RegisterFormData) => {
    if (!agree) {
      toast.error(
        language === "ar"
          ? "يجب الموافقة على شروط الاستخدام وسياسة الخصوصية"
          : "You must agree to the Terms & Privacy Policy"
      );
      return;
    }
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      };

      if (data.role === "company_admin") {
        payload.companyName = data.companyName;
        // payload.companyEmail = data.companyEmail;
        payload.commercialRegister = data.commercialRegister;
        payload.taxCard = data.taxCard;
      }

      if (data.role === "affiliate") {
        payload.affiliateCompany = data.affiliateCompany;
        payload.affiliateJobTitle = data.affiliateJobTitle;
        payload.affiliateReason = data.affiliateReason;
      }

      await registerUser(payload, data.password);

      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-colors duration-300"
      >
        <div>
          <Link to="/" className="flex justify-center">
            <span className="text-3xl font-bold bg-gradient-to-r from-[#155F82] via-[#44B3E1] to-[#155F82] bg-clip-text text-transparent">
              StoreHub
            </span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {t("auth.register.title")}
          </h2>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("auth.role")}
              </label>
              <select
                {...register("role")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="" disabled>
                  {t("auth.role")}
                </option>
                <option value="individual">{t("auth.role.individual")}</option>
                <option value="company_admin">
                  {t("auth.role.company_admin")}
                </option>
                <option value="affiliate">{t("auth.role.affiliate")}</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                  {t(errors.role.message || "")}
                </p>
              )}
            </div>
            {selectedRole === "company_admin" && (
              <motion.div className="space-y-2">
                {/* Company Name */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("auth.companyName")}
                </label>
                <input
                  {...register("companyName")}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                  placeholder={t("auth.register.companyName.placeholder")}
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                    {t(errors.companyName.message || "")}
                  </p>
                )}

                {/* Commercial Registration Image */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("auth.register.commercialRegister")}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("commercialRegister", {
                    validate: {
                      fileSize: (files) =>
                        !files?.[0] || files[0].size <= MAX_FILE_SIZE,
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                />
                <p className="mt-1 text-sm text-[#E97132] dark:text-[#E97132]">
                  {t("maxImageSize")} {MAX_FILE_SIZE_MB} MB
                </p>

                {errors.commercialRegister && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                    {errors.commercialRegister.message}
                  </p>
                )}

                {/* Tax Card Image */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("auth.register.taxCard")}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...(register("taxCard"),
                  {
                    validate: {
                      fileSize: (files) =>
                        !files?.[0] || files[0].size <= MAX_FILE_SIZE,
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                />
                <p className="mt-1 text-sm text-[#E97132] dark:text-[#E97132]">
                  {t("maxImageSize")} {MAX_FILE_SIZE_MB} MB
                </p>
                {errors.taxCard && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                    {errors.taxCard.message}
                  </p>
                )}
              </motion.div>
            )}
            {selectedRole === "affiliate" && (
              <motion.div className="space-y-2">
                {/* Affiliate Company */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("auth.register.affiliateCompany")}
                </label>
                <input
                  {...register("affiliateCompany")}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                  placeholder={t("auth.register.affiliateCompany.placeholder")}
                />
                {errors.affiliateCompany && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                    {errors.affiliateCompany.message}
                  </p>
                )}

                {/* Job Title */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("auth.register.affiliateJobTitle")}
                </label>
                <input
                  {...register("affiliateJobTitle")}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                  placeholder={t("auth.register.affiliateJobTitle.placeholder")}
                />
                {errors.affiliateJobTitle && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                    {errors.affiliateJobTitle.message}
                  </p>
                )}

                {/* Reason */}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("auth.register.affiliateReason")}
                </label>
                <textarea
                  {...register("affiliateReason")}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                  placeholder={t("auth.register.affiliateReason.placeholder")}
                ></textarea>
                {errors.affiliateReason && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                    {errors.affiliateReason.message}
                  </p>
                )}
              </motion.div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("auth.name")}
              </label>
              <input
                {...register("name")}
                type="text"
                autoComplete="name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                placeholder={t("auth.register.name.placeholder")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                  {errors.name?.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("auth.email")}
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                placeholder={t("auth.register.email.placeholder")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                  {errors.email.message}
                </p>
              )}
              {/* Company Email Hint */}
              {selectedRole === "company_admin" && (
                <p className="mt-1 text-sm text-[#E97132] dark:text-[#E97132]">
                  {t("auth.register.companyEmail.hint")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t("auth.password")}
              </label>
              <div className="mt-1 relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                  placeholder={t("auth.register.password.placeholder")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("auth.phone")}
              </label>
              <input
                {...register("phone")}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                placeholder={t("auth.register.phone.placeholder")}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#155F82] focus:ring-[#155F82]"
            />

            <label
              htmlFor="terms"
              className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
            >
              {language === "ar" ? "أوافق على" : "I agree to the"}{" "}
              <button
                onClick={() => navigate("/terms")}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {language === "ar" ? "شروط الاستخدام" : "Terms & Conditions"}
              </button>{" "}
              {language === "ar" ? "و" : "and"}{" "}
              <button
                onClick={() => navigate("/privacy")}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
              </button>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !agree}
              className="w-full py-3 px-4 rounded-lg text-white text-sm font-medium 
  bg-gradient-to-r from-[#155F82] to-[#44B3E1] hover:opacity-90 transition
  disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("common.loading") : t("auth.register.title")}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("auth.register.haveAccount")}{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {t("nav.login")}
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Register;
