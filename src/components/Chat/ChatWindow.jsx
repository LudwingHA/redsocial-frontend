import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip, FiSmile, FiArrowDown } from "react-icons/fi";
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
  onMenuToggle,
  sidebarOpen,
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Verificar si hay mensajes fuera de vista
  const checkScrollPosition = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const isScrolledUp = container.scrollTop < container.scrollHeight - container.clientHeight - 100;
      setShowScrollButton(isScrolledUp);
    }
  };

  // Scroll al final de los mensajes
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollButton(false);
    }
  };

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      // Solo hacer scroll si ya está cerca del final
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages, typingUsers]);

  // Escuchar eventos del servidor
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = ({ chatId, message, tempId }) => {
      if (!activeChat || chatId !== activeChat._id) return;

      setMessages((prev) => {
        let next = [...prev];

        if (tempId) {
          const tempIndex = next.findIndex((m) => m._id === tempId);
          if (tempIndex !== -1) {
            next[tempIndex] = message;
            return next;
          }
        }

        if (next.some((m) => m._id === message._id)) {
          return next;
        }

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

  const handleTyping = () => {
    if (!socket || !isConnected || !activeChat) return;
    
    socket.emit("typing", { chatId: activeChat._id });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { chatId: activeChat._id });
    }, 1000);
  };

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

    setMessages((prev) => [...prev, tempMessage]);
    setText("");
    setSending(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("stopTyping", { chatId: activeChat._id });

    try {
      if (waitForConnection) await waitForConnection();
      socket.emit("sendMessage", { 
        chatId: activeChat._id, 
        content, 
        tempId 
      });
    } catch (err) {    
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gradient-to-b from-white/80 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-900/50 p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Selecciona un chat</h3>
          <p className="text-sm">Elige una conversación para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  const otherUser = activeChat.participants.find(
    (p) => p._id !== (currentUser._id || currentUser.id)
  );
// ChatWindow.jsx - RETURN Mejorado

return (
  <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-300">
    <ChatHeader 
      user={otherUser} 
      isConnected={isConnected}
      onMenuToggle={onMenuToggle}
      sidebarOpen={sidebarOpen}
    />

    {/* ÁREA DE MENSAJES */}
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-2 relative"
      onScroll={checkScrollPosition}
    >
      <MessageList
        messages={messages}
        currentUser={currentUser}
        typingUsers={typingUsers}
        activeChat={activeChat}
      />
      
      {/* Botón para scroll al final */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 lg:right-8 bg-blue-500 text-white p-3 rounded-full shadow-xl hover:bg-blue-600 transition-all duration-300 z-10 animate-bounce"
        >
          <FiArrowDown size={20} />
        </button>
      )}
    </div>

    {/* ÁREA DE ENTRADA DE TEXTO */}
    <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50 p-4 lg:p-4 bg-white dark:bg-gray-900">
      <form onSubmit={sendMessage} className="flex space-x-3 lg:space-x-4 items-end">
        
        {/* Botones de Media y Emojis */}
        <div className="flex space-x-2 flex-shrink-0">
          <button
            type="button"
            className="p-3 text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-300"
            title="Adjuntar archivo"
          >
            <FiPaperclip size={20} />
          </button>
          <button
            type="button"
            className="p-3 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-300"
            title="Emojis"
          >
            <FiSmile size={20} />
          </button>
        </div>

        {/* Campo de Texto */}
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Escribe un mensaje..." : "Conectando..."}
          className="flex-1 resize-none h-[50px] overflow-y-auto px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 transition-all duration-300 disabled:opacity-50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm lg:text-base shadow-inner"
          disabled={!isConnected || sending}
          maxLength={1000}
        />

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={!text.trim() || !isConnected || sending}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 lg:p-4 rounded-full transition-all duration-300 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex-shrink-0"
          title={!isConnected ? "Conectando..." : "Enviar mensaje"}
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiSend size={20} />
          )}
        </button>
      </form>

      {/* Indicadores de estado */}
      {isConnected && typingUsers.length > 0 && (
        <p className="text-xs lg:text-sm text-blue-500 dark:text-blue-400 mt-2 ml-4 font-medium">
          {typingUsers.length === 1 ? 'Escribiendo...' : `${typingUsers.length} están escribiendo...`}
        </p>
      )}
      {!isConnected && (
        <p className="text-xs lg:text-sm text-red-500 dark:text-red-400 mt-2 ml-4 font-medium">
          🔄 Conexión perdida, reconectando...
        </p>
      )}
    </div>
    <style jsx global>{`
      /* Ocultar scrollbar pero permitir scroll */
      .scrollbar-hide {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
      }
    `}</style>
  </div>
);
}