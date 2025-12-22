import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Terms = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-[#155F82] to-[#44B3E1] rounded-2xl p-8 sm:p-10 shadow-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white text-center drop-shadow-lg">
              {language === "ar" ? "شروط الاستخدام" : "Terms & Conditions"}
            </h1>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10"
        >
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <div className="border-l-4 border-[#155F82] dark:border-[#44B3E1] pl-6 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                {language === "ar"
                  ? "باستخدامك لهذا الموقع، فإنك توافق على الالتزام بشروط الاستخدام التالية. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع."
                  : "By using this website, you agree to comply with the following terms and conditions. If you do not agree with any part, please do not use the website."}
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  1
                </span>
                <span>
                  {language === "ar" ? "استخدام الموقع" : "Use of the Website"}
                </span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed pl-14">
                {language === "ar"
                  ? "يُسمح لك باستخدام الموقع لأغراض قانونية فقط وبطريقة لا تنتهك أي قوانين أو حقوق أطراف أخرى. يُمنع استخدام الموقع لأي غرض غير قانوني أو غير مصرح به."
                  : "You may use the website for lawful purposes only and in a way that does not violate any laws or third-party rights. Any use of the website for illegal or unauthorized purposes is strictly prohibited."}
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  2
                </span>
                <span>{language === "ar" ? "الحسابات" : "Accounts"}</span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed pl-14">
                {language === "ar"
                  ? "أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تتم من خلاله. يجب عليك إبلاغنا فورًا عن أي استخدام غير مصرح به لحسابك."
                  : "You are responsible for maintaining the confidentiality of your account information and all activities under your account. You must notify us immediately of any unauthorized use of your account."}
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  3
                </span>
                <span>
                  {language === "ar"
                    ? "الملكية الفكرية"
                    : "Intellectual Property"}
                </span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed pl-14">
                {language === "ar"
                  ? "جميع المحتويات المعروضة على الموقع هي ملك للموقع أو للجهات المرخصة له ولا يجوز استخدامها دون إذن. يشمل ذلك النصوص، الصور، الشعارات، والتصاميم."
                  : "All content displayed on the website is owned by the website or licensed parties and may not be used without permission. This includes text, images, logos, and designs."}
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  4
                </span>
                <span>{language === "ar" ? "التعديلات" : "Modifications"}</span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed pl-14">
                {language === "ar"
                  ? "نحتفظ بالحق في تعديل شروط الاستخدام في أي وقت، ويُعد استمرارك في استخدام الموقع موافقة على هذه التعديلات. ننصحك بمراجعة هذه الشروط بشكل دوري."
                  : "We reserve the right to modify these terms at any time. Continued use of the website constitutes acceptance of the changes. We recommend reviewing these terms periodically."}
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  5
                </span>
                <span>
                  {language === "ar"
                    ? "الحد من المسؤولية"
                    : "Limitation of Liability"}
                </span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed pl-14">
                {language === "ar"
                  ? "لا يتحمل الموقع أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة قد تنتج عن استخدام أو عدم القدرة على استخدام الموقع."
                  : "The website shall not be liable for any direct or indirect damages arising from the use or inability to use the website."}
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 bg-gradient-to-r from-[#155F82] to-[#44B3E1] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
              >
                {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
              </button>

              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 bg-gradient-to-r from-[#155F82] to-[#44B3E1] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
              >
                {language === "ar" ? "العودة للتسجيل" : "Back to Register"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
