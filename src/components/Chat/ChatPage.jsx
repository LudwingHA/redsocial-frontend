import React, { useEffect, useState, useRef } from "react";
import { FiSearch, FiUserPlus, FiSend } from "react-icons/fi";
// import { useAuth } from '../../auth/context/AuthContext';
// import { useSocket } from '../../auth/context/SocketContext';
// import { chatAPI } from '../../api/api';

import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { UsersList } from "./UsersList";
import { useAuth } from "../../auth/context/AuthContext";
import { useSocket } from "../../auth/context/SocketContext";
import { chatAPI } from "../../api/api";

export function ChatPage() {
  const { user } = useAuth();
  const { socket, isConnected, waitForConnection } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar usuarios disponibles
  useEffect(() => {
    if (!user) return;

    const loadUsers = async () => {
      try {
        const res = await chatAPI.getAllUsers();
        if (res.success) {
          setAvailableUsers(res.users.filter((u) => u._id !== user._id));
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUsers();
  }, [user]);

  // Cargar chats del usuario
  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      setLoading(true);
      try {
        const res = await chatAPI.getUserChats();
        if (res.success) {
          setChats(res.chats || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [user]);

  // Filtrar chats y usuarios
  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.participants.find((p) => p._id !== user?._id);
    return otherUser?.username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = availableUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir chat existente
  const openChat = async (chat) => {
    setActiveChat(chat);
    try {
      const res = await chatAPI.getChatMessages(chat._id);
      if (res.success) {
        setMessages(res.chat.messages || []);
        if (socket) {
          // Esperar a que la conexión esté lista
          if (waitForConnection) await waitForConnection();
          socket.emit("joinChat", chat._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Iniciar nuevo chat
  const startChat = async (participantId) => {
    try {
      const res = await chatAPI.createChat(participantId);
      if (res.success) {
        setChats((prev) => [res.chat, ...prev]);
        openChat(res.chat);
        setSearchTerm(""); // Limpiar búsqueda
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Inicia sesión para usar el chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl shadow-2xl overflow-hidden border border-white/50">
      {/* Sidebar izquierdo - Chats */}
      <div className="w-96 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col">
        {/* Header del sidebar */}
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-white to-gray-50/80">
          <div className="relative">
            <FiSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar chats o usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300"
            />
          </div>
        </div>

        {/* Lista de chats */}
        <div className="flex-1 overflow-y-auto">
          <ChatSidebar
            chats={filteredChats}
            activeChat={activeChat}
            onChatSelect={openChat}
            currentUser={user}
            loading={loading}
          />
        </div>
      </div>

      {/* Ventana principal de chat o lista de usuarios */}
      <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm">
        {activeChat ? (
          <ChatWindow
            activeChat={activeChat}
            messages={messages}
            setMessages={setMessages}
            currentUser={user}
            socket={socket}
            isConnected={isConnected}
            waitForConnection={waitForConnection}
          />
        ) : (
          <UsersList
            users={filteredUsers}
            onUserSelect={startChat}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
}
