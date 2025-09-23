import React, { useState } from 'react';
import { FiSend, FiUser } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { useSocket } from '../../auth/context/SocketContext';

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

      // EMITIR NOTIFICACIÓN DE COMENTARIO
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
    <div className="p-4 bg-gray-50">
      {/* Lista de Comentarios */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {comments?.map((comment) => (
          <div key={comment._id} className="flex space-x-3">
            <div className="flex-shrink-0">
              {comment.author?.avatar ? (
                <img
                  src={`http://localhost:5000${comment.author.avatar}`}
                  alt={comment.author.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <FiUser size={16} className="text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-sm text-gray-800">
                    {comment.author?.username || 'Usuario'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatCommentDate(comment.createdAt || comment.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
        
        {(!comments || comments.length === 0) && (
          <p className="text-center text-gray-500 text-sm py-4">
            No hay comentarios aún. Sé el primero en comentar.
          </p>
        )}
      </div>

      {/* Formulario de Comentario */}
      {user && (
        <form onSubmit={handleAdd} className="flex space-x-3">
          {user.avatar ? (
            <img
              src={`http://localhost:5000${user.avatar}`}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
              <FiUser size={16} className="text-gray-600" />
            </div>
          )}
          
          <div className="flex-1 flex space-x-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors disabled:opacity-50"
            >
              <FiSend size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}