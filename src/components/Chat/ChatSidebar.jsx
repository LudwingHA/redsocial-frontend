import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { URL_SERVER } from "../../api/url";

dayjs.extend(relativeTime);
dayjs.locale("es");

export function ChatSidebar({
  chats = [],
  setChats, // lo recibe pero aquí no lo usamos (lo dejamos por compatibilidad)
  currentUser,
  onlineUsers = [],
  onChatClick,
  activeChatId,
}) {
  const currentUserId = currentUser?._id || currentUser?.id;

  return (
    <div className="w-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => {
          const otherUser = chat.participants.find((p) => (p._id !== currentUserId && p._id !== currentUserId?.toString()) || ![currentUserId, (currentUserId?.toString())].includes(p._id) ? p : null) // fallback safe
            || chat.participants.find((p) => p._id !== (currentUser?._id || currentUser?.id)); // safe find

          // Fallback si algo no cuadra
          const userToShow = otherUser || (chat.participants && chat.participants[0]) || {};
          const username = userToShow.username || "Usuario";
          const avatar = userToShow.avatar ? URL_SERVER + userToShow.avatar : "/default-avatar.png";
          const isOnline = userToShow._id ? onlineUsers.some(id => id?.toString() === userToShow._id?.toString()) : false;

          // Mostrar "Tú:" si el último mensaje lo enviaste
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
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ${
                activeChatId === chat._id ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={avatar}
                  alt={username}
                  onError={(e) => { e.target.src = "/default-avatar.png"; }}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                    isOnline ? "bg-green-400" : "bg-gray-400"
                  }`}
                />
              </div>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold truncate">{username}</p>
                  <span className="text-xs text-gray-500">{lastMsgTime}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-1">{displayText || "Sin mensajes aún"}</p>
              </div>

              {chat.unreadCount > 0 && (
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-3">
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
