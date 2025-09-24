import React from 'react';
import { FiCheck, FiTrash2, FiBellOff } from 'react-icons/fi';
import { useNotifications } from '../../hooks/useNotifications';


export function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    loadNotifications
  } = useNotifications();

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return { icon: '❤️', color: 'text-red-500' };
      case 'comment':
        return { icon: '💬', color: 'text-blue-500' };
      case 'follow':
        return { icon: '👤', color: 'text-green-500' };
      default:
        return { icon: '🔔', color: 'text-yellow-500' };
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notificaciones</h2>
          <p className="text-gray-600">
            {unreadCount > 0 
              ? `${unreadCount} sin leer` 
              : 'Todas las notificaciones leídas'
            }
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiCheck size={18} />
            <span>Marcar todas como leídas</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <FiBellOff size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-500">
              Las notificaciones aparecerán aquí cuando tengas actividad nueva.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const { icon, color } = getNotificationIcon(notification.type);
              
              return (
                <div
                  key={notification._id}
                  className={`p-6 transition-colors ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50'
                  } hover:bg-gray-50`}
                >
                  <div className="flex items-start space-x-4">
                    <span className={`text-2xl ${color}`}>{icon}</span>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default NotificationsPage