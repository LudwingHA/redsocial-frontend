import React from 'react';
import { FiWifi, FiWifiOff, FiVideo, FiPhone, FiMoreVertical } from 'react-icons/fi';

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
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={`http://localhost:5000${user.avatar}`}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{user.username}</h3>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <FiWifi size={14} className="text-green-500" />
              ) : (
                <FiWifiOff size={14} className="text-gray-400" />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                {isConnected ? 'En línea' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
            <FiVideo size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:text-blue-500 transition-colors">
            <FiPhone size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}