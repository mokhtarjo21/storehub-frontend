import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const Privacy = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>

        <div className="space-y-5 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <p>
            {language === "ar"
              ? "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية."
              : "We respect your privacy and are committed to protecting your personal data."}
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === "ar"
              ? "البيانات التي نجمعها"
              : "Information We Collect"}
          </h2>
          <p>
            {language === "ar"
              ? "قد نقوم بجمع معلومات مثل الاسم، البريد الإلكتروني، رقم الهاتف، وأي بيانات أخرى تقدمها أثناء التسجيل."
              : "We may collect information such as name, email address, phone number, and other details you provide during registration."}
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === "ar" ? "استخدام البيانات" : "How We Use Your Data"}
          </h2>
          <p>
            {language === "ar"
              ? "تُستخدم بياناتك لتحسين خدماتنا، والتواصل معك، وتنفيذ الطلبات."
              : "Your data is used to improve our services, communicate with you, and process orders."}
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === "ar" ? "مشاركة البيانات" : "Data Sharing"}
          </h2>
          <p>
            {language === "ar"
              ? "لا نقوم بمشاركة بياناتك مع أطراف ثالثة إلا عند الضرورة أو وفقًا للقانون."
              : "We do not share your data with third parties except when required or permitted by law."}
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === "ar" ? "أمان البيانات" : "Data Security"}
          </h2>
          <p>
            {language === "ar"
              ? "نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به."
              : "We take appropriate security measures to protect your data from unauthorized access."}
          </p>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
          >
            {language === "ar" ? "العودة للرئيسية" : "Back to registration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
