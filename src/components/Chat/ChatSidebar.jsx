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

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
          No hay conversaciones
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Comienza una nueva conversación para verla aquí
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-950 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100">
          Chats ({chats.length})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => {
          const otherUser = chat.participants.find((p) => 
            (p._id !== currentUserId && p._id !== currentUserId?.toString()) || 
            ![currentUserId, (currentUserId?.toString())].includes(p._id)
          ) || chat.participants.find((p) => p._id !== (currentUser?._id || currentUser?.id)) || {};

          const username = otherUser.username || "Usuario";
          const avatar = otherUser.avatar ? URL_SERVER + otherUser.avatar : "/default-avatar.png";
          const isOnline = otherUser._id ? onlineUsers.some(id => id?.toString() === otherUser._id?.toString()) : false;

          const lastMsgText = chat.lastMessageContent || "";
          const lastMsgSender = chat.lastMessageSender || chat.lastMessageSender?._id || null;
          const isMine = lastMsgSender ? (lastMsgSender.toString() === currentUserId?.toString()) : false;

          const displayText = isMine
            ? lastMsgText.startsWith("Tú:") ? lastMsgText : `Tú: ${lastMsgText}`
            : lastMsgText;

          const lastMsgTime = chat.lastMessage ? dayjs(chat.lastMessage).fromNow() : "";

          return (
            <div
              key={chat._id}
              onClick={() => onChatClick(chat)}
              className={`flex items-center p-3 lg:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800 ${
                activeChatId === chat._id ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={avatar}
                  alt={username}
                  onError={(e) => { e.target.src = "/default-avatar.png"; }}
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                    isOnline ? "bg-green-400" : "bg-gray-400"
                  }`}
                />
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm lg:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {username}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {lastMsgTime}
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                  {displayText || "Sin mensajes aún"}
                </p>
              </div>

              {chat.unreadCount > 0 && (
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}