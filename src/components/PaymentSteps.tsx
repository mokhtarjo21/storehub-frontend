import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { PaymentTransaction } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface PaymentStepsProps {
  transactions: PaymentTransaction[];
  totalAmount: number;
}

const PaymentSteps: React.FC<PaymentStepsProps> = ({
  transactions,
  totalAmount,
}) => {
  const { t, language } = useLanguage();
  const locale = useMemo(
    () => (language === "ar" ? "ar-EG" : "en-GB"),
    [language]
  );

  const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    try {
      return new Date(value).toLocaleString(locale);
    } catch {
      return new Date(value).toLocaleString();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case "failed":
      case "cancelled":
        return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />;
      case "processing":
        return <ClockIcon className="w-6 h-6 text-yellow-500 animate-pulse" />;
      case "refunded":
        return <ExclamationCircleIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700";
      case "refunded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600";
    }
  };
  const refundedTransaction = transactions.find(
    (t) => t.transaction_status === "refunded"
  );
  const depositTransaction = transactions.find(
    (t) => t.transaction_type === "deposit"
  );
  const finalTransaction = transactions.find(
    (t) => t.transaction_type === "final"
  );
  const fullTransaction = transactions.find(
    (t) => t.transaction_type === "full"
  );

  // ============================
  // FULL PAYMENT
  // ============================
  if (fullTransaction) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CurrencyDollarIcon className="w-5 h-5 mr-2" />
          {t("payments.title.full") ||
            (language === "ar" ? "معلومات الدفع" : "Payment Information")}
        </h3>

        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg border ${getStatusColor(
              fullTransaction.transaction_status
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(fullTransaction.transaction_status)}
                <span className="font-medium">
                  {fullTransaction.transaction_type_display}
                </span>
              </div>
              <span className="text-sm">
                {fullTransaction.transaction_status_display}
              </span>
            </div>

            <div className="text-2xl font-bold mb-2">
              {parseFloat(fullTransaction.amount.toString()).toFixed(2)}
            </div>

            <div className="text-sm">
              <p>
                {t("payments.paymentMethod") ||
                  (language === "ar" ? "طريقة الدفع" : "Payment Method")}
                : {fullTransaction.payment_method_display}
              </p>

              {fullTransaction.transaction_id && (
                <p className="mt-1">
                  {t("payments.transactionId") ||
                    (language === "ar" ? "رقم العملية" : "Transaction ID")}
                  : {fullTransaction.transaction_id}
                </p>
              )}

              {fullTransaction.completed_at && (
                <p className="mt-1">
                  {t("payments.completedAt") ||
                    (language === "ar" ? "اكتملت في" : "Completed")}
                  : {formatDateTime(fullTransaction.completed_at)}
                </p>
              )}

              {/* ⭐ REFUNDED MESSAGE */}
              {fullTransaction.transaction_status === "refunded" && (
                <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-300">
                  {language === "ar"
                    ? "تم استرجاع المبلغ"
                    : "Payment has been refunded"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
    if (refundedTransaction) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CurrencyDollarIcon className="w-5 h-5 mr-2" />
          {t("payments.title.refund") ||
            (language === "ar"
              ? "معلومات استرجاع الدفع"
              : "Payment Refund Information")}
        </h3>

        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg border ${getStatusColor(
              refundedTransaction.transaction_status
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(refundedTransaction.transaction_status)}
                <span className="font-medium">
                  {refundedTransaction.transaction_type_display}
                </span>
              </div>
              <span className="text-sm">
                {refundedTransaction.transaction_status_display}
              </span>
            </div>

            <div className="text-2xl font-bold mb-2">
              {parseFloat(refundedTransaction.amount.toString()).toFixed(2)}
            </div>

            <div className="text-sm">
              <p>
                {t("payments.paymentMethod") ||
                  (language === "ar" ? "طريقة الدفع" : "Payment Method")}
                : {refundedTransaction.payment_method_display}
              </p>

              {refundedTransaction.transaction_id && (
                <p className="mt-1">
                  {t("payments.transactionId") ||
                    (language === "ar" ? "رقم العملية" : "Transaction ID")}
                  : {refundedTransaction.transaction_id}
                </p>
              )}

              {refundedTransaction.completed_at && (
                <p className="mt-1">
                  {t("payments.completedAt") ||
                    (language === "ar" ? "اكتملت في" : "Completed")}
                  : {formatDateTime(refundedTransaction.completed_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  const depositPaid = depositTransaction?.is_completed || false;
  const finalPaid = finalTransaction?.is_completed || false;

  const totalPaid =
    (depositTransaction?.is_completed
      ? parseFloat(depositTransaction.amount.toString())
      : 0) +
    (finalTransaction?.is_completed
      ? parseFloat(finalTransaction.amount.toString())
      : 0);

  // ============================
  // SPLIT PAYMENTS
  // ============================
  return (
    <>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <CurrencyDollarIcon className="w-5 h-5 mr-2" />
        {t("payments.title.split") ||
          (language === "ar"
            ? "تفاصيل الدفع المقسّم"
            : "Split Payment Information")}
      </h3>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-300">
            {t("payments.progress") ||
              (language === "ar" ? "تقدم الدفع" : "Payment Progress")}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            ${totalPaid.toFixed(2)} / ${totalAmount.toFixed(2)}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(totalPaid / totalAmount) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="bg-blue-600 h-2 rounded-full"
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* =======================
            DEPOSIT PAYMENT
        ======================= */}
        {depositTransaction && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-lg border ${getStatusColor(
              depositTransaction.transaction_status
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(depositTransaction.transaction_status)}
                <span className="font-medium">
                  {`${
                    t("payments.step") ||
                    (language === "ar" ? "الخطوة" : "Step")
                  } 1: ${depositTransaction.transaction_type_display}`}
                </span>
              </div>
              <span className="text-sm">
                {depositTransaction.transaction_status_display}
              </span>
            </div>

            <div className="text-2xl font-bold mb-2">
              ${parseFloat(depositTransaction.amount.toString()).toFixed(2)}
            </div>

            <div className="text-sm">
              <p>
                {t("payments.paymentMethod") ||
                  (language === "ar" ? "طريقة الدفع" : "Payment Method")}
                : {depositTransaction.payment_method_display}
              </p>

              {depositTransaction.transaction_id && (
                <p className="mt-1">
                  {t("payments.transactionId") ||
                    (language === "ar" ? "رقم العملية" : "Transaction ID")}
                  : {depositTransaction.transaction_id}
                </p>
              )}

              {depositTransaction.completed_at && (
                <p className="mt-1">
                  {t("payments.completedAt") ||
                    (language === "ar" ? "اكتملت في" : "Completed")}
                  : {formatDateTime(depositTransaction.completed_at)}
                </p>
              )}

              {/* ⭐ REFUNDED MESSAGE */}
              {depositTransaction.transaction_status === "refunded" && (
                <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-300">
                  {language === "ar"
                    ? "تم استرجاع مبلغ العربون"
                    : "Deposit amount has been refunded"}
                </p>
              )}

              {!depositTransaction.is_completed && (
                <p className="mt-2 text-xs italic">
                  {t("payments.depositHint") ||
                    (language === "ar"
                      ? "مطلوب دفع العربون لتأكيد الحجز"
                      : "Initial deposit required to confirm service booking")}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {depositTransaction && finalTransaction && (
          <div className="flex justify-center">
            <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-600"></div>
          </div>
        )}

        {/* =======================
            FINAL PAYMENT
        ======================= */}
        {finalTransaction && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-lg border ${getStatusColor(
              finalTransaction.transaction_status
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(finalTransaction.transaction_status)}
                <span className="font-medium">
                  {`${
                    t("payments.step") ||
                    (language === "ar" ? "الخطوة" : "Step")
                  } 2: ${finalTransaction.transaction_type_display}`}
                </span>
              </div>
              <span className="text-sm">
                {finalTransaction.transaction_status_display}
              </span>
            </div>

            <div className="text-2xl font-bold mb-2">
              ${parseFloat(finalTransaction.amount.toString()).toFixed(2)}
            </div>

            <div className="text-sm">
              <p>
                {t("payments.paymentMethod") ||
                  (language === "ar" ? "طريقة الدفع" : "Payment Method")}
                : {finalTransaction.payment_method_display}
              </p>

              {finalTransaction.transaction_id && (
                <p className="mt-1">
                  {t("payments.transactionId") ||
                    (language === "ar" ? "رقم العملية" : "Transaction ID")}
                  : {finalTransaction.transaction_id}
                </p>
              )}

              {finalTransaction.completed_at && (
                <p className="mt-1">
                  {t("payments.completedAt") ||
                    (language === "ar" ? "اكتملت في" : "Completed")}
                  : {formatDateTime(finalTransaction.completed_at)}
                </p>
              )}

              {/* ⭐ REFUNDED MESSAGE */}
              {finalTransaction.transaction_status === "refunded" && (
                <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-300">
                  {language === "ar"
                    ? "تم استرجاع المبلغ النهائي"
                    : "Final payment has been refunded"}
                </p>
              )}

              {!finalTransaction.is_completed && depositPaid && (
                <p className="mt-2 text-xs italic">
                  {t("payments.finalHint") ||
                    (language === "ar"
                      ? "يستحق الدفع النهائي بعد إتمام الخدمة"
                      : "Final payment due upon service completion")}
                </p>
              )}

              {!depositPaid && (
                <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                  {t("payments.awaitingDeposit") ||
                    (language === "ar"
                      ? "متاح بعد دفع العربون"
                      : "Available after deposit is paid")}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {depositPaid && finalPaid && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center text-green-700 dark:text-green-300">
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            <span className="font-medium">
              {t("payments.complete") ||
                (language === "ar" ? "اكتمل الدفع" : "Payment Complete")}
            </span>
          </div>
        </motion.div>
      )}
    </div>
    </>
  );
};

export default PaymentSteps;
