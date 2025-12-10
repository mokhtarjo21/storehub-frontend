import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../contexts/LanguageContext";

export const useForgotPasswordSchema = () => {
  const { language } = useLanguage();

  const messages = {
    en: {
      emailRequired: "Email is required",
      emailInvalid: "Invalid email",
    },
    ar: {
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "البريد الإلكتروني غير صالح",
    },
  };

  return yup.object({
    email: yup
      .string()
      .email(messages[language].emailInvalid)
      .required(messages[language].emailRequired),
  });
};

type ForgotPasswordFormData = yup.InferType<
  ReturnType<typeof useForgotPasswordSchema>
>;

const ForgotPassword: React.FC = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const schema = useForgotPasswordSchema();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://192.168.1.7:8000/api/auth/request-password-reset/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        const message =
          responseData.error ||
          responseData.message ||
          responseData.detail ||
          responseData.email?.[0] ||
          responseData.non_field_errors?.[0] ||
          t("auth.forgotPassword.error");
        throw new Error(message);
      }

      setSentEmail(data.email);
      setEmailSent(true);
      toast.success(t("auth.forgotPassword.codeSent"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("common.unknownError")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
            >
              <PaperAirplaneIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>

            <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-[#155F82] to-[#44B3E1] bg-clip-text text-transparent p-4">
              {t("auth.forgotPassword.checkEmail")}
            </h2>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("auth.forgotPassword.sentTo")}
            </p>

            <p className="mt-1 text-sm font-semibold bg-gradient-to-r from-[#155F82] to-[#44B3E1] bg-clip-text text-transparent p-2">
              {sentEmail}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to={`/reset-password?email=${encodeURIComponent(sentEmail)}`}
              className="w-full flex justify-center py-3 px-4 rounded-md text-white bg-gradient-to-r from-[#155F82] to-[#44B3E1] hover:opacity-90 transition-all font-medium"
            >
              {t("auth.forgotPassword.enterCode")}
            </Link>

            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-[#155F82] dark:text-[#44B3E1] hover:text-[#44B3E1] dark:hover:text-[#155F82] transition"
            >
              {t("auth.forgotPassword.login")}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-8"
      >
        <div className="text-center">
          <Link to="/" className="flex justify-center">
            <span className="text-3xl font-bold bg-gradient-to-r from-[#155F82] to-[#44B3E1] bg-clip-text text-transparent">
              StoreHub
            </span>
          </Link>

          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            {t("auth.forgotPassword.title")}
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t("auth.forgotPassword.subtitle")}
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("auth.email")}
            </label>

            <div className="mt-1 relative">
              <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                {...register("email")}
                type="email"
                className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#44B3E1]"
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
              />
            </div>

            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-md text-white font-medium bg-gradient-to-r from-[#155F82] to-[#44B3E1] hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading
              ? t("common.sending")
              : t("auth.forgotPassword.sendCode")}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center text-sm text-[#155F82] dark:text-[#44B3E1] hover:text-[#44B3E1] dark:hover:text-[#155F82] transition"
          >
            {t("auth.forgotPassword.login")}
          </Link>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
