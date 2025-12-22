import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
const Terms = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {language === "ar" ? "شروط الاستخدام" : "Terms & Conditions"}
        </h1>

        <div className="space-y-5 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <p>
            {language === "ar"
              ? "باستخدامك لهذا الموقع، فإنك توافق على الالتزام بشروط الاستخدام التالية. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع."
              : "By using this website, you agree to comply with the following terms and conditions. If you do not agree with any part, please do not use the website."}
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === "ar" ? "استخدام الموقع" : "Use of the Website"}
          </h2>
          <p>
            {language === "ar"
              ? "يُسمح لك باستخدام الموقع لأغراض قانونية فقط وبطريقة لا تنتهك أي قوانين أو حقوق أطراف أخرى."
              : "You may use the website for lawful purposes only and in a way that does not violate any laws or third-party rights."}
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === "ar" ? "الحسابات" : "Accounts"}
          </h2>
          <p>
            {language === "ar"
              ? "أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تتم من خلاله."
              : "You are responsible for maintaining the confidentiality of your account information and all activities under your account."}
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === "ar" ? "الملكية الفكرية" : "Intellectual Property"}
          </h2>
          <p>
            {language === "ar"
              ? "جميع المحتويات المعروضة على الموقع هي ملك للموقع أو للجهات المرخصة له ولا يجوز استخدامها دون إذن."
              : "All content displayed on the website is owned by the website or licensed parties and may not be used without permission."}
          </p>

          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === "ar" ? "التعديلات" : "Modifications"}
          </h2>
          <p>
            {language === "ar"
              ? "نحتفظ بالحق في تعديل شروط الاستخدام في أي وقت، ويُعد استمرارك في استخدام الموقع موافقة على هذه التعديلات."
              : "We reserve the right to modify these terms at any time. Continued use of the website constitutes acceptance of the changes."}
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

export default Terms;
