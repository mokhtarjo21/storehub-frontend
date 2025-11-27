import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import toast from "react-hot-toast";

type CustomerFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
};

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ open, onClose, onSubmit }) => {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    if (!name || !email || !phone) {
      toast.error(
        language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields"
      );
      return;
    }

    onSubmit({ name, email, phone });
    toast.success(
      language === "ar" ? "تم إرسال البيانات بنجاح" : "Data submitted successfully"
    );
    setName("");
    setEmail("");
    setPhone("");
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
          {language === "ar" ? "معلومات العميل" : "Customer Information"}
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder={language === "ar" ? "الاسم الكامل" : "Full Name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            placeholder={language === "ar" ? "البريد الإلكتروني" : "Email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="tel"
            placeholder={language === "ar" ? "رقم الهاتف" : "Phone Number"}
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
