import React, { useState, useEffect } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../auth/context/AuthContext";
import { 
  FiMessageSquare, 
  FiHeart, 
  FiUserPlus, 
  FiMessageCircle,
  FiX 
} from "react-icons/fi";

export function NotificationToast() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const newNotifications = notifications.slice(0, 3);
    newNotifications.forEach((n) => {
      if (!toasts.find(t => t._id === n._id)) {
        const toast = {
          _id: n._id,
          type: n.type,
          text: getText(n),
          timestamp: Date.now(),
          icon: getIcon(n.type),
          color: getColor(n.type)
        };
        setToasts(prev => [toast, ...prev]);

        setTimeout(() => {
          setToasts(prev => prev.filter(t => t._id !== n._id));
        }, 4000);
      }
    });
  }, [notifications, user, toasts]);

  const getIcon = (type) => {
    switch (type) {
      case 'like_post': return <FiHeart className="w-4 h-4" />;
      case 'comment_post': return <FiMessageCircle className="w-4 h-4" />;
      case 'new_message': return <FiMessageSquare className="w-4 h-4" />;
      case 'new_follower': return <FiUserPlus className="w-4 h-4" />;
      default: return <FiMessageSquare className="w-4 h-4" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'like_post': return 'bg-pink-500';
      case 'comment_post': return 'bg-green-500';
      case 'new_message': return 'bg-blue-500';
      case 'new_follower': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getText = (notification) => {
    const senderName = notification.sender?.username || 'Alguien';
    switch (notification.type) {
      case 'like_post': return `${senderName} le dio like a tu publicación`;
      case 'comment_post': return `${senderName} comentó en tu publicación`;
      case 'new_message': return `${senderName} te envió un mensaje`;
      case 'new_follower': return `${senderName} empezó a seguirte`;
      default: return 'Nueva notificación';
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t._id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-20 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast, index) => (
        <div
          key={toast._id}
          className="relative bg-white dark:bg-gray-800 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-white/20 dark:border-gray-700/50 transform transition-all duration-500 animate-in slide-in-from-right-10"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Barra de progreso */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden">
            <div 
              className={`h-full ${toast.color} transition-all duration-4000 ease-linear`}
              onAnimationEnd={() => removeToast(toast._id)}
            />
          </div>

          {/* Contenido */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${toast.color} text-white`}>
              {toast.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {toast.text}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Ahora mismo
              </span>
            </div>
            <button
              onClick={() => removeToast(toast._id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <FiX className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}