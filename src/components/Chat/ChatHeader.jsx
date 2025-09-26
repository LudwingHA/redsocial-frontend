import React from 'react';
import { FiWifi, FiWifiOff, FiVideo, FiPhone, FiMoreVertical, FiMenu, FiX } from 'react-icons/fi';
import { URL_SERVER } from '../../api/url';
import { useSocket } from '../../auth/context/SocketContext';

export function ChatHeader({ user, isConnected, onMenuToggle, sidebarOpen }) {
  const { onlineUsers = [] } = useSocket();
  const isOnline = user._id ? onlineUsers.some(id => id?.toString() === user._id?.toString()) : false;
  
  if (!user) {
    return (
      <div className="border-b border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FiMenu size={20} />
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Selecciona un chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comienza una conversación</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 p-4 lg:p-6 shadow-lg transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg bg-white/20 dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-700/40 transition-colors"
          >
            {sidebarOpen ? <FiX size={20} className="text-white" /> : <FiMenu size={20} className="text-white" />}
          </button>
          
          <div className="relative">
            <img
              src={`${URL_SERVER}${user.avatar}`}
              alt={user.username}
              className="w-10 h-10 lg:w-14 lg:h-14 rounded-full object-cover border-3 lg:border-4 border-white/30 dark:border-gray-800/30 shadow-lg"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 lg:border-3 border-white dark:border-gray-800 ${
                isOnline ? 'bg-green-400' : 'bg-gray-400'
              } shadow-md`}
            />
          </div>
          
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-white dark:text-gray-100 truncate max-w-[150px] lg:max-w-none">
              {user.username}
            </h3>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <FiWifi size={14} className="text-green-300 dark:text-green-400" />
              ) : (
                <FiWifiOff size={14} className="text-gray-300 dark:text-gray-400" />
              )}
              <span className={`text-xs lg:text-sm font-medium ${isOnline ? 'text-green-200 dark:text-green-300' : 'text-gray-300 dark:text-gray-400'}`}>
                {isOnline ? 'En línea' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-3">
          <button className="p-2 lg:p-3 bg-white/20 dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-700/40 text-white rounded-lg lg:rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-gray-600/30">
            <FiVideo size={18} className="lg:w-5 lg:h-5" />
          </button>
          <button className="p-2 lg:p-3 bg-white/20 dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-700/40 text-white rounded-lg lg:rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-gray-600/30">
            <FiPhone size={18} className="lg:w-5 lg:h-5" />
          </button>
          <button className="p-2 lg:p-3 bg-white/20 dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-700/40 text-white rounded-lg lg:rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-gray-600/30">
            <FiMoreVertical size={18} className="lg:w-5 lg:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}