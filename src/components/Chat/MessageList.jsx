import React, { useEffect, useRef } from "react";
import { URL_SERVER } from '../../api/url';

export function MessageList({ messages = [], currentUser, typingUsers = [], activeChat }) {
  const messagesEndRef = useRef(null);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {messages.map((message, index) => {
        const isOwn = message.sender?._id === currentUser?._id;
        const sender = message.sender || { username: "Usuario", avatar: null };
        const avatarUrl = sender.avatar ? `${URL_SERVER}${sender.avatar}` : "/default-avatar.png";

        // Mostrar avatar solo si es diferente al anterior
        const prevMessage = messages[index - 1];
        const showAvatar = !prevMessage || prevMessage.sender?._id !== sender._id;

        return (
          <div key={message._id || index} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
            {!isOwn && showAvatar ? (
              <img
                src={avatarUrl}
                alt={sender.username}
                onError={(e) => { e.target.src = "/default-avatar.png"; }}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-md"
              />
            ) : (
              !isOwn && <div className="w-10" /> 
            )}

            <div className={`px-4 py-2 rounded-2xl shadow-md max-w-[75%] break-words ${isOwn ? "bg-blue-500 text-white rounded-br-none" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"}`}>
              <p>{message.content}</p>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        );
      })}

      {/* Indicador de escritura */}
      {typingUsers.length > 0 && activeChat && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          <span>
            {activeChat.participants
              .filter((p) => typingUsers.includes(p._id))
              .map((p) => p.username)
              .join(", ") || "Alguien"} está escribiendo...
          </span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
