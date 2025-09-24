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
  <header className="bg-gradient-to-r from-white to-blue-200 shadow-xl border-b border-blue-500/30 px-8 py-5">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-purple-600 drop-shadow-lg">MiRedSocial</h1>
      
      <div className="flex items-center gap-6"> 
        <NotificationBell />
        
        <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/30">
          {status.icon}
          <span className={`text-sm font-medium text-white drop-shadow-sm ${status.color.replace('text-', 'text-zinc-950 ')}`}>
            {status.text}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-purple-600/90 font-black drop-shadow-sm">Hola, {user.username}</span>
          <button
            onClick={logout}
            className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FiLogOut size={18} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);
}