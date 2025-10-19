import React, { useState, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../auth/context/AuthContext";
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

    // Solo mostrar las 3 notificaciones más recientes que no hayan sido mostradas
    const newNotifications = notifications
      .filter(n => !toasts.find(t => t._id === n._id))
      .slice(0, 3);

    newNotifications.forEach((n) => {
      const toast = {
        _id: n._id,
        type: n.type,
        text: getText(n),
        timestamp: Date.now(),
        icon: getIcon(n.type),
        color: getColor(n.type),
        avatar: n.sender?.avatar,
        username: n.sender?.username
      };
      
      setToasts(prev => [toast, ...prev.slice(0, 2)]); // Máximo 3 toasts

      // Remover automáticamente después de 4 segundos
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t._id !== n._id));
      }, 4000);
    });
  }, [notifications, user]);

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

  if (toasts.length === 0) return null;
// NotificationToast.jsx - RETURN Mejorado
return (
  <div className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-[2000] flex flex-col-reverse gap-3 max-w-xs sm:max-w-sm pointer-events-none">
    {toasts.map((toast, index) => (
      <div
        key={toast._id}
        // Cambio a bottom-4 y flex-col-reverse para que los nuevos toasts aparezcan arriba
        className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-gray-200/70 dark:border-gray-700/70 w-full transform transition-all duration-500 pointer-events-auto animate-in fade-in slide-in-from-right-8"
        // Asegura que los toasts se apilen y se muestren con retraso si hay varios a la vez
        style={{ animationDelay: `${index * 100}ms` }} 
      >
        {/* Barra de progreso visual (se quita el botón X y se usa solo el tiempo) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200/50 dark:bg-gray-700/50 rounded-t-xl overflow-hidden">
          <div 
            className={`h-full ${toast.color} transition-all duration-4000 ease-linear`}
            style={{ 
              animation: 'progress 4s linear forwards',
            }}
          />
        </div>

        {/* Contenido principal del toast */}
        <div className="flex items-center gap-3 pt-1">
          {/* Avatar del remitente */}
          {toast.avatar ? (
            <img
              src={toast.avatar}
              alt={toast.username}
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold uppercase">
                {toast.username?.charAt(0) || 'U'}
              </span>
            </div>
          )}

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              {toast.text}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
              Notificación recibida
            </span>
          </div>

          {/* Icono de tipo */}
          <div className={`p-2 rounded-full ${toast.color} text-white flex-shrink-0 shadow-md`}>
            {toast.icon}
          </div>
        </div>

        {/* Botón de cierre discreto, movido para no interferir con la animación */}
        <button
          onClick={() => removeToast(toast._id)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-full transition-colors pointer-events-auto"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    ))}

    <style jsx>{`
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `}</style>
  </div>
);
}