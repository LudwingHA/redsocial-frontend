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
  <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 shadow-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={`http://localhost:5000${user.avatar}`}
            alt={user.username}
            className="w-14 h-14 rounded-full object-cover border-4 border-white/30 shadow-lg"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white ${
              isConnected ? 'bg-green-400' : 'bg-gray-400'
            } shadow-md`}
          />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-white">{user.username}</h3>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <FiWifi size={16} className="text-green-300" />
            ) : (
              <FiWifiOff size={16} className="text-gray-300" />
            )}
            <span className={`text-sm font-medium ${isConnected ? 'text-green-200' : 'text-gray-300'}`}>
              {isConnected ? 'En línea' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20">
          <FiVideo size={22} />
        </button>
        <button className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20">
          <FiPhone size={22} />
        </button>
        <button className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20">
          <FiMoreVertical size={22} />
        </button>
      </div>
    </div>
  </div>
);
}