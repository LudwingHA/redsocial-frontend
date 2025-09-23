import { useEffect, useRef } from 'react';
import { FaPaperPlane, FaUser, FaCircle } from 'react-icons/fa';

export default function Chat({ chatUser, chatText, messages, setChatText, onSendMessage, user }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="w-96 bg-background-secondary border-l border-border flex flex-col">
      {/* Header del Chat */}
      <div className="p-4 border-b border-border bg-background-primary">
        {chatUser ? (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {chatUser.charAt(0).toUpperCase()}
              </div>
              <FaCircle className="absolute -bottom-1 -right-1 text-green-500 text-xs bg-white rounded-full" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{chatUser}</h3>
              <p className="text-xs text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                En línea
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <FaUser className="text-4xl text-text-tertiary mx-auto mb-2" />
            <p className="text-text-primary font-semibold">Selecciona un usuario</p>
            <p className="text-text-tertiary text-sm">para comenzar a chatear</p>
          </div>
        )}
      </div>
      
      {/* Área de mensajes */}
      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary">
            <p>No hay mensajes aún</p>
            <p className="text-sm">Envía un mensaje para comenzar la conversación</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div 
              key={i} 
              className={`flex mb-4 ${m.sender === user._id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs p-3 rounded-2xl ${
                m.sender === user._id 
                  ? 'bg-primary-500 text-white rounded-br-none' 
                  : 'bg-background-primary text-text-primary border border-border rounded-bl-none'
              }`}>
                <p className="text-sm">{m.text}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {formatTime(m.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input de mensaje */}
      <div className="p-4 border-t border-border bg-background-primary">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder={chatUser ? "Escribe un mensaje..." : "Selecciona un usuario para chatear"}
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && chatText.trim()) onSendMessage();
            }}
            disabled={!chatUser}
            className="flex-1 p-3 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
          <button 
            onClick={onSendMessage}
            disabled={!chatUser || !chatText.trim()}
            className="bg-primary-500 text-white p-3 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}