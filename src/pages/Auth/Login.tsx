import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

type LoginFormData = yup.InferType<typeof schema>;

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      if (errorMessage.includes("verify your email")) {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:shadow-xl transition-colors duration-300"
      >
        <div className="text-center">
          <Link to="/" className="flex justify-center">
            <span className="text-4xl font-extrabold bg-gradient-to-r from-[#155F82] via-[#44B3E1] to-[#155F82] bg-clip-text text-transparent drop-shadow">
              StoreHub
            </span>
          </Link>

          <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
            {t("auth.login.title")}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("auth.login.subtitle")}
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("auth.email")}
              </label>
              <input
                {...register("email")}
                type="email"
                className="mt-1 block w-full text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#44B3E1]"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("auth.password")}
              </label>

              <div className="mt-1 relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="block w-full text-xs px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#44B3E1]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg text-white text-sm font-medium bg-gradient-to-r from-[#155F82] to-[#44B3E1] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("common.loading") : t("auth.login.title")}
          </button>

          {/* LINKS */}
          <div className="text-center mt-6 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold bg-gradient-to-r from-[#155F82] to-[#44B3E1] bg-clip-text text-transparent hover:opacity-80 transition"
              >
                {t("nav.register")}
              </Link>
            </p>

            <Link
              to="/forgot-password"
              className="inline-block text-xs font-medium text-[#155F82] hover:text-[#44B3E1] dark:text-[#44B3E1] dark:hover:text-[#155F82] transition"
            >
              Forgot your password?
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;
