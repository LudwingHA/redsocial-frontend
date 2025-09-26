import React from 'react';
import { FiLogOut, FiWifi, FiWifiOff } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { useSocket } from '../../auth/context/SocketContext';
import { NotificationBell } from '../Notification/NotificationBell';
import ThemeToggle from '../ThemeToggle';

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
  <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-gray-700/60 px-6 py-4 transition-all duration-300 shadow-sm">
    <div className="flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          MiRedSocial
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-200/50 dark:border-gray-600/50 transition-all duration-300 hover:shadow-sm">
          {status.icon}
          <span className={`text-sm font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
        </div>
        
        <div className="flex items-center gap-4 pl-4 border-l border-slate-200/50 dark:border-gray-600/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold uppercase">
                {user.username?.charAt(0)}
              </span>
            </div>
            <span className="text-slate-700 dark:text-slate-300 font-medium hidden sm:block">
              Hola, {user.username}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-slate-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-4 py-2 rounded-lg transition-all duration-300 border border-slate-200/60 dark:border-gray-600/60 hover:border-rose-200 dark:hover:border-rose-700/30"
          >
            <FiLogOut size={18} />
            <span className="font-medium hidden md:block">Salir</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);
}