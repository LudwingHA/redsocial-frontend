import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';
import { MessageList } from './MessageList';
import { ChatHeader } from './ChatHeader';
// Nota: quitamos el uso directo de chatAPI.sendMessage para evitar duplicados por API + socket

export function ChatWindow({
  activeChat,
  messages,
  setMessages,
  currentUser,
  socket,
  isConnected,
  waitForConnection
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // -------------------------
  // Escuchar newMessage desde el servidor (dedupe + reemplazo temp)
  // -------------------------
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = ({ chatId, message }) => {
      // Solo interesan mensajes del chat activo
      if (!activeChat || chatId !== activeChat._id) return;

      setMessages(prev => {
        // 1) Si ya existe message._id en el arreglo -> ignorar (dedupe)
        if (prev.some(m => m._id === message._id)) return prev;

        // 2) Buscar mensaje temporal a reemplazar (isSending + mismo remitente + mismo contenido)
        const tempIndex = prev.findIndex(
          m => m.isSending && m.sender._id === message.sender._id && m.content === message.content
        );

        if (tempIndex !== -1) {
          const next = [...prev];
          next[tempIndex] = message; // Reemplazamos el temporal por el real
          return next;
        }

        // 3) Sino, simplemente anexar
        return [...prev, message];
      });
    };

    const handleTyping = ({ chatId, userId }) => {
      if (!activeChat || chatId !== activeChat._id) return;
      setTypingUsers(prev => {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      });
      // Quitar después de 2s
      setTimeout(() => setTypingUsers(prev => prev.filter(id => id !== userId)), 2000);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('typing', handleTyping);
    };
  }, [socket, isConnected, activeChat, setMessages]);

  // -------------------------
  // Emitir "typing" evento
  // -------------------------
  const handleTyping = () => {
    if (!socket || !isConnected || !activeChat) return;
    socket.emit('typing', { chatId: activeChat._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      // podrías emitir 'stopTyping' si el servidor/cliente lo maneja
    }, 1000);
  };

  // -------------------------
  // Enviar mensaje -> SOLO por socket (optimista)
  // -------------------------
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || sending || !socket) return;

    const content = text.trim();
    setText('');
    setSending(true);

    // Mensaje temporal (optimista)
    const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const tempMessage = {
      _id: tempId,
      sender: {
        _id: currentUser._id,
        username: currentUser.username,
        avatar: currentUser.avatar
      },
      content,
      timestamp: new Date().toISOString(),
      isSending: true
    };

    // Mostrar temporal inmediatamente
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Esperar a que el socket esté listo
      if (waitForConnection) await waitForConnection();

      // Enviar por socket; el servidor debe guardar y emitir 'newMessage' con el mensaje real
      socket.emit('sendMessage', { chatId: activeChat._id, content });

      // NO usamos chatAPI.sendMessage aquí para evitar doble guardado/emisión.
      // El servidor se encargará de persistir y emitir la versión final.
    } catch (err) {
      console.error('Error enviando mensaje por socket:', err);
      // eliminar el temporal y restaurar texto
      setMessages(prev => prev.filter(m => m._id !== tempId));
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const otherUser = activeChat.participants.find(p => p._id !== currentUser._id);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white/80 to-gray-50/50">
      <ChatHeader user={otherUser} isConnected={isConnected} />

      <div className="flex-1 overflow-hidden bg-gradient-to-b from-transparent to-blue-50/20">
        <MessageList messages={messages} currentUser={currentUser} typingUsers={typingUsers} />
      </div>

      <div className="border-t border-gray-200/50 p-6 bg-white/90 backdrop-blur-sm">
        <form onSubmit={sendMessage} className="flex space-x-4 items-center">
          <div className="flex space-x-3">
            <button type="button" className="p-3 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300">
              <FiPaperclip size={22} />
            </button>
            <button type="button" className="p-3 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300">
              <FiSmile size={22} />
            </button>
          </div>

          <input
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
            disabled={!isConnected || sending}
          />

          <button
            type="submit"
            disabled={!text.trim() || !isConnected || sending}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-full transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
