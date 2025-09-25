import React, { useState, useEffect } from 'react';

import { useAuth } from '../../auth/context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

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
      if (!toasts.find(t => t._id === n._id)) {
        const toast = {
          _id: n._id,
          type: n.type,
          text: getText(n),
          metadata: n.metadata || {}
        };
        setToasts(prev => [toast, ...prev]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t._id !== n._id));
        }, 4000);
      }
    });
  }, [notifications, toasts]);

  if (!user) return null;

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead([notification._id]);
    switch (notification.type) {
      case 'like_post':
      case 'comment_post':
        window.location.href = `/post/${notification.post}`;
        break;
      case 'new_message':
        if (notification.metadata?.chatId) window.location.href = `/chat?chatId=${notification.metadata.chatId}`;
        break;
      case 'new_follower':
        window.location.href = `/profile/${notification.sender?._id}`;
        break;
      default:
        break;
    }
    setIsOpen(false);
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

  return (
    <>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            transform: animateBell ? 'rotate(-15deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
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
              {notifications.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No hay notificaciones
                </div>
              )}
              {notifications.map(notification => (
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
                  <div style={{ fontWeight: notification.isRead ? 'normal' : 'bold', fontSize: '14px' }}>
                    {getText(notification)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toasts */}
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
            }}
            onClick={() => {
              handleNotificationClick(toast);
              setToasts(prev => prev.filter(t => t._id !== toast._id));
            }}
          >
            {toast.text}
          </div>
        ))}
      </div>
    </>
  );
}
