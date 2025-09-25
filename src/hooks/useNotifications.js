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
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
      const data = await notificationAPI.markAllAsRead();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        if (socket && isConnected && unreadIds.length > 0) {
          socket.emit("markNotificationsRead", unreadIds);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => {
      if (prev.some(n => n._id === notification._id)) return prev;
      return [notification, ...prev];
    });
    setUnreadCount(prev => prev + 1);
  };

  useEffect(() => {
    if (!user || !socket || !isConnected) return;

    socket.emit("joinUserRoom", user._id);

    const handleNewNotification = (notification) => {
      addNotification(notification);
      console.log("🔔 Nueva notificación:", notification);
    };

    const handleUnreadCountUpdated = ({ unreadCount }) => setUnreadCount(unreadCount);

    socket.on("newNotification", handleNewNotification);
    socket.on("unreadCountUpdated", handleUnreadCountUpdated);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("unreadCountUpdated", handleUnreadCountUpdated);
    };
  }, [user, socket, isConnected]);

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
