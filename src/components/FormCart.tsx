import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import toast from "react-hot-toast";

import { useAuth } from "../contexts/AuthContext";
type CustomerFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { phone: string; details: string }) => void;
  itemName: string;
  itemType: "product" | "service";
  submitting?: boolean;
};

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  itemName,
  itemType,
  submitting = false,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [phone, setPhone] = useState(user?.phone || "");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    if (submitting) return;
    if (!phone || !details) {
      toast.error(
        language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields"
      );
      return;
    }

    onSubmit({ phone, details });

    setPhone("");
    setDetails("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          disabled={submitting}
          className={`absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${
            submitting ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          {language === "ar" ? "تفاصيل الخدمة" : "Service Details"}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {language === "ar"
            ? `هذا ${
                itemType === "product" ? "المنتج" : "الخدمة"
              } يتطلب من فريق المبيعات لدينا التواصل معك لإنشاء عرض سعر. يرجى ملء البيانات أدناه بشكل صحيح.`
            : `This ${itemName} requires our sales team to contact you to generate a quotation. Please fill in the data below correctly.`}
        </p>

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
            placeholder={
              language === "ar"
                ? "رقم الهاتف للتواصل"
                : "Phone Number for Contact"
            }
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-3 bg-[#155F82]/80 hover:bg-[#155F82]/90 text-white font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 ${
              submitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {submitting && (
              <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
            )}
            {language === "ar" ? "إرسال" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFormModal;
