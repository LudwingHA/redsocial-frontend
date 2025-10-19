import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import { 
  FiHeart, 
  FiMessageCircle, 
  FiUserPlus, 
  FiMessageSquare,
  FiCheck,
  FiBell
} from "react-icons/fi";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  const dropdownRef = useRef(null);

  // Animación del icono cuando hay notificaciones nuevas
  useEffect(() => {
    if (unreadCount > 0) {
      setAnimateBell(true);
      const timeout = setTimeout(() => setAnimateBell(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [unreadCount]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead([notification._id]);
    }
    setIsOpen(false);
    
    // Navegación basada en el tipo de notificación
    switch (notification.type) {
      case "like_post":
      case "comment_post":
        window.location.href = `/post/${notification.post}`;
        break;
      case "new_message":
        if (notification.metadata?.chatId) {
          window.location.href = `/chat?chatId=${notification.metadata.chatId}`;
        }
        break;
      case "new_follower":
        window.location.href = `/profile/${notification.sender?._id}`;
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "like_post":
        return <FiHeart className={`${iconClass} text-red-500`} />;
      case "comment_post":
        return <FiMessageCircle className={`${iconClass} text-blue-500`} />;
      case "new_message":
        return <FiMessageSquare className={`${iconClass} text-green-500`} />;
      case "new_follower":
        return <FiUserPlus className={`${iconClass} text-purple-500`} />;
      default:
        return <FiBell className={`${iconClass} text-gray-500`} />;
    }
  };

  const getNotificationText = (notification) => {
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

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };
// NotificationBell.jsx - RETURN Mejorado
return (
  <>
    {/* Botón de notificaciones */}
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-full transition-all duration-300 transform ${
          isOpen 
            ? "bg-gray-100/70 dark:bg-gray-800/70 text-black dark:text-white scale-105" 
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-pink-400"
        }`}
        title="Ver notificaciones"
      >
        <FiBell 
          size={22} 
          className={`transition-transform duration-300 ${
            animateBell ? "animate-wiggle text-red-500" : ""
          }`}
        />
        
        {/* Badge de notificaciones no leídas */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md transform scale-90">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones (Usando Portal para mantenerlo visible y sobre todo) */}
      {isOpen && ReactDOM.createPortal(
        <div 
          className="fixed right-4 lg:right-6 w-80 max-w-xs md:max-w-sm bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700/70 rounded-2xl shadow-2xl overflow-hidden z-[1000] animate-in fade-in slide-in-from-top-4 duration-300 top-[60px] lg:top-[70px]"
          // Se usa top fijo para que aparezca debajo de la barra de navegación o sidebar
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-extrabold text-xl text-gray-900 dark:text-gray-100">
              Actividad
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-semibold text-purple-600 dark:text-pink-400 hover:text-purple-700 dark:hover:text-pink-300 transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <FiBell className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Estás al día.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Revisa pronto para no perderte nada.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-center gap-3 px-5 py-3 border-b border-gray-100/80 dark:border-gray-800/80 cursor-pointer transition-all duration-200 ${
                    notification.isRead
                      ? "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                      : "bg-purple-50/70 dark:bg-purple-900/10 text-gray-900 dark:text-white font-medium shadow-inner" // Destaca las no leídas
                  } hover:bg-gray-50 dark:hover:bg-gray-800/60`}
                >
                  {/* Icono */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      {getNotificationText(notification)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        {formatTime(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                  </div>

                  {/* Avatar del remitente */}
                  {notification.sender?.avatar ? (
                    <img
                      src={notification.sender.avatar}
                      alt={notification.sender.username}
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold uppercase">
                        {notification.sender?.username?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>

    {/* Estilo para la animación de la campana (Agregado para el efecto 'wiggle') */}
    <style jsx>{`
      @keyframes wiggle {
        0%, 7% {
          transform: rotateZ(0);
        }
        15% {
          transform: rotateZ(-15deg);
        }
        25% {
          transform: rotateZ(15deg);
        }
        35% {
          transform: rotateZ(-10deg);
        }
        45% {
          transform: rotateZ(10deg);
        }
        50% {
          transform: rotateZ(0);
        }
      }
      .animate-wiggle {
        animation: wiggle 0.6s ease-in-out;
      }
    `}</style>
  </>
);
}