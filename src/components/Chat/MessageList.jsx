import React from "react";
import dayjs from "dayjs";
import { URL_SERVER } from "../../api/url";

export function MessageList({ messages = [], currentUser }) {
  const currentUserId = currentUser?._id || currentUser?.id;

  return (
    <div className="flex flex-col space-y-3 p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 min-h-full">
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
                className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-700 shadow-md mr-2"
              />
            )}

            {/* Burbuja */}
            <div
              className={`relative px-4 py-2 rounded-2xl shadow-lg max-w-[75%] break-words
                ${isMine 
                  ? "bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-500 text-white rounded-br-none" 
                  : "bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-bl-none"}`}
            >
              {/* Texto */}
              <p className="text-sm lg:text-base">{msg.content}</p>

              {/* Hora + estado */}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span
                  className={`text-[11px] ${
                    isMine ? "text-blue-100" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {dayjs(msg.timestamp).format("HH:mm")}
                </span>
              </div>

              {/* Piquito de la burbuja */}
              <span
                className={`absolute bottom-0 ${
                  isMine
                    ? "-right-2 border-t-[12px] border-t-transparent border-l-[12px] border-l-indigo-500"
                    : "-left-2 border-t-[12px] border-t-transparent border-r-[12px] border-r-white dark:border-r-slate-800"
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
