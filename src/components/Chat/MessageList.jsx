import React from "react";
import { URL_SERVER } from '../../api/url';

export function MessageList({ messages = [], currentUser, typingUsers = [], activeChat }) {
  return (
    <div className="min-h-full p-3 lg:p-4 space-y-2 lg:space-y-3 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {messages.map((message, index) => {
        const isOwn = message.sender?._id === currentUser?._id;
        const sender = message.sender || { username: "Usuario", avatar: null };
        const avatarUrl = sender.avatar ? `${URL_SERVER}${sender.avatar}` : "/default-avatar.png";

        const prevMessage = messages[index - 1];
        const showAvatar = !prevMessage || prevMessage.sender?._id !== sender._id;

        return (
          <div key={message._id || index} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
            {!isOwn && showAvatar ? (
              <img
                src={avatarUrl}
                alt={sender.username}
                onError={(e) => { e.target.src = "/default-avatar.png"; }}
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-md"
              />
            ) : (
              !isOwn && <div className="w-8 lg:w-10" /> 
            )}

            <div className={`px-3 py-2 lg:px-4 lg:py-2 rounded-2xl shadow-md max-w-[85%] lg:max-w-[75%] break-words ${
              isOwn ? "bg-blue-500 text-white rounded-br-none" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
            }`}>
              <p className="text-sm lg:text-base">{message.content}</p>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        );
      })}

      {typingUsers.length > 0 && activeChat && (
        <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500 dark:text-gray-400 animate-pulse px-3 lg:px-4 py-2">
          <span>
            {activeChat.participants
              .filter((p) => typingUsers.includes(p._id))
              .map((p) => p.username)
              .join(", ") || "Alguien"} está escribiendo...
          </span>
        </div>
      )}
    </div>
  );
}