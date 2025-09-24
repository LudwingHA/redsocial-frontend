import React, { useEffect, useRef } from 'react';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';
import { URL_SERVER } from '../../api/url';

export function MessageList({ messages, currentUser, typingUsers }) {
  const messagesEndRef = useRef(null);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isConsecutiveMessage = (currentMsg, previousMsg) => {
    if (!previousMsg) return false;
    return currentMsg.sender._id === previousMsg.sender._id;
  };
return (
  <div className="h-full overflow-y-auto p-6 space-y-3 bg-gradient-to-b from-transparent to-blue-50/20">
    {messages.map((message, index) => {
      const isOwn = message.sender._id === currentUser._id;
      const isConsecutive = isConsecutiveMessage(message, messages[index - 1]);
      const showAvatar = !isOwn && !isConsecutive;

      return (
        <div
          key={message._id}
          className={`flex items-end space-x-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
        >
          {/* Avatar del remitente (solo para mensajes de otros) */}
          {showAvatar && (
            <img
              src={`${URL_SERVER}${message.sender.avatar}`}
              alt={message.sender.username}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md"
            />
          )}
          
          {/* Espacio para alinear cuando no hay avatar */}
          {!isOwn && !showAvatar && <div className="w-10" />}

          {/* Mensaje */}
          <div
            className={`max-w-md px-5 py-3 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-bl-none border border-gray-200/50'
            } ${message.isSending ? 'opacity-70' : ''} transition-all duration-300`}
          >
            {/* Nombre del remitente (solo primer mensaje de la secuencia) */}
            {!isOwn && showAvatar && (
              <p className="text-xs font-bold mb-2 text-gray-600">{message.sender.username}</p>
            )}
            
            <p className="break-words leading-relaxed">{message.content}</p>
            
            {/* Timestamp y estado */}
            <div className={`flex items-center space-x-2 mt-2 text-xs ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}>
              <span className="font-medium">{formatMessageTime(message.timestamp)}</span>
              {isOwn && (
                message.isSending ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                    <FiCheck size={12} />
                  </div>
                ) : (
                  <FiCheckCircle size={14} className="text-green-300" />
                )
              )}
            </div>
          </div>
        </div>
      );
    })}

    {/* Indicador de typing */}
    {typingUsers.length > 0 && (
      <div className="flex items-center space-x-3 text-gray-500 italic bg-white/50 rounded-2xl p-4 mx-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm font-medium">Escribiendo...</span>
      </div>
    )}

    <div ref={messagesEndRef} />
  </div>
);
}