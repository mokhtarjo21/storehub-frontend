import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "framer-motion";

const Privacy = () => {
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
              {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
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
                  ? "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك."
                  : "We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect your information."}
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  1
                </span>
                <span>
                  {language === "ar"
                    ? "البيانات التي نجمعها"
                    : "Information We Collect"}
                </span>
              </h2>
              <div className="pl-14 space-y-3">
                <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                  {language === "ar"
                    ? "قد نقوم بجمع المعلومات التالية:"
                    : "We may collect the following information:"}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-base sm:text-lg ml-4">
                  <li>
                    {language === "ar"
                      ? "الاسم الكامل والبريد الإلكتروني ورقم الهاتف"
                      : "Full name, email address, and phone number"}
                  </li>
                  <li>
                    {language === "ar"
                      ? "معلومات الدفع والفوترة"
                      : "Payment and billing information"}
                  </li>
                  <li>
                    {language === "ar"
                      ? "معلومات الجهاز والمتصفح"
                      : "Device and browser information"}
                  </li>
                  <li>
                    {language === "ar"
                      ? "سجل الأنشطة والتفاعلات على الموقع"
                      : "Activity logs and website interactions"}
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  2
                </span>
                <span>
                  {language === "ar"
                    ? "استخدام البيانات"
                    : "How We Use Your Data"}
                </span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed pl-14">
                {language === "ar"
                  ? "تُستخدم بياناتك لتحسين خدماتنا، والتواصل معك، وتنفيذ الطلبات، وإرسال التحديثات المهمة، وتوفير الدعم الفني، وتحليل استخدام الموقع لتحسين تجربة المستخدم."
                  : "Your data is used to improve our services, communicate with you, process orders, send important updates, provide technical support, and analyze website usage to enhance user experience."}
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  3
                </span>
                <span>
                  {language === "ar" ? "مشاركة البيانات" : "Data Sharing"}
                </span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed pl-14">
                {language === "ar"
                  ? "لا نقوم بمشاركة بياناتك مع أطراف ثالثة إلا عند الضرورة أو وفقًا للقانون. قد نشارك البيانات مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل الموقع، ولكن فقط بموجب اتفاقيات صارمة لحماية البيانات."
                  : "We do not share your data with third parties except when required or permitted by law. We may share data with trusted service providers who help us operate the website, but only under strict data protection agreements."}
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  4
                </span>
                <span>
                  {language === "ar" ? "أمان البيانات" : "Data Security"}
                </span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed pl-14">
                {language === "ar"
                  ? "نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به، بما في ذلك التشفير، جدران الحماية، ومراقبة الأمان المستمرة. ومع ذلك، لا يمكن ضمان الأمان المطلق على الإنترنت."
                  : "We take appropriate security measures to protect your data from unauthorized access, including encryption, firewalls, and continuous security monitoring. However, absolute security on the internet cannot be guaranteed."}
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  5
                </span>
                <span>{language === "ar" ? "حقوقك" : "Your Rights"}</span>
              </h2>
              <div className="pl-14 space-y-3">
                <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                  {language === "ar"
                    ? "لديك الحق في:"
                    : "You have the right to:"}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 text-base sm:text-lg ml-4">
                  <li>
                    {language === "ar"
                      ? "الوصول إلى بياناتك الشخصية"
                      : "Access your personal data"}
                  </li>
                  <li>
                    {language === "ar"
                      ? "تصحيح البيانات غير الدقيقة"
                      : "Correct inaccurate data"}
                  </li>
                  <li>
                    {language === "ar"
                      ? "طلب حذف بياناتك"
                      : "Request deletion of your data"}
                  </li>
                  <li>
                    {language === "ar"
                      ? "الاعتراض على معالجة بياناتك"
                      : "Object to processing of your data"}
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-[#155F82] to-[#44B3E1] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  6
                </span>
                <span>
                  {language === "ar" ? "ملفات تعريف الارتباط" : "Cookies"}
                </span>
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed pl-14">
                {language === "ar"
                  ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع. يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح."
                  : "We use cookies to enhance your experience on our website. You can manage cookie preferences through your browser settings."}
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

export default Privacy;
