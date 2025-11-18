import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiRequest, handleApiResponse } from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
type RegistrationType = 'individual' | 'company' | 'sales_commission';
type Step = 1 | 2 | 3;

interface FormData {
  full_name: string;
  email: string;
  password: string;
  password_confirm: string;
  phone_number: string;
  job_title: string;
  has_agreed_to_policy: boolean;
  registration_type: RegistrationType;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  commercial_registration_number: string;
  tax_card_image: File | null;
  commercial_registration_image: File | null;
  sales_company_name: string;
  sales_job_title: string;
  sales_motivation: string;
  sales_reason: string;
  sales_view: string;
}

const SmartRegister: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isCompanyChecked, setIsCompanyChecked] = useState(false);
  const [isSalesChecked, setIsSalesChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    password_confirm: '',
    phone_number: '',
    job_title: '',
    has_agreed_to_policy: false,
    registration_type: 'individual',
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    commercial_registration_number: '',
    tax_card_image: null,
    commercial_registration_image: null,
    sales_company_name: '',
    sales_job_title: '',
    sales_motivation: '',
    sales_reason: '',
    sales_view: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'tax_card_image' | 'commercial_registration_image') => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleRegistrationTypeChange = (type: 'company' | 'sales') => {
    if (type === 'company') {
      setIsCompanyChecked(!isCompanyChecked);
      setIsSalesChecked(false);
      setFormData(prev => ({
        ...prev,
        registration_type: !isCompanyChecked ? 'company' : 'individual'
      }));
    } else {
      setIsSalesChecked(!isSalesChecked);
      setIsCompanyChecked(false);
      setFormData(prev => ({
        ...prev,
        registration_type: !isSalesChecked ? 'sales_commission' : 'individual'
      }));
    }
  };

  const sendOTP = async () => {
    if (!formData.phone_number) {
      toast.error(language === 'ar' ? 'الرجاء إدخال رقم الهاتف' : 'Please enter phone number');
      return;
    }

    try {
      await apiRequest('/auth/send-otp/', {
        method: 'POST',
        body: JSON.stringify({ phone: formData.phone_number, type: 'phone_verification' })
      });
      setOtpSent(true);
      toast.success(language === 'ar' ? 'تم إرسال رمز التحقق' : 'OTP sent successfully');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل إرسال رمز التحقق' : 'Failed to send OTP');
    }
  };

  const validateStep1 = () => {
    if (!formData.full_name || !formData.email || !formData.password || !formData.password_confirm || !formData.phone_number) {
      toast.error(language === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill all required fields');
      return false;
    }
    if (formData.password !== formData.password_confirm) {
      toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return false;
    }
    if (!formData.has_agreed_to_policy) {
      toast.error(language === 'ar' ? 'يجب الموافقة على الشروط والأحكام' : 'You must agree to terms and policy');
      return false;
    }
    if (!otpSent) {
      toast.error(language === 'ar' ? 'الرجاء التحقق من رقم الهاتف' : 'Please verify your phone number');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.registration_type === 'company') {
      if (!formData.company_name || !formData.company_email || !formData.company_phone ||
          !formData.company_address || !formData.commercial_registration_number) {
        toast.error(language === 'ar' ? 'الرجاء ملء جميع بيانات الشركة' : 'Please fill all company fields');
        return false;
      }
      if (!formData.tax_card_image || !formData.commercial_registration_image) {
        toast.error(language === 'ar' ? 'الرجاء إرفاق البطاقة الضريبية والسجل التجاري' : 'Please upload tax card and commercial registration');
        return false;
      }
    }
    if (formData.registration_type === 'sales_commission') {
      if (!formData.sales_company_name || !formData.sales_job_title || !formData.sales_motivation || !formData.sales_reason || !formData.sales_view) {
        toast.error(language === 'ar' ? 'الرجاء ملء جميع حقول التقديم' : 'Please fill all application fields');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'tax_card_image' || key === 'commercial_registration_image') {
            if (value instanceof File) {
              submitData.append(key, value);
            }
          } else {
            submitData.append(key, String(value));
          }
        }
      });

      const response = await apiRequest('/auth/smart-register/', {
        method: 'POST',
        body: submitData,
        isFormData: true
      });
      const data = await handleApiResponse(response);

      if (formData.registration_type === 'individual') {
        setSuccessMessage(language === 'ar' ?
          'مرحباً! تم إنشاء حسابك بنجاح.' :
          'Welcome! Your account has been created successfully.');
      } else if (formData.registration_type === 'company') {
        setSuccessMessage(language === 'ar' ?
          'شكراً! طلب تسجيل شركتك قيد المراجعة.' :
          'Thank you! Your company request is under review.');
      } else {
        setSuccessMessage(language === 'ar' ?
          'تم استلام طلبك. سيتواصل معك فريق المبيعات قريباً.' :
          'Your application has been received. Our sales team will contact you soon.');
      }

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step < 3) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'ar' ? 'إنشاء حساب' : 'Create Account'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'ar' ? 'انضم إلى StoreHub اليوم' : 'Join StoreHub today'}
            </p>
          </div>

          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                <p className="text-xs mt-2 text-center text-gray-600 dark:text-gray-400">
                  {s === 1 && (language === 'ar' ? 'المعلومات الشخصية' : 'Personal Info')}
                  {s === 2 && (language === 'ar' ? 'نوع الحساب' : 'Account Type')}
                  {s === 3 && (language === 'ar' ? 'التأكيد' : 'Confirmation')}
                </p>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={sendOTP}
                      disabled={otpSent}
                      className={`px-4 py-3 rounded-lg font-medium ${otpSent ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                      {otpSent ? (language === 'ar' ? 'تم الإرسال' : 'Sent') : (language === 'ar' ? 'إرسال' : 'Send OTP')}
                    </button>
                  </div>

                  {otpSent && (
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder={language === 'ar' ? 'رمز التحقق' : 'Enter OTP'}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  )}

                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'المسمى الوظيفي (اختياري)' : 'Job Title (Optional)'}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />

                  <label className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      name="has_agreed_to_policy"
                      checked={formData.has_agreed_to_policy}
                      onChange={handleInputChange}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {language === 'ar' ? 'أوافق على الشروط والأحكام وسياسة الخصوصية' : 'I agree to Terms & Privacy Policy'}
                    </span>
                  </label>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-6 rounded-lg border-2 cursor-pointer transition ${!isCompanyChecked && !isSalesChecked ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                      <UserIcon className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                      <h3 className="text-center font-semibold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'فردي' : 'Individual'}
                      </h3>
                    </div>

                    <div
                      onClick={() => handleRegistrationTypeChange('company')}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition ${isCompanyChecked ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                      <h3 className="text-center font-semibold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'شركة' : 'Company'}
                      </h3>
                    </div>

                    <div
                      onClick={() => handleRegistrationTypeChange('sales')}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition ${isSalesChecked ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                    >
                      <BriefcaseIcon className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                      <h3 className="text-center font-semibold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'شريك مبيعات' : 'Sales Partner'}
                      </h3>
                    </div>
                  </div>

                  {(isCompanyChecked || isSalesChecked) && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start space-x-3 rtl:space-x-reverse">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        {language === 'ar' ?
                          'لا يمكنك التقديم لكلا الخيارين معاً' :
                          'You cannot apply for both company and sales partner simultaneously'}
                      </p>
                    </div>
                  )}

                  {isCompanyChecked && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder={language === 'ar' ? 'اسم الشركة' : 'Company Name'} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      <input type="email" name="company_email" value={formData.company_email} onChange={handleInputChange} placeholder={language === 'ar' ? 'البريد الرسمي للشركة' : 'Official Company Email'} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      <input type="text" name="company_phone" value={formData.company_phone} onChange={handleInputChange} placeholder={language === 'ar' ? 'هاتف الشركة' : 'Company Phone'} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      <textarea name="company_address" value={formData.company_address} onChange={handleInputChange} placeholder={language === 'ar' ? 'عنوان الشركة' : 'Company Address'} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      <input type="text" name="commercial_registration_number" value={formData.commercial_registration_number} onChange={handleInputChange} placeholder={language === 'ar' ? 'رقم السجل التجاري' : 'Commercial Registration Number'} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {language === 'ar' ? 'صورة البطاقة الضريبية *' : 'Tax Card Image *'}
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'tax_card_image')}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {formData.tax_card_image && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {language === 'ar' ? '✓ تم الرفع' : '✓ Uploaded'}: {formData.tax_card_image.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {language === 'ar' ? 'صورة السجل التجاري *' : 'Commercial Registration Image *'}
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'commercial_registration_image')}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {formData.commercial_registration_image && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {language === 'ar' ? '✓ تم الرفع' : '✓ Uploaded'}: {formData.commercial_registration_image.name}
                          </p>
                        )}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {language === 'ar' ?
                            'سيتم مراجعة طلب تسجيل شركتك من قبل فريقنا. سيتم التواصل معك قبل التفعيل.' :
                            'Your company registration will be reviewed by our team. You will be contacted before activation.'}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {isSalesChecked && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <input
                        type="text"
                        name="sales_company_name"
                        value={formData.sales_company_name}
                        onChange={handleInputChange}
                        placeholder={language === 'ar' ? 'اسم الشركة التي تعمل بها' : 'Company you work for'}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <input
                        type="text"
                        name="sales_job_title"
                        value={formData.sales_job_title}
                        onChange={handleInputChange}
                        placeholder={language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <textarea
                        name="sales_motivation"
                        value={formData.sales_motivation}
                        onChange={handleInputChange}
                        placeholder={language === 'ar' ? 'جملة تحفيزية عنك' : 'A motivational statement about yourself'}
                        rows={2}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <textarea name="sales_reason" value={formData.sales_reason} onChange={handleInputChange} placeholder={language === 'ar' ? 'لماذا تريد الانضمام إلى برنامج العمولة؟' : 'Why do you want to join our commission program?'} rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      <textarea name="sales_view" value={formData.sales_view} onChange={handleInputChange} placeholder={language === 'ar' ? 'كيف يمكنك جلب فرص مبيعات؟' : 'How can you bring sales opportunities?'} rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {language === 'ar' ?
                            'بعد التقديم، سيتواصل معك فريق المبيعات لمراجعة طلبك. الموافقة ليست تلقائية.' :
                            'After submitting, our sales team will contact you to review your application. Approval is not automatic.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={prevStep} className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg">
                    {language === 'ar' ? 'السابق' : 'Previous'}
                  </button>
                  <button onClick={nextStep} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
                    {language === 'ar' ? 'التالي' : 'Next'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center space-y-4">
                  <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'مراجعة وتأكيد' : 'Review & Confirm'}
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-left space-y-2">
                    <p><strong>{language === 'ar' ? 'الاسم:' : 'Name:'}</strong> {formData.full_name}</p>
                    <p><strong>{language === 'ar' ? 'البريد:' : 'Email:'}</strong> {formData.email}</p>
                    <p><strong>{language === 'ar' ? 'نوع الحساب:' : 'Account Type:'}</strong> {formData.registration_type === 'individual' ? (language === 'ar' ? 'فردي' : 'Individual') : formData.registration_type === 'company' ? (language === 'ar' ? 'شركة' : 'Company') : (language === 'ar' ? 'شريك مبيعات' : 'Sales Partner')}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={prevStep} className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg">
                    {language === 'ar' ? 'السابق' : 'Previous'}
                  </button>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50">
                    {isSubmitting ? (language === 'ar' ? 'جاري التسجيل...' : 'Registering...') : (language === 'ar' ? 'تأكيد التسجيل' : 'Confirm Registration')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'لديك حساب؟' : 'Already have an account?'}{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Link>
          </div>
        </motion.div>

        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
              <CheckCircleIcon className="h-20 w-20 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'تم بنجاح!' : 'Success!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{successMessage}</p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SmartRegister;
