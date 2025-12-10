import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { Notification } from "../types";
import toast from "react-hot-toast";

const Notifications: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const notificationTypes = useMemo(
    () => [
      { value: "all", label: t("notifications.types.all") || "All Types" },
      { value: "order", label: t("notifications.types.order") || "Order" },
      
      { value: "security", label: t("notifications.types.security") || "Security" },
    ],
    [t]
  );

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      let url = "http://72.60.181.116:8000/api/auth/notifications/";
      const params = new URLSearchParams();

      if (filter !== "all") {
        params.append("is_read", filter === "read" ? "true" : "false");
      }

      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.results || data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case "order":
        return <span className="text-2xl">📦</span>;
      case "company":
        return <span className="text-2xl">🏢</span>;
      case "points":
        return <span className="text-2xl">⭐</span>;
      case "service":
        return <span className="text-2xl">🛠️</span>;
      case "marketing":
        return <span className="text-2xl">📢</span>;
      case "security":
        return <span className="text-2xl">🔒</span>;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `http://72.60.181.116:8000/api/auth/notifications/${notificationId}/read/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        toast.success(
          t("notifications.markReadSuccess") ||
            (language === "ar"
              ? "تم تحديد الإشعار كمقروء"
              : "Marked as read")
        );
      }
    } catch (error) {
      toast.error(
        t("notifications.markReadError") ||
          (language === "ar"
            ? "فشل تحديد الإشعار كمقروء"
            : "Failed to mark as read")
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        "http://72.60.181.116:8000/api/auth/notifications/mark-all-read/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        fetchNotifications();
        toast.success(
          t("notifications.markAllSuccess") ||
            (language === "ar"
              ? "تم تحديد جميع الإشعارات كمقروءة"
              : "All notifications marked as read")
        );
      }
    } catch (error) {
      toast.error(
        t("notifications.markAllError") ||
          (language === "ar"
            ? "فشل تحديد كل الإشعارات كمقروءة"
            : "Failed to mark all as read")
      );
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(
        `http://72.60.181.116:8000/api/auth/notifications/${notificationId}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success(
          t("notifications.deleteSuccess") ||
            (language === "ar" ? "تم حذف الإشعار" : "Notification deleted")
        );
      }
    } catch (error) {
      toast.error(
        t("notifications.deleteError") ||
          (language === "ar"
            ? "فشل حذف الإشعار"
            : "Failed to delete notification")
      );
    }
  };

  const clearAll = async () => {
    const confirmMessage =
      t("notifications.clearConfirm") ||
      (language === "ar"
        ? "هل أنت متأكد من حذف جميع الإشعارات؟"
        : "Are you sure you want to delete all notifications?");
    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(
        "http://72.60.181.116:8000/api/auth/notifications/delete-all/",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (response.ok) {
        setNotifications([]);
        toast.success(
          t("notifications.clearSuccess") ||
            (language === "ar" ? "تم حذف جميع الإشعارات" : "All notifications deleted")
        );
      }
    } catch (error) {
      toast.error(
        t("notifications.clearError") ||
          (language === "ar"
            ? "فشل حذف الإشعارات"
            : "Failed to delete all notifications")
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("notifications.title") || "Notifications"}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {unreadCount > 0
                  ? `${unreadCount} ${
                      t("notifications.unread") || "unread notifications"
                    }`
                  : t("notifications.allRead") || "All caught up!"}
              </p>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>{t("notifications.markAllRead") || "Mark all read"}</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>{t("notifications.clearAll") || "Clear all"}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Read Status Filter */}
          <div className="flex space-x-1 rtl:space-x-reverse bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(["all", "unread", "read"] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === filterOption
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                {filterOption === "unread" && unreadCount > 0 && (
                  <span className="ml-2 rtl:ml-0 rtl:mr-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {notificationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t("notifications.empty.title") || "No notifications"}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t("notifications.empty.subtitle") || "You're all caught up!"}
              </p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative ${
                  !notification.is_read
                    ? "ring-2 ring-blue-500 ring-opacity-20"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {language === "ar"
                              ? notification.title_ar
                              : notification.title}
                          </h3>
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {notification.notification_type_display}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">
                          {language === "ar"
                            ? notification.message_ar
                            : notification.message}
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4 rtl:ml-0 rtl:mr-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            title={t("notifications.markRead") || "Mark as read"}
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          title={t("notifications.delete") || "Delete"}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {!notification.is_read && (
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;

