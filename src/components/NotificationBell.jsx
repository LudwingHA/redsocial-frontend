import React, { useState } from 'react';
import { useNotifications } from '../pages/minired-frontend-pages';
import { useAuth } from '../auth/context/AuthContext';

export function NotificationBell() { // Quitar el parámetro user
  const { user } = useAuth(); // Obtener user del contexto
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useNotifications(); // Quitar el parámetro user

  // Si no hay usuario, no mostrar nada
  if (!user) return null;

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead([notification._id]);
    }

    // Navegar según el tipo de notificación
    if (notification.type === 'like_post' || notification.type === 'comment_post') {
      window.location.href = `/post/${notification.post}`;
    } else if (notification.type === 'new_message' && notification.metadata?.chatId) {
      window.location.href = `/chat?chatId=${notification.metadata.chatId}`;
    }
    
    setIsOpen(false);
  };

  const getNotificationText = (notification) => {
    const senderName = notification.sender?.username || 'Alguien';
    
    switch (notification.type) {
      case 'like_post':
        return `${senderName} le dio like a tu publicación`;
      case 'comment_post':
        return `${senderName} comentó: "${notification.comment || 'tu publicación'}"`;
      case 'new_message':
        return `${senderName} te envió un mensaje`;
      default:
        return 'Nueva notificación';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '40px',
          right: '0',
          width: '350px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0 }}>Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Marcar todas
              </button>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No hay notificaciones
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '12px 15px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    background: notification.isRead ? 'white' : '#f8f9fa',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.background = notification.isRead ? 'white' : '#f8f9fa'}
                >
                  <div style={{ 
                    fontWeight: notification.isRead ? 'normal' : 'bold',
                    fontSize: '14px'
                  }}>
                    {getNotificationText(notification)}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#999', 
                    marginTop: '5px' 
                  }}>
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}