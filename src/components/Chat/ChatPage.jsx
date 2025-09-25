import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { UsersList } from "./UsersList";
import { useAuth } from "../../auth/context/AuthContext";
import { useSocket } from "../../auth/context/SocketContext";
import { chatAPI } from "../../api/api";

function sameId(a, b) {
  if (!a || !b) return false;
  return a.toString() === b.toString();
}

export function ChatPage() {
  const { user } = useAuth();
  const { socket, isConnected, waitForConnection, onlineUsers = [] } = useSocket();

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
          setAvailableUsers(res.users.filter((u) => !sameId(u._id, user._id || user.id)));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadUsers();
  }, [user]);

  // Cargar chats (inicio)
  useEffect(() => {
    if (!user) return;
    const loadChats = async () => {
      setLoading(true);
      try {
        const res = await chatAPI.getUserChats();
        if (res.success) {
          // Enriquecer cada chat con lastMessageSender si viene en messages
          const enriched = (res.chats || []).map((c) => {
            const lastMsg = (c.messages && c.messages.length) ? c.messages[c.messages.length - 1] : null;
            return {
              ...c,
              lastMessageContent: c.lastMessageContent || lastMsg?.content || "",
              lastMessage: c.lastMessage || lastMsg?.timestamp || c.lastMessage,
              lastMessageSender: lastMsg?.sender?._id || null,
            };
          });
          enriched.sort((a, b) => new Date(b.lastMessage || 0) - new Date(a.lastMessage || 0));
          setChats(enriched);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, [user]);

  // Escuchar sockets: newMessage y newChat
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ chatId, message, tempId }) => {
      // DEBUG: descomenta si quieres ver payloads
      // console.log("socket newMessage ->", { chatId, message, tempId });

      setChats((prev) => {
        if (!Array.isArray(prev) || prev.length === 0) return prev;

        let found = false;
        const next = prev.map((c) => {
          if (sameId(c._id, chatId)) {
            found = true;
            return {
              ...c,
              lastMessageContent: message?.content ?? c.lastMessageContent,
              lastMessage: message?.timestamp ?? (new Date()).toISOString(),
              lastMessageSender: message?.sender?._id ?? c.lastMessageSender,
            };
          }
          return c;
        });

        if (!found) {
          // Si no está en la lista, no lo agregamos automáticamente para evitar datos parciales.
          // Si quieres, aquí podrías fetchear el chat completo y agregarlo.
          return prev;
        }

        next.sort((a, b) => new Date(b.lastMessage || 0) - new Date(a.lastMessage || 0));
        return [...next];
      });

      // Si el chat abierto es el mismo, dejar que ChatWindow reciba el mensaje (evita duplicados)
      // ChatWindow también escucha "newMessage" y reemplaza tempId/maneja mensajes.
    };

    const handleNewChat = (newChat) => {
      setChats((prev) => {
        const exists = prev.some((c) => sameId(c._id, newChat._id));
        if (exists) {
          // actualizar datos si ya existe
          return prev.map((c) => (sameId(c._id, newChat._id) ? { ...c, ...newChat } : c));
        }
        // insertar al inicio
        return [newChat, ...prev];
      });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newChat", handleNewChat);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newChat", handleNewChat);
    };
  }, [socket, setChats, activeChat]);

  // Función para abrir chat (no añade chats; solo carga mensajes y se une a la sala)
  const openChat = async (chat) => {
    setActiveChat(chat);
    try {
      const res = await chatAPI.getChatMessages(chat._id);
      if (res.success) {
        setMessages(res.chat.messages || []);
        if (socket) {
          if (waitForConnection) await waitForConnection();
          socket.emit("joinChat", chat._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Iniciar nuevo chat (evitar duplicados)
  const startChat = async (participantId) => {
    try {
      const res = await chatAPI.createChat(participantId);
      if (res.success) {
        setChats((prev) => {
          const exists = prev.some((c) => sameId(c._id, res.chat._id));
          if (exists) {
            return prev.map((c) => (sameId(c._id, res.chat._id) ? { ...c, ...res.chat } : c));
          }
          return [res.chat, ...prev];
        });
        openChat(res.chat);
        setSearchTerm("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrado para render
  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.participants.find((p) => !sameId(p._id, user._id || user.id));
    return otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = availableUsers.filter((u) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ).map(u => ({ ...u, isOnline: onlineUsers.some(id => sameId(id, u._id)) }));

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Inicia sesión para usar el chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)]">
      <div className="w-96">
        {/* Buscador */}
        <div className="p-6 border-b">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar chats o usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12"
            />
          </div>
        </div>

        <ChatSidebar
          chats={filteredChats}
          setChats={setChats}
          currentUser={user}
          onlineUsers={onlineUsers}
          onChatClick={openChat}
          activeChatId={activeChat?._id}
        />
      </div>

      <div className="flex-1">
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
          <UsersList users={filteredUsers} onUserSelect={startChat} searchTerm={searchTerm} />
        )}
      </div>
    </div>
  );
}

export default ChatPage;
