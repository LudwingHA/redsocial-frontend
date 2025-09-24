import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';
import { MessageList } from './MessageList';
import { ChatHeader } from './ChatHeader';
import { chatAPI } from '../../api/api';

export function ChatWindow({ activeChat, messages, setMessages, currentUser, socket, isConnected, waitForConnection }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  // Efecto para limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Manejar escritura
  const handleTyping = () => {
    if (!socket || !isConnected) return;

    // Emitir evento de typing
    socket.emit('typing', { 
      chatId: activeChat._id,
      userId: currentUser._id 
    });

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Configurar timeout para dejar de escribir
    typingTimeoutRef.current = setTimeout(() => {
      // Podrías emitir un evento 'stopTyping' aquí si lo implementas
    }, 1000);
  };

  // Enviar mensaje
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !isConnected || sending) return;

    const content = text.trim();
    setText('');
    setSending(true);

    // Mensaje temporal
    const tempMessage = {
      _id: Date.now().toString(),
      sender: { 
        _id: currentUser._id, 
        username: currentUser.username, 
        avatar: currentUser.avatar 
      },
      content: content,
      timestamp: new Date(),
      isSending: true,
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      await waitForConnection();
      const res = await chatAPI.sendMessage(activeChat._id, content);
      
      if (res.success) {
        // Reemplazar mensaje temporal con el real
        setMessages(prev => prev.filter(m => m._id !== tempMessage._id).concat(res.message));
        
        // Emitir evento de nuevo mensaje
        const receiver = activeChat.participants.find(p => p._id !== currentUser._id);
        if (receiver && socket) {
          socket.emit('newMessage', { 
            chatId: activeChat._id, 
            senderId: currentUser._id, 
            receiverId: receiver._id, 
            messageContent: content 
          });
        }
      } else {
        // Error: restaurar mensaje
        setMessages(prev => prev.filter(m => !m.isSending));
        setText(content);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => !m.isSending));
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const otherUser = activeChat.participants.find(p => p._id !== currentUser._id);

return (
  <div className="flex flex-col h-full bg-gradient-to-b from-white/80 to-gray-50/50">
    {/* Header del chat */}
    <ChatHeader user={otherUser} isConnected={isConnected} />
    
    {/* Lista de mensajes */}
    <div className="flex-1 overflow-hidden bg-gradient-to-b from-transparent to-blue-50/20">
      <MessageList
        messages={messages}
        currentUser={currentUser}
        typingUsers={typingUsers}
      />
    </div>

    {/* Input de mensaje */}
    <div className="border-t border-gray-200/50 p-6 bg-white/90 backdrop-blur-sm">
      <form onSubmit={sendMessage} className="flex space-x-4 items-center">
        <div className="flex space-x-3">
          <button
            type="button"
            className="p-3 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300"
          >
            <FiPaperclip size={22} />
          </button>
          <button
            type="button"
            className="p-3 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300"
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
          placeholder="Escribe un mensaje..."
          className="flex-1 px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
          disabled={!isConnected || sending}
        />
        
        <button
          type="submit"
          disabled={!text.trim() || !isConnected || sending}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <FiSend size={20} />
        </button>
      </form>
      
      {!isConnected && (
        <p className="text-sm text-red-500 mt-3 text-center font-medium bg-red-50/50 py-2 rounded-lg">
          🔄 Conectando al chat...
        </p>
      )}
    </div>
  </div>
);
}