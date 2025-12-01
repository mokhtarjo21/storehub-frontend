import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import toast from "react-hot-toast";

type CustomerFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { phone: string; details: string }) => void;
};

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { language } = useLanguage();
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (!phone || !details) {
      toast.error(
        language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields"
      );
      return;
    }

    onSubmit({ phone, details });

    toast.success(
      language === "ar"
        ? "سوف يتم التواصل معك من أحد ممثلي خدمة العملاء"
        : "A customer service agent will contact you shortly"
    );

    setPhone("");
    setDetails("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          {language === "ar" ? "تفاصيل الخدمة" : "Service Details"}
        </h2>

        <div className="space-y-4">
          {/* ⭐ حقل تفاصيل الخدمة */}
          <textarea
            placeholder={
              language === "ar"
                ? "ما هي الخدمة المطلوبة؟ يرجى كتابة التفاصيل"
                : "What do you need? Write service details"
            }
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full px-4 py-2 h-28 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="tel"
            placeholder={language === "ar" ? "رقم الهاتف للتواصل" : "Phone Number for Contact"}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-[#155F82]/80 hover:bg-[#155F82]/90 text-white font-semibold rounded-xl transition-all"
          >
            {language === "ar" ? "إرسال" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFormModal;
