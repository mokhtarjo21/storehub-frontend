import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { apiRequest, handleApiResponse } from "../../utils/api";
import toast from "react-hot-toast";
import {
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { Notification } from "../../types";

const MyNotifications: React.FC = () => {
  const { language } = useLanguage();
  const { getNotifications, isLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    try {
      const [cRes] = await Promise.allSettled([getNotifications(page)]);

      if (cRes.status === "fulfilled") {
        const response = cRes.value;

        const cdata = response?.results ?? response?.data ?? [];

        if (response?.count) {
          setTotalPages(Math.ceil(response.count / 10));
        }

        if (Array.isArray(cdata)) {
          setNotifications(cdata);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingBagIcon;
      case "points":
        return CurrencyDollarIcon;
      case "service":
        return TruckIcon;
      default:
        return BellIcon;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
      case "points":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "service":
        return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20";
      case "marketing":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20";
      case "security":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await apiRequest(
        `/auth/notifications/${id}/mark-read/`,
        {
          method: "POST",
        }
      );

      await handleApiResponse(response);
      fetchNotifications();
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await apiRequest(`/auth/notifications/${id}/delete/`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications(notifications.filter((n) => n.id !== id));
        toast.success("Notification deleted");
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiRequest("/auth/notifications/mark-all-read/", {
        method: "POST",
      });

      await handleApiResponse(response);
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="text-center py-12">
        <BellIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          {language === "ar" ? "لا توجد إشعارات" : "No notifications"}
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {unreadCount} {language === "ar" ? "غير مقروءة" : "unread"}
          </p>
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {language === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
          </button>
        </div>
      )}

      {notifications.map((notification, index) => {
        const Icon = getNotificationIcon(notification.notification_type);
        const colorClass = getNotificationColor(notification.notification_type);

        return (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${
              !notification.is_read ? "ring-2 ring-blue-500/20" : ""
            }`}
          >
            <div className="flex gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {language === "ar"
                        ? notification.title_ar
                        : notification.title}
                    </h4>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {language === "ar"
                        ? notification.message_ar
                        : notification.message}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center py-4 gap-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {language === "ar" ? "السابق" : "Previous"}
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {language === "ar" ? "الصفحة" : "Page"} {page} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {language === "ar" ? "التالي" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default MyNotifications;
