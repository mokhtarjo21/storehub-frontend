import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../contexts/LanguageContext";

const schema = yup.object({
  otp_code: yup
    .string()
    .required("Reset code is required")
    .length(6, "Reset code must be 6 digits")
    .matches(/^\d+$/, "Reset code must contain only numbers"),
  new_password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Confirm password is required"),
});

type ResetPasswordFormData = yup.InferType<typeof schema>;

const ResetPassword: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const otpValue = watch("otp_code", "");

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        "http://72.60.181.116:8000/api/auth/reset-password/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp_code: data.otp_code,
            new_password: data.new_password,
            confirm_password: data.confirm_password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Password reset failed");
      }

      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password reset failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    try {
      const response = await fetch(
        "http://localhost:8000/api/auth/request-password-reset/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resend code");
      }

      toast.success("New reset code sent to your email!");
    } catch (error) {
      toast.error("Failed to resend code");
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
          >
            <LockClosedIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </motion.div>

          <h2
            className="mt-6 text-3xl font-bold pb-2
  bg-gradient-to-r from-[#155F82] via-[#44B3E1] to-[#155F82] 
  bg-clip-text text-transparent"
          >
            {t("auth.resetPassword.title")}
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("auth.resetPassword.subtitle")}
          </p>

          <p
            className="
  mt-1 text-sm font-semibold
  bg-gradient-to-r from-[#155F82] to-[#44B3E1]
  bg-clip-text text-transparent
"
          >
            {email}
          </p>
        </div>

        {/* Reset Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              htmlFor="otp_code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              {t("auth.resetPassword.title")}
            </label>

            <input
              {...register("otp_code")}
              type="text"
              maxLength={6}
              placeholder="000000"
              className="block w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoComplete="one-time-code"
            />

            {errors.otp_code && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.otp_code.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("auth.resetPassword.subtitle")}
            </label>
            <div className="mt-1 relative">
              <input
                {...register("new_password")}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="block w-full px-3 py-2 pr-10 rtl:pr-3 rtl:pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
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
            {errors.new_password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("auth.resetPassword.confirmPassword")}
            </label>
            <div className="mt-1 relative">
              <input
                {...register("confirm_password")}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                className="block w-full px-3 py-2 pr-10 rtl:pr-3 rtl:pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || otpValue.length !== 6}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>{t("auth.resetPassword.resetting")}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <CheckCircleIcon className="h-4 w-4" />
                <span>{t("auth.resetPassword.resetButton")}</span>
              </div>
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("auth.resetPassword.didntReceive")}&nbsp;
              <button
                type="button"
                onClick={handleResendCode}
                className="
    font-semibold
    bg-gradient-to-r from-[#155F82] to-[#44B3E1]
    bg-clip-text text-transparent
    hover:opacity-80
    transition-all
  "
              >
                {t("auth.resetPassword.resendCode")}
              </button>
            </p>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="
    flex items-center justify-center text-sm
    text-gray-600 dark:text-gray-400
    hover:text-[#155F82] dark:hover:text-[#44B3E1]
    transition-colors
  "
            >
              {t("auth.resetPassword.backToLogin")}
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
