import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [animateBell, setAnimateBell] = useState(false);

  useEffect(() => {
    if (unreadCount > 0) {
      setAnimateBell(true);
      const timeout = setTimeout(() => setAnimateBell(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [unreadCount]);

  useEffect(() => {
    const newNotifications = notifications.slice(0, 1);
    newNotifications.forEach((n) => {
      if (!toasts.find((t) => t._id === n._id)) {
        const toast = {
          _id: n._id,
          type: n.type,
          text: getText(n),
          metadata: n.metadata || {},
        };
        setToasts((prev) => [toast, ...prev]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t._id !== n._id));
        }, 4000);
      }
    });
  }, [notifications, toasts]);

  if (!user) return null;

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead([notification._id]);
    switch (notification.type) {
      case "like_post":
      case "comment_post":
        window.location.href = `/post/${notification.post}`;
        break;
      case "new_message":
        if (notification.metadata?.chatId)
          window.location.href = `/chat?chatId=${notification.metadata.chatId}`;
        break;
      case "new_follower":
        window.location.href = `/profile/${notification.sender?._id}`;
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  const getText = (notification) => {
    const senderName = notification.sender?.username || "Alguien";
    switch (notification.type) {
      case "like_post":
        return `${senderName} le dio like a tu publicación`;
      case "comment_post":
        return `${senderName} comentó en tu publicación`;
      case "new_message":
        return `${senderName} te envió un mensaje`;
      case "new_follower":
        return `${senderName} empezó a seguirte`;
      default:
        return "Nueva notificación";
    }
  };

  return (
    <>
      <div className="relative">
        {/* Botón de campana */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative text-2xl transition-transform duration-300 ${
            animateBell ? "rotate-[-15deg]" : "rotate-0"
          }`}
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown de notificaciones */}
        {isOpen && (
          <div className="absolute top-10 right-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md transition-all"
                >
                  Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No hay notificaciones
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer ${
                      notification.isRead
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    } hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}
                  >
                    <div
                      className={`text-sm ${
                        notification.isRead
                          ? "font-normal text-gray-700 dark:text-gray-300"
                          : "font-semibold text-gray-900 dark:text-white"
                      }`}
                    >
                      {getText(notification)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toasts flotantes */}
      <div className="fixed top-5 right-5 z-[2000] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast._id}
            onClick={() => {
              handleNotificationClick(toast);
              setToasts((prev) => prev.filter((t) => t._id !== toast._id));
            }}
            className={`bg-white dark:bg-gray-800 px-4 py-3 rounded-lg shadow-xl cursor-pointer border-l-4 text-sm font-medium hover:scale-[1.02] transition-transform duration-150 ${
              toast.type === "new_message"
                ? "border-blue-500"
                : toast.type === "like_post"
                ? "border-pink-500"
                : toast.type === "comment_post"
                ? "border-green-500"
                : toast.type === "new_follower"
                ? "border-orange-500"
                : "border-gray-400"
            }`}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </>
  );
}
