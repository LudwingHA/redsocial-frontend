import React from "react";
import dayjs from "dayjs";
import { URL_SERVER } from "../../api/url";

export function MessageList({ messages = [], currentUser }) {
  const currentUserId = currentUser?._id || currentUser?.id;
// MessageList.jsx - RETURN Mejorado

return (
  <div className="flex flex-col space-y-3 p-4 lg:p-6 min-h-full">
    {messages.map((msg) => {
      const isMine = msg.sender?._id?.toString() === currentUserId?.toString();

      return (
        <div
          key={msg._id}
          className={`flex ${isMine ? "justify-end" : "justify-start"} items-end`}
        >
          {/* Avatar solo para mensajes de otros */}
          {!isMine && (
            <img
              src={
                msg.sender?.avatar
                  ? `${URL_SERVER}${msg.sender.avatar}`
                  : "/default-avatar.png"
              }
              alt={msg.sender?.username || "Usuario"}
              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md mr-2 flex-shrink-0"
            />
          )}

          {/* Burbuja */}
          <div
            className={`relative px-4 py-2.5 shadow-xl max-w-[80%] break-words transition-all duration-300
              ${isMine 
                ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-t-2xl rounded-l-2xl rounded-br-md" 
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-t-2xl rounded-r-2xl rounded-bl-md"}`}
          >
            {/* Texto */}
            <p className="text-sm lg:text-base leading-snug">{msg.content}</p>

            {/* Hora + estado */}
            <div className="flex items-center justify-end gap-1 mt-1">
              <span
                className={`text-[11px] ${
                  isMine ? "text-white/80" : "text-gray-400 dark:text-gray-500"
                } font-medium`}
              >
                {dayjs(msg.timestamp).format("HH:mm")}
              </span>
              {/* Indicador de estado (p.ej., enviando) */}
              {msg.isSending && isMine && (
                <div className="w-2 h-2 rounded-full border-t-2 border-r-2 border-white animate-spin opacity-70"></div>
              )}
            </div>
            
            {/* No es necesario el piquito con los nuevos rounded-md */}
          </div>
        </div>
      );
    })}
  </div>
);
}
