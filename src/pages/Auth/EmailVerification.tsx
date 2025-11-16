import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
// import { useLanguage } from "../../contexts/LanguageContext";
import { verifyOTP, resendOTP } from "../../utils/api";

const schema = yup.object({
  otp_code: yup
    .string()
    .required("OTP code is required")
    .length(6, "OTP code must be 6 digits")
    .matches(/^\d+$/, "OTP code must contain only numbers"),
});

type VerificationFormData = yup.InferType<typeof schema>;

const EmailVerification: React.FC = () => {
  // const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerificationFormData>({
    resolver: yupResolver(schema),
  });

  const otpValue = watch("otp_code", "");

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (data: VerificationFormData) => {
    if (!email) return;

    // تحقق من انتهاء الوقت
    if (timeLeft === 0) {
      toast.error("The OTP code has expired. Please resend the code.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP(email, data.otp_code);

      // Store tokens
      localStorage.setItem("access_token", result.tokens.access);
      localStorage.setItem("refresh_token", result.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Email verified successfully!");
      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Verification failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email || !canResend) return;

    setIsResending(true);
    try {
      await resendOTP(email);
      toast.success("New OTP sent to your email!");
      setTimeLeft(180); // Reset timer
      setCanResend(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to resend OTP";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

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
            <EnvelopeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </motion.div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Verify Your Email
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit verification code to
          </p>

          <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
            {email}
          </p>
        </div>

        {/* Verification Form */}
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
              Verification Code
            </label>

            <input
              {...register("otp_code")}
              type="text"
              maxLength={6}
              placeholder="000000"
              className={`block w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg shadow-sm placeholder-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${
                  timeLeft === 0
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }
              `}
              autoComplete="one-time-code"
              disabled={timeLeft === 0}
            />

            {errors.otp_code && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.otp_code.message}
              </p>
            )}

            {timeLeft === 0 && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                The OTP code has expired. Please resend the code.
              </p>
            )}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-4 w-4" />
            <span>
              {timeLeft > 0
                ? `Code expires in ${formatTime(timeLeft)}`
                : "Code has expired"}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || otpValue.length !== 6 || timeLeft === 0}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Verify Email</span>
              </div>
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || isResending}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default EmailVerification;
