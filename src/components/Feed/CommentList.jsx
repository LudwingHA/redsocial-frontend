import React, { useState } from 'react';
import { FiSend, FiUser } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { useSocket } from '../../auth/context/SocketContext';
import { URL_SERVER } from '../../api/url';

export function CommentList({ comments, onAdd, postId, postAuthorId }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(text);
      setText('');

      if (socket && isConnected && user.id !== postAuthorId) {
        socket.emit("newComment", {
          postId: postId,
          commenterId: user.id,
          commentContent: text,
          postAuthorId: postAuthorId
        });
     
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCommentDate = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
return (
  <div className="p-4 bg-slate-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-slate-200/60 dark:border-gray-700/60 transition-all duration-300">
    <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
      {comments?.map((comment) => (
        <div key={comment._id} className="flex gap-2 items-start">
          <div className="flex-shrink-0 mt-0.5">
            {comment.author?.avatar ? (
              <img
                src={`${URL_SERVER}${comment.author.avatar}`}
                alt={comment.author.username}
                className="w-7 h-7 rounded-full object-cover shadow-sm" // Reducción de tamaño
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-400 dark:bg-gray-600 flex items-center justify-center shadow-sm">
                <FiUser size={14} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {/* Contenido del comentario más simple y pegado al texto */}
            <div className="p-2.5 shadow-sm">
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-snug break-words">
                <span className="font-semibold text-slate-800 dark:text-slate-100 mr-1">
                  {comment.author?.username || 'Usuario'}
                </span>
                {comment.content}
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                {formatCommentDate(comment.createdAt || comment.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Mensaje de no hay comentarios - simplificado */}
      {(!comments || comments.length === 0) && (
        <div className="text-center py-2">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No hay comentarios aún.
          </p>
        </div>
      )}
    </div>

    {/* Formulario de comentario - más integrado */}
    {user && (
      <form onSubmit={handleAdd} className="flex gap-2 items-center pt-2 border-t border-slate-200/60 dark:border-gray-700/60">
        <div className="flex-shrink-0">
          {/* Avatar del usuario que comenta */}
          {user.avatar ? (
            <img
              src={`${URL_SERVER}${user.avatar}`}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-400 dark:bg-gray-600 flex items-center justify-center shadow-sm">
              <FiUser size={16} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Añade un comentario..."
            // Estilo simplificado para que parezca un input de Instagram
            className="flex-1 px-3 py-2 border-0 rounded-full focus:ring-0 text-sm bg-slate-100 dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 transition-all duration-300"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            aria-label="Enviar comentario"
            disabled={!text.trim() || isSubmitting}
            // Botón "Publicar" en texto simple, color de marca, oculto hasta que escriba
            className={`font-semibold text-sm transition-opacity duration-300 ${!text.trim() || isSubmitting ? 'opacity-50 text-blue-500 cursor-not-allowed' : 'text-blue-500 hover:text-blue-600'}`}
          >
            Publicar
          </button>
        </div>
      </form>
    )}
  </div>
);
}