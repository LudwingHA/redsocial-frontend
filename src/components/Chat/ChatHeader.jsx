import React from 'react';
import { FiWifi, FiWifiOff, FiVideo, FiPhone, FiMoreVertical } from 'react-icons/fi';
import { URL_SERVER } from '../../api/url';

export function ChatHeader({ user, isConnected }) {
  if (!user) {
    return (
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Selecciona un chat</h3>
            <p className="text-sm text-gray-600">Comienza una conversación</p>
          </div>
        </div>
      </div>
    );
  }

return (
  <div className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 p-6 shadow-lg transition-colors duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={`${URL_SERVER}${user.avatar}`}
            alt={user.username}
            className="w-14 h-14 rounded-full object-cover border-4 border-white/30 dark:border-gray-800/30 shadow-lg"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white dark:border-gray-800 ${
              isConnected ? 'bg-green-400' : 'bg-gray-400'
            } shadow-md`}
          />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-white dark:text-gray-100">{user.username}</h3>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <FiWifi size={16} className="text-green-300 dark:text-green-400" />
            ) : (
              <FiWifiOff size={16} className="text-gray-300 dark:text-gray-400" />
            )}
            <span className={`text-sm font-medium ${isConnected ? 'text-green-200 dark:text-green-300' : 'text-gray-300 dark:text-gray-400'}`}>
              {isConnected ? 'En línea' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-3 bg-white/20 dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-700/40 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-gray-600/30">
          <FiVideo size={22} />
        </button>
        <button className="p-3 bg-white/20 dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-700/40 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-gray-600/30">
          <FiPhone size={22} />
        </button>
        <button className="p-3 bg-white/20 dark:bg-gray-800/30 hover:bg-white/30 dark:hover:bg-gray-700/40 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-gray-600/30">
          <FiMoreVertical size={22} />
        </button>
      </div>
    </div>
  </div>
);
}