import React from 'react';
import { FiWifi, FiWifiOff, FiVideo, FiPhone, FiMoreVertical, FiMenu, FiX } from 'react-icons/fi';
import { URL_FRONTEND, URL_SERVER } from '../../api/url';
import { useSocket } from '../../auth/context/SocketContext';
import { Link } from 'react-router-dom';

export function ChatHeader({ user, isConnected, onMenuToggle, sidebarOpen }) {
  const { onlineUsers = [] } = useSocket();
  const isOnline = user._id ? onlineUsers.some(id => id?.toString() === user._id?.toString()) : false;
// ChatHeader.jsx - RETURN Mejorado

if (!user) {
  // Estado inicial cuando no hay chat seleccionado
  return (
    <div className="p-4 lg:p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FiMenu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Mensajes Directos</h3>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-4 lg:p-4 shadow-xl border-b border-white/20 dark:border-black/20 z-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 lg:space-x-4">
        
        {/* Botón Menú (Toggle Sidebar en Móvil) */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          {sidebarOpen ? <FiX size={20} className="text-white" /> : <FiMenu size={20} className="text-white" />}
        </button>
        
        {/* Avatar y Estado */}
        <div className="relative flex-shrink-0">
          <Link to={`/profile/${user._id}`}> 
            <img
              src={user.avatar ? `${URL_SERVER}${user.avatar}` : "/default-avatar.png"}
              alt={user.username}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white shadow-lg"
            />
          </Link>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${
              isOnline ? 'bg-green-400' : 'bg-gray-400'
            } shadow`}
          />
        </div>
        
        {/* Nombre y Estado de Conexión */}
        <div className="min-w-0">
          <h3 className="text-lg lg:text-xl font-extrabold text-white truncate max-w-[150px] lg:max-w-none">
            {user.username}
          </h3>
          <div className="flex items-center space-x-1 mt-0.5">
            {isOnline ? (
              <FiWifi size={14} className="text-green-300" />
            ) : (
              <FiWifiOff size={14} className="text-gray-300" />
            )}
            <span className={`text-xs lg:text-sm font-medium ${isOnline ? 'text-green-200' : 'text-gray-300'}`}>
              {isOnline ? 'Activo' : 'Última vez: hace poco'}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de Acción (Video, Llamada, Opciones) */}
      <div className="flex items-center space-x-2 lg:space-x-3">
        <button 
          className="p-2 lg:p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all duration-300 backdrop-blur-sm"
          title="Llamada de Video"
        >
          <FiVideo size={20} />
        </button>
        <button 
          className="p-2 lg:p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all duration-300 backdrop-blur-sm"
          title="Llamada de Voz"
        >
          <FiPhone size={20} />
        </button>
        <button 
          className="p-2 lg:p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all duration-300 backdrop-blur-sm"
          title="Opciones"
        >
          <FiMoreVertical size={20} />
        </button>
      </div>
    </div>
  </div>
);
}