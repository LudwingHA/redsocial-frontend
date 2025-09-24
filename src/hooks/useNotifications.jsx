import { useEffect, useState } from "react";
import { useAuth } from "../auth/context/AuthContext";
import { useSocket } from "../auth/context/SocketContext";
import { notificationAPI } from "../api/api";

export function useNotifications() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async (page = 1) => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await notificationAPI.getNotifications(page);
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (ids) => {
    if (!user || !ids.length) return;
    try {
      const data = await notificationAPI.markAsRead(ids);
      if (data.success) {
        setNotifications(prev =>
          prev.map(n => (ids.includes(n._id) ? { ...n, isRead: true } : n))
        );
        setUnreadCount(data.unreadCount || 0);

        if (socket && isConnected) {
          socket.emit("markNotificationsRead", ids);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const data = await notificationAPI.markAllAsRead();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        if (socket && isConnected) {
          const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
          if (unreadIds.length > 0) socket.emit("markNotificationsRead", unreadIds);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Listener de socket
  useEffect(() => {
    if (!user || !socket || !isConnected) return;

    // 🔌 Unirse a la sala personal
    socket.emit("joinUserRoom", user._id);

    // 🔔 Manejo de posts y comentarios (ya lo tenías como "newNotification")
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      console.log("🔔 Nueva notificación:", notification);
    };

    const handleUnreadCountUpdated = ({ unreadCount }) => setUnreadCount(unreadCount);

    // 📩 Manejo de mensajes privados
    const handleNewMessageNotification = (notification) => {
      // Evitar notificación si el emisor es el mismo usuario
      if (notification.senderId === user._id) return;

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      console.log("📩 Nuevo mensaje privado:", notification);
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("unreadCountUpdated", handleUnreadCountUpdated);
    socket.on("new_message_notification", handleNewMessageNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("unreadCountUpdated", handleUnreadCountUpdated);
      socket.off("new_message_notification", handleNewMessageNotification);
    };
  }, [user, socket, isConnected]);

  // Carga inicial de notificaciones
  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
}
