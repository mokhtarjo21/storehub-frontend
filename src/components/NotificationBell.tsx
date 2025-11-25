import React, {
  useState,
  useEffect,
  Fragment,
  useMemo,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { BellIcon, CheckIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../contexts/LanguageContext";
import { Notification } from "../types";
import toast from "react-hot-toast";

const NotificationBell: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("access_token");

  const locale = useMemo(
    () => (language === "ar" ? "ar-EG" : "en-GB"),
    [language]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        "http://192.168.1.7:8000/api/auth/notifications/?limit=5",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.results || data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(
        "http://192.168.1.7:8000/api/auth/notifications/unread-count/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = async (notificationId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.1.7:8000/api/auth/notifications/${notificationId}/read/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
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
        fetchUnreadCount();
        toast.success(
          t("notifications.markReadSuccess") ||
            (language === "ar"
              ? "تم تحديد الإشعار كمقروء"
              : "Notification marked as read")
        );
      }
    } catch (error) {
      toast.error(
        t("notifications.markReadError") ||
          (language === "ar"
            ? "فشل تحديد الإشعار كمقروء"
            : "Failed to mark notification as read")
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();

    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.1.7:8000/api/auth/notifications/${notificationId}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        fetchUnreadCount();
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
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "order":
        return <div className={`${iconClass} text-blue-500`}>📦</div>;
      case "company":
        return <div className={`${iconClass} text-purple-500`}>🏢</div>;
      case "points":
        return <div className={`${iconClass} text-yellow-500`}>⭐</div>;
      case "service":
        return <div className={`${iconClass} text-green-500`}>🛠️</div>;
      case "marketing":
        return <div className={`${iconClass} text-pink-500`}>📢</div>;
      case "security":
        return <div className={`${iconClass} text-red-500`}>🔒</div>;
      default:
        return <BellIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const created = new Date(dateString);
    const diff = Date.now() - created.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return (
        t("notifications.time.justNow") ||
        (language === "ar" ? "الآن" : "Just now")
      );
    }
    if (minutes < 60) {
      if (language === "ar") {
        return `منذ ${minutes} دقيقة`;
      }
      return `${minutes}${t("notifications.time.minutes") || "m ago"}`;
    }
    if (hours < 24) {
      if (language === "ar") {
        return `منذ ${hours} ساعة`;
      }
      return `${hours}${t("notifications.time.hours") || "h ago"}`;
    }
    if (days < 7) {
      if (language === "ar") {
        return `منذ ${days} يوم`;
      }
      return `${days}${t("notifications.time.days") || "d ago"}`;
    }
    return created.toLocaleDateString(locale);
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="notifications">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={`absolute z-50 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${isRTL ? "left-0" : "right-0"}`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("notifications.title") || "Notifications"}
              </h3>
              <Link
                to="/notifications"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {t("notifications.viewAll") || "View all"}
              </Link>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {t("notifications.dropdown.none") ||
                  t("notifications.empty.subtitle") ||
                  "No notifications"}
              </div>
            ) : (
              notifications.map((notification) => (
                <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <Link
                      to={notification.link || "/notifications"}
                      className={`block border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                        active ? "bg-gray-50 dark:bg-gray-700" : ""
                      } ${
                        !notification.is_read
                          ? "bg-blue-50 dark:bg-blue-900/10"
                          : ""
                      }`}
                      onClick={() =>
                        !notification.is_read && markAsRead(notification.id)
                      }
                    >
                      <div className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(
                              notification.notification_type
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p
                                className={`text-sm font-medium ${
                                  !notification.is_read
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {language === "ar"
                                  ? notification.title_ar
                                  : notification.title}
                              </p>
                              <button
                                onClick={(e) =>
                                  deleteNotification(notification.id, e)
                                }
                                disabled={loading}
                                className="ml-2 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {language === "ar"
                                ? notification.message_ar
                                : notification.message}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {formatRelativeTime(notification.created_at)}
                              </span>
                              {!notification.is_read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    markAsRead(notification.id);
                                  }}
                                  disabled={loading}
                                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                                >
                                  <CheckIcon className="w-3 h-3" />
                                  <span>
                                    {t("notifications.markRead") ||
                                      "Mark as read"}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </Menu.Item>
              ))
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationBell;
