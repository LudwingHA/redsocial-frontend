import React, { useEffect, useRef } from 'react';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';

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
    <div className="h-full overflow-y-auto p-4 space-y-1">
      {messages.map((message, index) => {
        const isOwn = message.sender._id === currentUser._id;
        const isConsecutive = isConsecutiveMessage(message, messages[index - 1]);
        const showAvatar = !isOwn && !isConsecutive;

        return (
          <div
            key={message._id}
            className={`flex items-end space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            {/* Avatar del remitente (solo para mensajes de otros) */}
            {showAvatar && (
              <img
                src={`http://localhost:5000${message.sender.avatar}`}
                alt={message.sender.username}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            )}
            
            {/* Espacio para alinear cuando no hay avatar */}
            {!isOwn && !showAvatar && <div className="w-6" />}

            {/* Mensaje */}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                isOwn
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              } ${message.isSending ? 'opacity-70' : ''}`}
            >
              {/* Nombre del remitente (solo primer mensaje de la secuencia) */}
              {!isOwn && showAvatar && (
                <p className="text-xs font-semibold mb-1">{message.sender.username}</p>
              )}
              
              <p className="break-words">{message.content}</p>
              
              {/* Timestamp y estado */}
              <div className={`flex items-center space-x-1 mt-1 text-xs ${
                isOwn ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span>{formatMessageTime(message.timestamp)}</span>
                {isOwn && (
                  message.isSending ? (
                    <FiCheck size={12} />
                  ) : (
                    <FiCheckCircle size={12} className="text-green-300" />
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Indicador de typing */}
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-2 text-gray-500 italic">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm">Escribiendo...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}