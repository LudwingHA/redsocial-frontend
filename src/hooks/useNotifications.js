import { useState, useEffect, useCallback } from 'react';

export const useNotifications = (user) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar notificaciones
  const loadNotifications = useCallback(async (page = 1) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const res = await fetch(`/api/notifications?page=${page}&limit=20`);
      const data = await res.json();
      
      if (data.success) {
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Marcar como leídas
  const markAsRead = async (notificationIds) => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });
      
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n
          )
        );
        
        // Emitir por socket
        if (window.socket) {
          window.socket.emit('markNotificationsRead', notificationIds);
        }
      }
    } catch (error) {
      console.error('Error marcando como leído:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      });
      
      const data = await res.json();
      if (data.success) {
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        
        // Emitir por socket
        if (window.socket) {
          const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
          window.socket.emit('markNotificationsRead', unreadIds);
        }
      }
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!user || !window.socket) return;

    const socket = window.socket;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Mostrar toast si está disponible
      if (window.showNotificationToast) {
        window.showNotificationToast(notification);
      }
    };

    const handleUnreadCountUpdated = ({ unreadCount }) => {
      setUnreadCount(unreadCount);
    };

    socket.on('newNotification', handleNewNotification);
    socket.on('unreadCountUpdated', handleUnreadCountUpdated);

    // Unirse a la sala de notificaciones
    socket.emit('joinNotifications');

    return () => {
      socket.off('newNotification', handleNewNotification);
      socket.off('unreadCountUpdated', handleUnreadCountUpdated);
    };
  }, [user]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead
  };
};