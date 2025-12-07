import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ShoppingBagIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "../contexts/LanguageContext";

interface TimelineStep {
  status: string;
  label: string;
  timestamp: string | null;
  completed: boolean;
}

interface OrderStatusTimelineProps {
  timeline: TimelineStep[];
  currentStatus: string;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  timeline,
  currentStatus,
}) => {
  const { t, language, isRTL } = useLanguage();
  const locale = useMemo(
    () => (language === "ar" ? "ar-EG" : "en-GB"),
    [language]
  );

  const getLabel = (status: string, fallback: string) => {
    const key = `orders.timeline.${status}`;
   
    
    const translated = t(key);
    if (translated && translated !== key) {
      return translated;
    }
    const defaultLabel = t("orders.timeline.default");
    if (defaultLabel && defaultLabel !== "orders.timeline.default") {
      return defaultLabel;
    }
    return fallback || (language === "ar" ? "تحديث الحالة" : "Status update");
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    try {
      return new Date(timestamp).toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  };

  const getStepIcon = (
    status: string,
    completed: boolean,
    isActive: boolean
  ) => {
    const iconClass = `w-6 h-6 ${
      completed
        ? "text-green-500"
        : isActive
        ? "text-blue-500"
        : "text-gray-400 dark:text-gray-300"
    }`;

    switch (status) {
      case "placed":
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <ShoppingBagIcon className={iconClass} />
        );
        case "payment_paid":
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <CheckCircleIcon className={iconClass} />
        );
      case "confirmed":
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <CheckCircleIcon className={iconClass} />
        );

      case "preparing":
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <ClockIcon className={iconClass} />
        );
      case "shipped":
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <TruckIcon className={iconClass} />
        );
      case "delivered":
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <HomeIcon className={iconClass} />
        );
      default:
        return <ClockIcon className={iconClass} />;
    }
  };
// إذا كانت حالة الطلب ملغية، اعرض كلمة "ملغي" فقط
if (currentStatus === "cancelled") {
  return (
    <div className="w-full flex justify-center items-center py-16">
      <span className="text-red-600 text-7xl font-extrabold tracking-widest opacity-90">
        {language === "ar" ? "مـلـغـي" : "CANCELLED"}
      </span>
    </div>
  );
}

  return (
    <div className="flow-root">
      <ul className="-mb-8 space-y-2">
        {timeline.map((step, stepIdx) => {
          const isActive = step.status === currentStatus;
          const isLast = stepIdx === timeline.length - 1;
          const translatedLabel =
            getLabel(step.status, step.label) ||
            t("orders.timeline.default") ||
            step.label;

          return (
            <li key={step.status}>
              <div className="relative pb-6">
                {!isLast && (
                  <span
                    className={`absolute top-4 ${
                      isRTL
                        ? "rtl:right-4 rtl:-mr-px"
                        : "ltr:left-4 ltr:-ml-px"
                    } h-full w-0.5 ${
                      step.completed
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start gap-3 rtl:flex-row-reverse">
                  <div className="flex-shrink-0">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: stepIdx * 0.1 }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ${
                        step.completed
                          ? "bg-green-500 ring-green-100 dark:ring-green-900"
                          : isActive
                          ? "bg-blue-500 ring-blue-100 dark:ring-blue-900"
                          : "bg-gray-300 ring-gray-100 dark:bg-gray-600 dark:ring-gray-800"
                      }`}
                    >
                      {getStepIcon(step.status, step.completed, isActive)}
                    </motion.span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between gap-4 pt-1.5 rtl:flex-row-reverse rtl:text-right">
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          step.completed || isActive
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {translatedLabel}
                      </p>
                      {step.timestamp && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {formatTimestamp(step.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrderStatusTimeline;
