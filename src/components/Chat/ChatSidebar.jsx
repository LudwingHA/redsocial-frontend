import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { URL_SERVER } from "../../api/url";

dayjs.extend(relativeTime);
dayjs.locale("es");

export function ChatSidebar({
  chats = [],
  currentUser,
  onlineUsers = [],
  onChatClick,
  activeChatId,
}) {
  const currentUserId = currentUser?._id || currentUser?.id;

// ChatSidebar.jsx - RETURN Mejorado

if (chats.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-950">
      <div className="text-5xl mb-4 text-gray-400 dark:text-gray-700">💬</div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
        Comienza a chatear
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Usa el buscador para encontrar un usuario y empezar una nueva conversación.
      </p>
    </div>
  );
}

return (
  <div className="w-full bg-white dark:bg-gray-950 flex flex-col h-[calc(100%-78px)] lg:h-[calc(100%-80px)]">
    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
      {chats.map((chat) => {
        const otherUser = chat.participants.find((p) => 
          (p._id !== currentUserId && p._id !== currentUserId?.toString()) || 
          ![currentUserId, (currentUserId?.toString())].includes(p._id)
        ) || {};

        const username = otherUser.username || "Usuario Desconocido";
        const avatar = otherUser.avatar ? URL_SERVER + otherUser.avatar : "/default-avatar.png";
        const isOnline = otherUser._id ? onlineUsers.some(id => id?.toString() === otherUser._id?.toString()) : false;

        const lastMsgText = chat.lastMessageContent || "";
        const lastMsgSender = chat.lastMessageSender || chat.lastMessageSender?._id || null;
        const isMine = lastMsgSender ? (lastMsgSender.toString() === currentUserId?.toString()) : false;

        const displayText = isMine
          ? lastMsgText.startsWith("Tú:") ? lastMsgText : `Tú: ${lastMsgText}`
          : lastMsgText;

        const lastMsgTime = chat.lastMessage ? dayjs(chat.lastMessage).fromNow() : "";
        const isSelected = activeChatId === chat._id;
        const unreadCount = chat.unreadCount || 0; // Usar el count que venga en el chat

        return (
          <div
            key={chat._id}
            onClick={() => onChatClick(chat)}
            className={`flex items-center p-3 lg:p-4 cursor-pointer transition-all duration-200 border-l-4 ${
              isSelected 
                ? "bg-blue-50/70 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400" 
                : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50 border-transparent"
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={avatar}
                alt={username}
                onError={(e) => { e.target.src = "/default-avatar.png"; }}
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-md"
              />
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-white dark:border-gray-950 ${
                  isOnline ? "bg-green-400" : "bg-gray-400"
                }`}
              />
            </div>

            {/* Contenido */}
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-sm lg:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                  {username}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {lastMsgTime}
                </span>
              </div>
              <p className={`text-sm truncate mt-1 ${
                  unreadCount > 0 ? "text-gray-900 dark:text-white font-semibold" : "text-gray-600 dark:text-gray-400 font-normal"
              }`}>
                {displayText || "Sin mensajes aún"}
              </p>
            </div>

            {/* Contador de no leídos */}
            {unreadCount > 0 && (
              <div className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full ml-3 flex items-center justify-center flex-shrink-0 shadow-md">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
}