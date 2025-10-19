import React from 'react';
import { FiLogOut, FiWifi, FiWifiOff, FiSend } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { useSocket } from '../../auth/context/SocketContext';
import { NotificationBell } from '../Notification/NotificationBell';
import ThemeToggle from '../ThemeToggle';

export function AppHeader() {
  const { user, logout } = useAuth();
  const { connectionStatus } = useSocket();

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return { text: 'Conectado', icon: <FiWifi className="text-green-500" />, color: 'text-green-500' };
      case 'reconnecting':
        return { text: 'Reconectando...', icon: <FiWifi className="text-yellow-500 animate-pulse" />, color: 'text-yellow-500' };
      case 'error':
        return { text: 'Error', icon: <FiWifiOff className="text-red-500" />, color: 'text-red-500' };
      default:
        return { text: 'Desconectado', icon: <FiWifiOff className="text-gray-400" />, color: 'text-gray-400' };
    }
  };

  const status = getConnectionStatus();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-gray-700/80 px-4 py-3 transition-all duration-300 **shadow-sm**">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo Section - Simplificado y con tu gradiente de marca */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-lg">M</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent hidden sm:block">
            MiRedSocial
          </h1>
        </div>

        {/* Utilities & User Section - Más compacto */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Connection Status - Ahora solo visible como un icono en dispositivos pequeños */}
          <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-gray-800/70 px-2 py-1 rounded-full border border-slate-200/50 dark:border-gray-600/50 transition-all duration-300 hidden md:flex">
            {status.icon}
            <span className={`text-xs font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>

          {/* Iconos de Utilidad (Desktop) */}
          <div className="flex items-center gap-2 lg:gap-3">
            <ThemeToggle />
            
            {/* Mensajes Directos (Como en Instagram) - Oculto en Móvil si hay nav inferior */}
            <button 
              aria-label="Mensajes Directos"
              title="Mensajes Directos"
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-full transition-colors hidden md:block"
            >
                <FiSend size={20} />
            </button>
            
            {/* Notificaciones (Oculto en Móvil si hay nav inferior) */}
            <div className="hidden lg:block">
                <NotificationBell />
            </div>
            
          </div>

          {/* User Profile & Logout - Más discretos */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200/50 dark:border-gray-600/50">
            {/* Avatar del Usuario */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0 cursor-pointer" title={`Ver perfil de ${user.username}`}>
              <span className="text-white text-sm font-bold uppercase">
                {user.username?.charAt(0)}
              </span>
            </div>
            
            {/* Botón de Logout */}
            <button
              onClick={logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="p-2 flex items-center justify-center bg-transparent hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full transition-all duration-300"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}