import React, { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextType {
  language: "en" | "ar";
  setLanguage: (lang: "en" | "ar") => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.services": "Services",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin",
    "nav.affiliate": "Affiliate",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.login": "Login",
    "nav.register": "Register",

    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.price": "Price",
    "common.points": "Points",
    "common.total": "Total",
    "common.chooseFile": "Choose File",
    "common.noFileChosen": "No file chosen",
    "common.sending": "Sending...",

    // Home
    "home.hero.title": "Your Premier Network Solutions Hub",
    "home.hero.subtitle":
      "Discover cutting-edge network devices, software licenses, and professional installation services",
    "home.hero.cta": "Explore Products",
    "home.features.title": "Why Choose StoreHub?",
    "home.features.devices": "Premium Network Devices",
    "home.features.devices.desc": "Latest networking equipment from top brands",
    "home.features.licenses": "Software Licenses",
    "home.features.licenses.desc":
      "Genuine software licenses with instant delivery",
    "home.features.installation": "Installation Services",
    "home.features.installation.desc": "Professional setup and configuration",

    // Products
    "products.title": "Our Products",
    "products.category.all": "All Products",
    "products.category.network-device": "Network Devices",
    "products.category.software-license": "Software Licenses",
    "products.category.installation-service": "Installation Services",
    "products.addToCart": "Add to Cart",
    "products.outOfStock": "Out of Stock",

    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty.title": "Your cart is empty",
    "cart.empty.subtitle": "Add some products to get started",
    "cart.empty.cta": "Browse Products",
    "cart.itemsCount": "items in cart",
    "cart.items": "Cart Items",
    "cart.summary": "Order Summary",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Shipping",
    "cart.freeShipping": "Free",
    "cart.promoCode": "Promo Code",
    "cart.promoCode.placeholder": "Enter code",
    "cart.usePoints": "Use points for discount",
    "cart.discount": "discount",
    "cart.pointsDiscount": "Points Discount",
    "cart.checkout": "Proceed to Checkout",
    "cart.clear": "Clear Cart",
    "common.apply": "Apply",

    // Profile
    "profile.title": "Profile Settings",
    "profile.subtitle": "Manage your account settings and preferences",
    "profile.tabs.profile": "Profile",
    "profile.tabs.security": "Security",
    "profile.tabs.notifications": "Notifications",
    "profile.tabs.preferences": "Preferences",
    "profile.phone": "Phone Number",
    "profile.address": "Address",
    "profile.currentPassword": "Current Password",
    "profile.newPassword": "New Password",
    "profile.confirmPassword": "Confirm Password",
    "profile.changePassword": "Change Password",
    "profile.notifications.email": "Email Notifications",
    "profile.notifications.email.desc": "Receive notifications via email",
    "profile.notifications.push": "Push Notifications",
    "profile.notifications.push.desc": "Receive push notifications",
    "profile.notifications.sms": "SMS Notifications",
    "profile.notifications.sms.desc": "Receive notifications via SMS",
    "profile.language": "Language",
    "profile.language.desc": "Choose your preferred language",
    "profile.theme": "Theme",
    "profile.theme.desc": "Choose your preferred theme",
    "profile.theme.light": "Light Mode",
    "profile.theme.dark": "Dark Mode",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.unread": "unread notifications",
    "notifications.allRead": "All notifications read",
    "notifications.markAllRead": "Mark all as read",
    "notifications.clearAll": "Clear all",
    "notifications.filter.all": "All",
    "notifications.filter.unread": "Unread",
    "notifications.filter.read": "Read",
    "notifications.empty.title": "No notifications",
    "notifications.empty.subtitle": "You're all caught up!",
    "notifications.markRead": "Mark as read",
    "notifications.delete": "Delete",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome back",
    "dashboard.stats.orders": "Total Orders",
    "dashboard.stats.points": "Points Balance",
    "dashboard.stats.spent": "Total Spent",
    "dashboard.recentOrders": "Recent Orders",
    "dashboard.pointsHistory": "Points History",

    // Admin
    "admin.title": "Admin Dashboard",
    "admin.users": "Users",
    "admin.products": "Products",
    "admin.orders": "Orders",
    "admin.analytics": "Analytics",
    "admin.notifications": "Notifications",

    // Auth
    "auth.login.title": "Sign In",
    "auth.login.subtitle": "Welcome back to StoreHub",
    "auth.register.title": "Create Account",
    "auth.register.subtitle": "Join StoreHub today",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.phone": "Phone Number",
    "auth.name": "Full Name",
    "auth.role": "Account Type",
    "auth.role.individual": "Individual",
    "auth.role.company_admin": "Company",
    "auth.role.company_staff": "Company Staff",
    "auth.role.affiliate": "Sales By Commission",
    "auth.companyName": "Company Name",

    "auth.register.companyName": "Company Name",
    "auth.register.companyName.placeholder": "Enter company name",
    "auth.register.companyEmail": "Company Email",
    "auth.register.companyEmail.placeholder": "Enter company email",
    "auth.register.companyEmail.hint":
      " You must use your official company email",
    "auth.register.commercialRegister": "Commercial Registration Image",
    "auth.register.taxCard": "Tax Card Image",
    "auth.register.affiliateCompany": "Company Name",
    "auth.register.affiliateCompany.placeholder": "Enter your company name",
    "auth.register.affiliateJobTitle": "Job Title",
    "auth.register.affiliateJobTitle.placeholder": "Enter your job title",
    "auth.register.affiliateReason": "Why do you want to work with us?",
    "auth.register.affiliateReason.placeholder": "Write your reason...",
    "auth.role.salesCommission": "Sales by Commission",
    "auth.register.name.placeholder": "Enter your full name",
    "auth.register.email.placeholder": "Enter your email",
    "auth.register.password.placeholder": "Create a password",
    "auth.register.haveAccount": "Already have an account?",

    "auth.register.phoneRequired": "Phone number is required",
    "auth.register.phoneInvalid": "Invalid  phone number",
    "auth.register.phone.placeholder": "Enter your phone number",

    "auth.forgotPassword.title": "Forgot Your Password ?",
    "auth.forgotPassword.subtitle":
      "Enter your email address below and we'll send you code to reset your password.",
    "auth.forgotPassword.emailPlaceholder": "Enter your email address",
    "auth.forgotPassword.sendCode": "Send Resent Code",
    "auth.forgotPassword.login": "Back to Login",
    "auth.forgotPassword.checkEmail": "Check your email",
    "auth.forgotPassword.sentTo": "We have sent a password reset code to",
    "auth.forgotPassword.enterCode": "Enter Reset Code",
    "auth.forgotPassword.codeSent": "Code has been sent ",

    "auth.resetPassword.title": "Reset Password",
    "auth.resetPassword.subtitle": "Enter the reset code",
    "auth.resetPassword.newPassword": "New Password",
    "auth.resetPassword.newPasswordPlaceholder": "Enter your new password",
    "auth.resetPassword.confirmPassword": "Confirm New Password",
    "auth.resetPassword.confirmPasswordPlaceholder":
      "Confirm your new password",
    "auth.resetPassword.resetButton": "Reset Password",
    "auth.resetPassword.resetting": "Resetting Password...",
    "auth.resetPassword.resendCode": "Resend Code",
    "auth.resetPassword.didntReceive": "Didn't receive the code?",
    "auth.resetPassword.backToLogin": "Back to Login",

    // Login
    "auth.login.email": "Email",
    "auth.login.password": "Password",
    "auth.login.emailPlaceholder": "Enter your email",
    "auth.login.passwordPlaceholder": "Enter your password",
    "auth.login.forgotPassword": "Forgot Password?",
    "auth.login.dontHaveAccount": "Don't have an account?",
    "auth.login.noAccount": "Don't have an account?",
  },
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.products": "المنتجات",
    "nav.services": "الخدمات",
    "nav.dashboard": "لوحة التحكم",
    "nav.admin": "المدير",
    "nav.affiliate": "المسوق",
    "nav.company": "الشركة",
    "nav.profile": "الملف الشخصي",
    "nav.logout": "تسجيل خروج",
    "nav.login": "تسجيل دخول",
    "nav.register": "إنشاء حساب",

    // Common
    "common.loading": "جارٍ التحميل...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.view": "عرض",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.sort": "ترتيب",
    "common.price": "السعر",
    "common.points": "النقاط",
    "common.total": "المجموع",
    "common.chooseFile": "اختر ملف",
    "common.noFileChosen": "لم يتم اختيار ملف",
    "common.sending": "جاري الإرسال...",

    // Home
    "home.hero.title": "مركز حلول الشبكات الرائد",
    "home.hero.subtitle":
      "اكتشف أحدث أجهزة الشبكات وتراخيص البرمجيات وخدمات التثبيت المهنية",
    "home.hero.cta": "استكشف المنتجات",
    "home.features.title": "لماذا تختار ستور هاب؟",
    "home.features.devices": "أجهزة شبكات متميزة",
    "home.features.devices.desc":
      "أحدث معدات الشبكات من أفضل العلامات التجارية",
    "home.features.licenses": "تراخيص البرمجيات",
    "home.features.licenses.desc": "تراخيص برمجيات أصلية مع التسليم الفوري",
    "home.features.installation": "خدمات التثبيت",
    "home.features.installation.desc": "إعداد وتكوين احترافي",

    // Products
    "products.title": "منتجاتنا",
    "products.category.all": "جميع المنتجات",
    "products.category.network-device": "أجهزة الشبكات",
    "products.category.software-license": "تراخيص البرمجيات",
    "products.category.installation-service": "خدمات التثبيت",
    "products.addToCart": "أضف للسلة",
    "products.outOfStock": "غير متوفر",

    // Cart
    "cart.title": "سلة التسوق",
    "cart.empty.title": "سلة التسوق فارغة",
    "cart.empty.subtitle": "أضف بعض المنتجات للبدء",
    "cart.empty.cta": "تصفح المنتجات",
    "cart.itemsCount": "عنصر في السلة",
    "cart.items": "عناصر السلة",
    "cart.summary": "ملخص الطلب",
    "cart.subtotal": "المجموع الفرعي",
    "cart.shipping": "الشحن",
    "cart.freeShipping": "مجاني",
    "cart.promoCode": "كود الخصم",
    "cart.promoCode.placeholder": "أدخل الكود",
    "cart.usePoints": "استخدم النقاط للحصول على خصم",
    "cart.discount": "خصم",
    "cart.pointsDiscount": "خصم النقاط",
    "cart.checkout": "متابعة الدفع",
    "cart.clear": "إفراغ السلة",
    "common.apply": "تطبيق",

    // Profile
    "profile.title": "إعدادات الملف الشخصي",
    "profile.subtitle": "إدارة إعدادات حسابك وتفضيلاتك",
    "profile.tabs.profile": "الملف الشخصي",
    "profile.tabs.security": "الأمان",
    "profile.tabs.notifications": "الإشعارات",
    "profile.tabs.preferences": "التفضيلات",
    "profile.phone": "رقم الهاتف",
    "profile.address": "العنوان",
    "profile.currentPassword": "كلمة المرور الحالية",
    "profile.newPassword": "كلمة المرور الجديدة",
    "profile.confirmPassword": "تأكيد كلمة المرور",
    "profile.changePassword": "تغيير كلمة المرور",
    "profile.notifications.email": "إشعارات البريد الإلكتروني",
    "profile.notifications.email.desc": "تلقي الإشعارات عبر البريد الإلكتروني",
    "profile.notifications.push": "الإشعارات الفورية",
    "profile.notifications.push.desc": "تلقي الإشعارات الفورية",
    "profile.notifications.sms": "إشعارات الرسائل النصية",
    "profile.notifications.sms.desc": "تلقي الإشعارات عبر الرسائل النصية",
    "profile.language": "اللغة",
    "profile.language.desc": "اختر لغتك المفضلة",
    "profile.theme": "المظهر",
    "profile.theme.desc": "اختر المظهر المفضل لديك",
    "profile.theme.light": "المظهر الفاتح",
    "profile.theme.dark": "المظهر الداكن",

    // Notifications
    "notifications.title": "الإشعارات",
    "notifications.unread": "إشعارات غير مقروءة",
    "notifications.allRead": "جميع الإشعارات مقروءة",
    "notifications.markAllRead": "تحديد الكل كمقروء",
    "notifications.clearAll": "مسح الكل",
    "notifications.filter.all": "الكل",
    "notifications.filter.unread": "غير مقروء",
    "notifications.filter.read": "مقروء",
    "notifications.empty.title": "لا توجد إشعارات",
    "notifications.empty.subtitle": "أنت محدث بكل شيء!",
    "notifications.markRead": "تحديد كمقروء",
    "notifications.delete": "حذف",

    // Dashboard
    "dashboard.title": "لوحة التحكم",
    "dashboard.welcome": "مرحباً بعودتك",
    "dashboard.stats.orders": "إجمالي الطلبات",
    "dashboard.stats.points": "رصيد النقاط",
    "dashboard.stats.spent": "إجمالي المبلغ المنفق",
    "dashboard.recentOrders": "الطلبات الأخيرة",
    "dashboard.pointsHistory": "تاريخ النقاط",

    // Admin
    "admin.title": "لوحة تحكم المدير",
    "admin.users": "المستخدمين",
    "admin.products": "المنتجات",
    "admin.orders": "الطلبات",
    "admin.analytics": "التحليلات",
    "admin.notifications": "الإشعارات",

    // Auth
    "auth.login.title": "تسجيل الدخول",
    "auth.login.subtitle": "مرحباً بعودتك إلى ستور هاب",
    "auth.register.title": "إنشاء حساب",
    "auth.register.subtitle": "انضم إلى ستور هاب اليوم",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.phone": "رقم الهاتف",
    "auth.name": "الاسم الكامل",
    "auth.role": "نوع الحساب",
    "auth.role.individual": "فردي",
    "auth.role.company_admin": "مدير شركة",
    "auth.role.company_staff": "موظف شركة",
    "auth.role.affiliate": "مسوق",
    "auth.companyName": "اسم الشركة",
    "auth.register.companyName": "اسم الشركة",
    "auth.register.companyName.placeholder": "ادخل اسم الشركة",
    "auth.register.companyEmail": "البريد الإلكتروني للشركة",
    "auth.register.companyEmail.placeholder": "ادخل بريد الشركة",
    "auth.register.companyEmail.hint": " يجب استخدام البريد الرسمي للشركة",
    "auth.register.commercialRegister": "صورة السجل التجاري",
    "auth.register.taxCard": "صورة البطاقة الضريبية",
    "auth.register.affiliateCompany": "اسم الشركة",
    "auth.register.affiliateCompany.placeholder": "ادخل اسم شركتك",
    "auth.register.affiliateJobTitle": "المسمى الوظيفي",
    "auth.register.affiliateJobTitle.placeholder": "ادخل المسمى الوظيفي",
    "auth.register.affiliateReason": "لماذا تريد العمل معنا؟",
    "auth.register.affiliateReason.placeholder":
      "اكتب سبب رغبتك في الانضمام...",
    "auth.role.salesCommission": "العمل بالعمولة",
    "auth.register.name.placeholder": "ادخل اسمك الكامل",
    "auth.register.email.placeholder": "ادخل بريدك الإلكتروني",
    "auth.register.password.placeholder": "انشئ كلمة مرور",
    "auth.register.haveAccount": "هل لديك حساب بالفعل؟",
    "auth.register.phoneRequired": "رقم الهاتف مطلوب",
    "auth.register.phoneInvalid": "رقم الهاتف غير صالح",
    "auth.register.phone.placeholder": "ادخل رقم هاتفك",

    "auth.forgotPassword.title": "هل نسيت كلمة المرور؟",
    "auth.forgotPassword.subtitle":
      "أدخل بريدك الإلكتروني  وسنرسل لك رمزًا لإعادة تعيين كلمة المرور.",
    "auth.forgotPassword.emailPlaceholder": "أدخل بريدك الإلكتروني",
    "auth.forgotPassword.sendCode": "إرسال رمز إعادة التعيين",
    "auth.forgotPassword.login": "العودة لتسجيل الدخول",
    "auth.forgotPassword.checkEmail": "تحقق من بريدك الإلكتروني",
    "auth.forgotPassword.sentTo": "لقد أرسلنا رمز إعادة تعيين كلمة المرور إلى",
    "auth.forgotPassword.enterCode": "أدخل رمز إعادة التعيين",
    "auth.forgotPassword.codeSent": "تم إرسال الرمز ",

    "auth.resetPassword.title": "إعادة تعيين كلمة المرور",
    "auth.resetPassword.subtitle": "أدخل رمز إعادة التعيين",
    "auth.resetPassword.newPassword": "كلمة المرور الجديدة",
    "auth.resetPassword.newPasswordPlaceholder": "أدخل كلمة المرور الجديدة",
    "auth.resetPassword.confirmPassword": "تأكيد كلمة المرور الجديدة",
    "auth.resetPassword.confirmPasswordPlaceholder": "أكد كلمة المرور الجديدة",
    "auth.resetPassword.resetButton": "إعادة تعيين كلمة المرور",
    "auth.resetPassword.resetting": "جاري إعادة تعيين كلمة المرور...",
    "auth.resetPassword.resendCode": "إعادة إرسال الرمز",
    "auth.resetPassword.didntReceive": "لم تستلم الرمز؟",
    "auth.resetPassword.backToLogin": "العودة لتسجيل الدخول",

    // Login
    "auth.login.email": "البريد الإلكتروني",
    "auth.login.password": "كلمة المرور",
    "auth.login.emailPlaceholder": "ادخل بريدك الإلكتروني",
    "auth.login.passwordPlaceholder": "ادخل كلمة المرور",
    "auth.login.forgotPassword": "هل نسيت كلمة المرور؟",
    "auth.login.dontHaveAccount": "ليس لديك حساب؟",
    "auth.login.noAccount": "ليس لديك حساب؟",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initialLang =
    (localStorage.getItem("storehub_language") as "en" | "ar") || "en";

  const [language, setLanguage] = useState<"en" | "ar">(initialLang);

  useEffect(() => {
    const savedLang = localStorage.getItem("storehub_language") as "en" | "ar";
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    localStorage.setItem("storehub_language", language);
  }, [language]);

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["en"]] || key
    );
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
