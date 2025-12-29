import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BuildingOfficeIcon,
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { apiRequest, handleApiResponse } from "../../utils/api";
import toast from "react-hot-toast";
import { Company,Employee } from "../../types";
const CompanyDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    department: "sales",
    hire_date: new Date().toISOString().split("T")[0],
    can_manage_orders: false,
    can_view_reports: false,
    can_manage_inventory: false,
    can_manage_customers: false,
  });

  useEffect(() => {
    fetchCompanyData();
    fetchEmployees();
  }, []);

  const fetchCompanyData = async () => {
    try {
      const response = await apiRequest("/auth/company/detail/");
      const data = await handleApiResponse(response);
      setCompany(data);
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiRequest("/auth/company/employees/");
      const data = await handleApiResponse(response);

      // Ensure we always have an array
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleImageUpdate = async (type: "tax" | "cr", file: File) => {
    if (!company) return;
    try {
      const formData = new FormData();
      formData.append(
        type === "tax" ? "tax_card_image" : "commercial_registration_image",
        file
      );

      const response = await apiRequest(`/auth/company/update-documents/`, {
        method: "POST",
        body: formData,
      });
      await handleApiResponse(response);
      toast.success("Document updated successfully!");
    } catch (error) {
      toast.error("Failed to update document");
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.email.endsWith(`@${user?.email.split("@")[1]}`)) {
      toast.error(
        `Employee email must match company domain: ${
          company?.email.split("@")[1]
        }`
      );
      return;
    }

    try {
      const response = await apiRequest("/auth/company/employees/add/", {
        method: "POST",
        body: JSON.stringify(newEmployee),
      });

      const data = await handleApiResponse(response);
      setEmployees([...employees, data]);
      setNewEmployee({
        full_name: "",
        email: "",
        phone: "",
        position: "",
        department: "sales",
        hire_date: new Date().toISOString().split("T")[0],
        can_manage_orders: false,
        can_view_reports: false,
        can_manage_inventory: false,
        can_manage_customers: false,
      });
      setShowAddEmployee(false);
      toast.success("Employee added successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add employee";
      toast.error(errorMessage);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      const response = await apiRequest(
        `/auth/company/employees/${editingEmployee.id}/`,
        {
          method: "put",
          body: JSON.stringify(editingEmployee),
        }
      );

      const data = await handleApiResponse(response);
      setEmployees(employees.map((emp) => (emp.id === data.id ? data : emp)));
      setEditingEmployee(null);
      toast.success("Employee updated successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update employee";
      toast.error(errorMessage);
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await apiRequest(`/auth/company/employees/${employeeId}/`, {
        method: "DELETE",
      });

      setEmployees(employees.filter((emp) => emp.id !== employeeId));
      toast.success("Employee deleted successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete employee";
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "pending":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "rejected":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === "ar" ? "لوحة تحكم الشركة" : "Company Dashboard"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {language === "ar"
              ? "إدارة الشركة والموظفين"
              : "Manage your company and employees."}
          </p>
        </motion.div>

        {company && (
          <CompanyCard company={company} onUpdateImage={handleImageUpdate} />
        )}
        {/* Employees Section */}
        <motion.div
          dir={language === "ar" ? "rtl" : "ltr"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {/* Icon + Title */}
              <div className="flex items-center gap-2">
                <UsersIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === "ar" ? "الموظفين" : "Employees"} (
                  {employees.length})
                </h2>
              </div>

              {/* Add Employee Button */}
              <button
                onClick={() => setShowAddEmployee(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>{language === "ar" ? "اضافة موظف" : "Add Employee"}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider
  ${language === "ar" ? "text-right" : "text-left"}`}
                  >
                    {language === "ar" ? "الاسم" : "Name"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider
  ${language === "ar" ? "text-right" : "text-left"}`}
                  >
                    {language === "ar" ? "البريد الالكتروني" : "Email"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider
  ${language === "ar" ? "text-right" : "text-left"}`}
                  >
                    {language === "ar" ? "الوظيفة" : "Position"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider
  ${language === "ar" ? "text-right" : "text-left"}`}
                  >
                    {language === "ar" ? "القسم" : "Department"}
                  </th>
                  <th
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider
  ${language === "ar" ? "text-right" : "text-left"}`}
                  >
                    {language === "ar" ? "الحالة" : "Status"}
                  </th>
                                   <th
                    className={`px-6 py-3 text-xs font-medium uppercase tracking-wider
  ${language === "ar" ? "text-right" : "text-left"}`}
                  >
                    {language === "ar" ? "الاجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td
                      className={`px-6 py-4 whitespace-nowrap 
  ${language === "ar" ? "text-right" : "text-left"}`}
                    >
                      {employee.full_name}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap 
  ${language === "ar" ? "text-right" : "text-left"}`}
                    >
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {t(`${employee.position}`)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {t(`${employee.department}`)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap 
  ${language === "ar" ? "text-right" : "text-left"}`}
                    >
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          employee.status
                        )}`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    
                    <td
                      className={`px-6 py-4 whitespace-nowrap 
  ${language === "ar" ? "text-right" : "text-left"}`}
                    >
                      <div className="flex items-center space-x-2 gap-2">
                        <button
                          onClick={() => setEditingEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {employees.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {language === "ar"
                  ? "لا يوجد موظفين حتى الآن"
                  : "No employees yet"}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {language === "ar"
                  ? "لا يوجد موظفين حتى الآن. قم بإضافة موظف جديد."
                  : "Start by adding your first employee to the company."}
              </p>
            </div>
          )}
        </motion.div>

        {/* Add Employee Modal */}
        {showAddEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              dir={language === "ar" ? "rtl" : "ltr"}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 
    max-h-[90vh] overflow-y-auto 
    ${language === "ar" ? "text-right" : "text-left"}`}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === "ar" ? "إضافة موظف جديد" : "Add New Employee"}
              </h3>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الاسم" : "Name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newEmployee.full_name}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          full_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "البريد الإلكتروني" : "Email"}
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmployee.email}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "رقم الهاتف" : "Phone"}
                    </label>
                    <input
                      type="tel"
                      value={newEmployee.phone}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الوظيفة" : "Position"}
                    </label>
                    <input
                      type="text"
                      required
                      value={newEmployee.position}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          position: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "القسم" : "Department"}
                    </label>
                    <select
                      value={newEmployee.department}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="sales">
                        {language === "ar" ? "مبيعات" : "Sales"}
                      </option>
                      <option value="marketing">
                        {language === "ar" ? "تسويق" : "Marketing"}
                      </option>
                      <option value="support">
                        {language === "ar" ? "دعم العملاء" : "Customer Support"}
                      </option>
                      <option value="technical">
                        {language === "ar" ? "فني" : "Technical"}
                      </option>
                      <option value="finance">
                        {language === "ar" ? "مالية" : "Finance"}
                      </option>
                      <option value="hr">
                        {language === "ar"
                          ? "موارد انسانية"
                          : "Human Resources"}
                      </option>
                      <option value="operations">
                        {language === "ar" ? "عمليات" : "Operations"}
                      </option>
                      <option value="management">
                        {language === "ar" ? "ادارة" : "Management"}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "تاريخ التعيين" : "Hire Date"}
                    </label>
                    <input
                      type="date"
                      required
                      value={newEmployee.hire_date}
                      onChange={(e) =>
                        setNewEmployee({
                          ...newEmployee,
                          hire_date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                
                <div className="flex justify-end space-x-3 pt-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEmployee(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {language === "ar" ? "حفظ" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {editingEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              dir={language === "ar" ? "rtl" : "ltr"}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 
    max-h-[90vh] overflow-y-auto 
    ${language === "ar" ? "text-right" : "text-left"}`}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === "ar" ? "تعديل الموظف" : "Edit Employee"}
              </h3>
              <form onSubmit={handleUpdateEmployee} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الاسم" : "Name"}
                    </label>
                    <input
                      disabled
                      type="text"
                      required
                      value={editingEmployee.full_name}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          full_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "البريد الإلكتروني" : "Email"}
                    </label>
                    <input
                      disabled
                      type="email"
                      required
                      value={editingEmployee.email}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "رقم الهاتف" : "Phone"}
                    </label>
                    <input
                      type="tel"
                      value={editingEmployee.phone || ""}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الوظيفة" : "Position"}
                    </label>
                    <input
                      type="text"
                      required
                      value={editingEmployee.position}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          position: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "القسم" : "Department"}
                    </label>
                    <select
                      value={editingEmployee.department}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="sales">
                        {language === "ar" ? "مبيعات" : "Sales"}
                      </option>
                      <option value="marketing">
                        {language === "ar" ? "تسويق" : "Marketing"}
                      </option>
                      <option value="support">
                        {language === "ar" ? "دعم العملاء" : "Customer Support"}
                      </option>
                      <option value="technical">
                        {language === "ar" ? "فني" : "Technical"}
                      </option>
                      <option value="finance">
                        {language === "ar" ? "مالي" : "Finance"}
                      </option>
                      <option value="hr">
                        {language === "ar"
                          ? "موارد بشرية"
                          : "Human Resources"}
                      </option>
                      <option value="operations">
                        {language === "ar" ? "عمليات" : "Operations"}
                      </option>
                      <option value="management">
                        {language === "ar" ? "ادارة" : "Management"}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === "ar" ? "الحالة" : "Status"}
                    </label>
                    <select
                      value={editingEmployee.status}
                      onChange={(e) =>
                        setEditingEmployee({
                          ...editingEmployee,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="active">
                        {language === "ar" ? "نشط" : "Active"}
                      </option>
                      <option value="inactive">
                        {language === "ar" ? "غير نشط" : "Inactive"}
                      </option>
                      <option value="pending">
                        {language === "ar" ? "قيد الانتظار" : "Pending"}
                      </option>
                      <option value="suspended">
                        {language === "ar" ? "معلق" : "Suspended"}
                      </option>
                    </select>
                  </div>
                </div>

               
                <div className="flex justify-end space-x-3 pt-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {language === "ar" ? "حفظ" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;

// --- CompanyCard Component ---
const CompanyCard: React.FC<{
  company: Company;
  onUpdateImage: (type: "tax" | "cr", file: File) => void;
}> = ({ company, onUpdateImage }) => {
  const [taxCard, setTaxCard] = useState(company.tax_card_image);
  const [crCard, setCrCard] = useState(company.commercial_registration_image);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "tax" | "cr"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === "tax") setTaxCard(url);
      else setCrCard(url);
      onUpdateImage(type, file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {company.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === "ar" ? "عدد الموظفين" : "Number of Employees"}{" "}
              {company.employee_count}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            company.approval_status === "approved"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : company.approval_status === "pending"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {t(`${company.approval_status}`)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {/* Email */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {language === "ar" ? "البريد الإلكتروني" : "Email"}
          </h3>
          <p className="text-gray-900 dark:text-white">{company.email}</p>
        </div>

        {/* Phone */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {language === "ar" ? "رقم الهاتف" : "Phone"}
          </h3>
          <p className="text-gray-900 dark:text-white">
            {company.phone || "—"}
          </p>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {language === "ar" ? "العنوان" : "Address"}
          </h3>
          <p className="text-gray-900 dark:text-white">
            {user.address || "—"}
             </p>
        </div>
      </div>

      {/* Documents */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          {language === "ar" ? "الوثائق" : "Documents"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tax Card */}
          <div className="relative group">
            <img
              src={taxCard}
              alt="Tax Card"
              className="w-full h-96 rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>

          {/* Commercial Registration */}
          <div className="relative group">
            <img
              src={crCard}
              alt="CR Certificate"
              className="w-full h-96 rounded-lg border border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
