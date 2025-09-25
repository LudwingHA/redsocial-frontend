import React, { useState, useEffect } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../auth/context/AuthContext";


export function NotificationToast() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Solo mostrar las últimas notificaciones no leídas en tiempo real
    const newNotifications = notifications.slice(0, 3); // O cambiar a slice(0, 3) para multiples
    newNotifications.forEach((n) => {
      if (!toasts.find(t => t._id === n._id)) {
        const toast = {
          _id: n._id,
          type: n.type,
          text: getText(n),
          timestamp: Date.now()
        };
        setToasts(prev => [toast, ...prev]);

        // Auto eliminar después de 4s
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t._id !== n._id));
        }, 2000);
      }
    });
  }, [notifications, user, toasts]);

  const getText = (notification) => {
    const senderName = notification.sender?.username || 'Alguien';
    switch (notification.type) {
      case 'like_post':
        return `${senderName} le dio like a tu publicación`;
      case 'comment_post':
        return `${senderName} comentó en tu publicación`;
      case 'new_message':
        return `${senderName} te envió un mensaje`;
      case 'new_follower':
        return `${senderName} empezó a seguirte`;
      default:
        return 'Nueva notificación';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {toasts.map(toast => (
        <div
          key={toast._id}
          style={{
            background: '#fff',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderLeft: toast.type === 'new_message' ? '4px solid #007bff' :
                    toast.type === 'like_post' ? '4px solid #ff4081' :
                    toast.type === 'comment_post' ? '4px solid #00c853' :
                    toast.type === 'new_follower' ? '4px solid #ff9800' : '4px solid #333',
            fontSize: '14px',
            fontWeight: 500,
            opacity: 0.95,
            cursor: 'pointer',
            transition: 'transform 0.3s, opacity 0.3s'
          }}
          onClick={() => {
            // Opcional: redirigir según tipo
            if (toast.type === 'new_message' && notification.metadata?.chatId) {
              window.location.href = `/chat?chatId=${notification.metadata.chatId}`;
            } else if (toast.type === 'like_post' || toast.type === 'comment_post') {
              window.location.href = `/post/${notification.post}`;
            }
            setToasts(prev => prev.filter(t => t._id !== toast._id));
          }}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
