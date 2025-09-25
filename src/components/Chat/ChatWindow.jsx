import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip, FiSmile } from "react-icons/fi";
import { MessageList } from "./MessageList";
import { ChatHeader } from "./ChatHeader";

export function ChatWindow({
  activeChat,
  messages,
  setMessages,
  currentUser,
  socket,
  isConnected,
  waitForConnection,
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // -------------------------
  // Unirse/Salir del chat cuando activeChat cambia
  // -------------------------
  useEffect(() => {
    if (!socket || !activeChat) return;

    return () => {
    };
  }, [socket, activeChat]);

  // -------------------------
  // Escuchar eventos del servidor
  // -------------------------
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = ({ chatId, message, tempId }) => {
  if (!activeChat || chatId !== activeChat._id) return;

  setMessages((prev) => {
    let next = [...prev];

    // ✅ Si existe un tempId, reemplazar directamente el mensaje temporal
    if (tempId) {
      const tempIndex = next.findIndex((m) => m._id === tempId);
      if (tempIndex !== -1) {
        next[tempIndex] = message;
        return next;
      }
    }

    // ✅ Evitar duplicados por _id
    if (next.some((m) => m._id === message._id)) {
      return next;
    }

    // Si no es duplicado, lo agregamos al final
    return [...next, message];
  });
};

    const handleTyping = ({ chatId, userId }) => {
      if (!activeChat || chatId !== activeChat._id) return;
      
      setTypingUsers((prev) => {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }, 2000);
    };

    const handleStopTyping = ({ chatId, userId }) => {
      if (!activeChat || chatId !== activeChat._id) return;
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, isConnected, activeChat, setMessages]);

  // -------------------------
  // Emitir typing con debounce
  // -------------------------
  const handleTyping = () => {
    if (!socket || !isConnected || !activeChat) return;
    
    socket.emit("typing", { chatId: activeChat._id });
    
    // Limpiar timeout anterior
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Emitir stopTyping después de 1 segundo de inactividad
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { chatId: activeChat._id });
    }, 1000);
  };

  // -------------------------
  // Enviar mensaje
  // -------------------------
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !isConnected || sending) return;

    const content = text.trim();
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      sender: currentUser,
      content,
      timestamp: new Date(),
      isSending: true,
    };

    // Mostrar mensaje temporal inmediatamente
    setMessages((prev) => [...prev, tempMessage]);
    setText("");
    setSending(true);

    // Limpiar indicador de typing al enviar
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("stopTyping", { chatId: activeChat._id });

    try {
      // Esperar conexión si es necesario
      if (waitForConnection) await waitForConnection();

      // Emitir mensaje al servidor
      socket.emit("sendMessage", { 
        chatId: activeChat._id, 
        content, tempId
      });

    } catch (err) {    
      // Revertir mensaje temporal en caso de error
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setText(content);
    } finally {
      setSending(false);
    }
  };

  // -------------------------
  // Manejar tecla Enter para enviar
  // -------------------------
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gradient-to-b from-white/80 to-gray-50/50">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Selecciona un chat</h3>
          <p>Elige una conversación para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  const otherUser = activeChat.participants.find(
    (p) => p._id !== (currentUser._id || currentUser.id)
  );

 return (
  <div className="flex flex-col h-full bg-gradient-to-b from-white/80 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-900/50 transition-colors duration-300">
    <ChatHeader user={otherUser} isConnected={isConnected}/>

    <div className="flex-1 overflow-hidden bg-gradient-to-b from-transparent to-blue-50/20 dark:to-blue-900/10">
      <MessageList
        messages={messages}
        currentUser={currentUser}
        typingUsers={typingUsers}
      />
    </div>

    <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-colors duration-300">
      <form onSubmit={sendMessage} className="flex space-x-4 items-center">
        <div className="flex space-x-3">
          <button
            type="button"
            className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
            title="Adjuntar archivo"
          >
            <FiPaperclip size={22} />
          </button>
          <button
            type="button"
            className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
            title="Emojis"
          >
            <FiSmile size={22} />
          </button>
        </div>

        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Escribe un mensaje..." : "Conectando..."}
          className="flex-1 px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          disabled={!isConnected || sending}
          maxLength={1000}
        />

        <button
          type="submit"
          disabled={!text.trim() || !isConnected || sending}
          className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white p-4 rounded-full transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          title={!isConnected ? "Conectando..." : "Enviar mensaje"}
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiSend size={20} />
          )}
        </button>
      </form>

      {!isConnected && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-3 text-center font-medium bg-red-50/50 dark:bg-red-900/20 py-2 rounded-lg">
          🔄 Conectando al chat...
        </p>
      )}

      {isConnected && typingUsers.length > 0 && (
        <p className="text-sm text-blue-500 dark:text-blue-400 mt-2 text-center font-medium bg-blue-50/50 dark:bg-blue-900/20 py-1 rounded-lg">
          {typingUsers.length === 1 ? 'Alguien está escribiendo...' : 'Varias personas están escribiendo...'}
        </p>
      )}

      <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
        {isConnected ? '✅ Conectado' : '❌ Desconectado'}
      </div>
    </div>
  </div>
);
}