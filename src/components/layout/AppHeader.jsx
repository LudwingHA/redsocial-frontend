import React from 'react';
import { FiLogOut, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { useSocket } from '../../auth/context/SocketContext';
import { NotificationBell } from '../Notification/NotificationBell';

export function AppHeader() {
  const { user, logout } = useAuth();
  const { isConnected, connectionStatus } = useSocket();

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return { text: 'Conectado', icon: <FiWifi className="text-green-500" />, color: 'text-green-600' };
      case 'reconnecting':
        return { text: 'Reconectando...', icon: <FiWifi className="text-yellow-500" />, color: 'text-yellow-600' };
      case 'error':
        return { text: 'Error', icon: <FiWifiOff className="text-red-500" />, color: 'text-red-600' };
      default:
        return { text: 'Desconectado', icon: <FiWifiOff className="text-gray-500" />, color: 'text-gray-600' };
    }
  };

  const status = getConnectionStatus();

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">MiRedSocial</h1>
        
        <div className="flex items-center gap-4">
          <NotificationBell />
          
          <div className="flex items-center gap-2">
            {status.icon}
            <span className={`text-sm ${status.color}`}>{status.text}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-gray-700">Hola, {user.username}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <FiLogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}