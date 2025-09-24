import React from 'react';
import { FiMessageSquare, FiClock } from 'react-icons/fi';
import { URL_SERVER } from '../../api/url';

export function ChatSidebar({ chats, activeChat, onChatSelect, currentUser, loading }) {
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = (now - date) / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return 'Sin mensajes';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <FiMessageSquare size={48} className="mb-4 text-gray-300" />
        <p className="text-center">No tienes chats activos</p>
        <p className="text-sm text-center mt-2">Busca usuarios para comenzar una conversación</p>
      </div>
    );
  }

return (
  <div className="divide-y divide-gray-100/50">
    {chats.map((chat) => {
      const otherUser = chat.participants.find(p => p._id !== currentUser._id);
      const isActive = activeChat?._id === chat._id;

      return (
        <div
          key={chat._id}
          onClick={() => onChatSelect(chat)}
          className={`p-4 cursor-pointer transition-all duration-300 ${
            isActive
              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-r-4 border-blue-500'
              : 'hover:bg-gray-50/80'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={`${URL_SERVER}${otherUser?.avatar}`}
                alt={otherUser?.username}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 truncate text-lg">
                  {otherUser?.username || 'Usuario'}
                </h3>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500 flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                    <FiClock size={12} />
                    <span className="font-medium">{formatLastMessageTime(chat.lastMessage)}</span>
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 truncate leading-relaxed">
                {truncateText(chat.lastMessageContent)}
              </p>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
}