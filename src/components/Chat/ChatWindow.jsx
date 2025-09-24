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

    console.log(`🔗 Uniéndose al chat: ${activeChat._id}`);
    socket.emit("joinChat", activeChat._id);
    
    return () => {
      console.log(`🔗 Saliendo del chat: ${activeChat._id}`);
      socket.emit("leaveChat", activeChat._id);
    };
  }, [socket, activeChat]);

  // -------------------------
  // Escuchar eventos del servidor
  // -------------------------
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = ({ chatId, message }) => {
      if (!activeChat || chatId !== activeChat._id) return;

      setMessages((prev) => {
        // Validación robusta para evitar duplicados
        const isDuplicate = prev.some(m => 
          m._id === message._id || 
          (m.isSending && 
           m.sender._id === message.sender._id && 
           m.content === message.content &&
           Math.abs(new Date(m.timestamp) - new Date(message.timestamp)) < 5000)
        );
        
        if (isDuplicate) {
          console.log('🚫 Mensaje duplicado detectado y filtrado');
          return prev;
        }

        // Reemplazar mensaje temporal si coincide sender + content
        const tempIndex = prev.findIndex(
          (m) => 
            m.isSending &&
            m.sender._id === message.sender._id &&
            m.content === message.content
        );

        if (tempIndex !== -1) {
          const next = [...prev];
          next[tempIndex] = message;
          console.log('🔄 Mensaje temporal reemplazado con mensaje real');
          return next;
        }

        console.log('✅ Nuevo mensaje añadido');
        return [...prev, message];
      });
    };

    const handleTyping = ({ chatId, userId }) => {
      if (!activeChat || chatId !== activeChat._id) return;
      
      setTypingUsers((prev) => {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      });

      // Limpiar typing después de 2 segundos
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
        content 
      });

    } catch (err) {
      console.error("❌ Error enviando mensaje:", err);
      
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
    (p) => p._id !== currentUser._id
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white/80 to-gray-50/50">
      <ChatHeader user={otherUser} isConnected={isConnected} />

      <div className="flex-1 overflow-hidden bg-gradient-to-b from-transparent to-blue-50/20">
        <MessageList
          messages={messages}
          currentUser={currentUser}
          typingUsers={typingUsers}
        />
      </div>

      <div className="border-t border-gray-200/50 p-6 bg-white/90 backdrop-blur-sm">
        <form onSubmit={sendMessage} className="flex space-x-4 items-center">
          <div className="flex space-x-3">
            <button
              type="button"
              className="p-3 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300"
              title="Adjuntar archivo"
            >
              <FiPaperclip size={22} />
            </button>
            <button
              type="button"
              className="p-3 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300"
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
            className="flex-1 px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 disabled:opacity-50"
            disabled={!isConnected || sending}
            maxLength={1000}
          />

          <button
            type="submit"
            disabled={!text.trim() || !isConnected || sending}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-full transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
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
          <p className="text-sm text-red-500 mt-3 text-center font-medium bg-red-50/50 py-2 rounded-lg">
            🔄 Conectando al chat...
          </p>
        )}

        {isConnected && typingUsers.length > 0 && (
          <p className="text-sm text-blue-500 mt-2 text-center font-medium bg-blue-50/50 py-1 rounded-lg">
            {typingUsers.length === 1 ? 'Alguien está escribiendo...' : 'Varias personas están escribiendo...'}
          </p>
        )}

        <div className="text-xs text-gray-400 text-center mt-2">
          {isConnected ? '✅ Conectado' : '❌ Desconectado'}
        </div>
      </div>
    </div>
  );
}