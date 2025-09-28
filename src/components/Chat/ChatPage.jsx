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
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // En móvil, el sidebar empieza cerrado; en desktop, abierto
      setSidebarOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Ejecutar al montar
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar sidebar en móvil cuando se selecciona un chat
  useEffect(() => {
    if (isMobile && activeChat) {
      setSidebarOpen(false);
    }
  }, [activeChat, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Cargar usuarios disponibles
  useEffect(() => {
    if (!user) return;
    const loadUsers = async () => {
      try {
        const res = await chatAPI.getAllUsers();
        if (res.success) {
          // Inicializar con estado online
          const usersWithOnlineStatus = res.users
            .filter((u) => !sameId(u._id, user._id || user.id))
            .map(u => ({
              ...u,
              isOnline: onlineUsers.some(id => sameId(id, u._id))
            }));
          setAvailableUsers(usersWithOnlineStatus);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadUsers();
  }, [user]);

  // Sincronizar availableUsers con onlineUsers en tiempo real
  useEffect(() => {
    if (availableUsers.length > 0) {
      setAvailableUsers(prev => 
        prev.map(u => ({
          ...u,
          isOnline: onlineUsers.some(id => sameId(id, u._id))
        }))
      );
    }
  }, [onlineUsers]); // Se ejecuta cada vez que onlineUsers cambia

  // Cargar chats (inicio)
  useEffect(() => {
    if (!user) return;
    const loadChats = async () => {
      setLoading(true);
      try {
        const res = await chatAPI.getUserChats();
        if (res.success) {
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

// Escuchar sockets: newMessage, newChat y eventos de conexión
useEffect(() => {
  if (!socket) return;

  const handleNewMessage = ({ chatId, message, tempId }) => {
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
        return prev;
      }

      next.sort((a, b) => new Date(b.lastMessage || 0) - new Date(a.lastMessage || 0));
      return [...next];
    });
  };

  const handleNewChat = (newChat) => {
    setChats((prev) => {
      const exists = prev.some((c) => sameId(c._id, newChat._id));
      if (exists) {
        return prev.map((c) => (sameId(c._id, newChat._id) ? { ...c, ...newChat } : c));
      }
      return [newChat, ...prev];
    });
  };

  // NUEVO: Escuchar la lista actualizada de usuarios online
  const handleUpdateOnlineUsers = (users) => {
    console.log('📱 Lista de usuarios online actualizada:', users);
    // Este evento ya actualiza onlineUsers en tu SocketContext
    // Pero también podemos actualizar availableUsers aquí
    setAvailableUsers(prev => 
      prev.map(u => ({
        ...u,
        isOnline: users.some(id => sameId(id, u._id))
      }))
    );
  };

  // Registrar todos los listeners
  socket.on("newMessage", handleNewMessage);
  socket.on("newChat", handleNewChat);
  socket.on("updateOnlineUsers", handleUpdateOnlineUsers); // ✅ Evento correcto

  return () => {
    socket.off("newMessage", handleNewMessage);
    socket.off("newChat", handleNewChat);
    socket.off("updateOnlineUsers", handleUpdateOnlineUsers);
  };
}, [socket, setChats, activeChat]);

  // Función para abrir chat
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

  // Iniciar nuevo chat
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

  // Filtrado para render - SIN el .map() adicional
  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.participants.find((p) => !sameId(p._id, user._id || user.id));
    return otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredUsers = availableUsers.filter((u) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  ); // El estado isOnline ya viene en availableUsers

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 dark:text-gray-400">Inicia sesión para usar el chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] relative overflow-hidden">
      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - CORREGIDO */}
      <div className={`
        fixed lg:relative z-30 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-96 w-80
      `}>
        {/* Buscador */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar chats o usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <ChatSidebar
          chats={filteredChats}
          currentUser={user}
          onlineUsers={onlineUsers}
          onChatClick={openChat}
          activeChatId={activeChat?._id}
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 min-w-0 relative z-10">
        {activeChat ? (
          <ChatWindow
            activeChat={activeChat}
            messages={messages}
            setMessages={setMessages}
            currentUser={user}
            socket={socket}
            isConnected={isConnected}
            waitForConnection={waitForConnection}
            onMenuToggle={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
        ) : (
          <UsersList 
            users={filteredUsers} 
            onUserSelect={startChat} 
            searchTerm={searchTerm}
            onMenuToggle={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
}

export default ChatPage;