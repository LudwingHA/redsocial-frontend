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
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Lista de Comentarios */}
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
        {comments?.map((comment) => (
          <div key={comment._id} className="flex space-x-3">
            <div className="flex-shrink-0">
              {comment.author?.avatar ? (
                <img
                  src={`${URL_SERVER}${comment.author.avatar}`}
                  alt={comment.author.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center shadow-md">
                  <FiUser size={18} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-bold text-sm text-gray-800">
                    {comment.author?.username || 'Usuario'}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {formatCommentDate(comment.createdAt || comment.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
        
        {(!comments || comments.length === 0) && (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm bg-white/50 rounded-2xl p-4">
              No hay comentarios aún. Sé el primero en comentar.
            </p>
          </div>
        )}
      </div>

      {/* Formulario de Comentario */}
      {user && (
        <form onSubmit={handleAdd} className="flex space-x-3">
          {user.avatar ? (
            <img
              src={`${URL_SERVER}${user.avatar}`}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0 shadow-md">
              <FiUser size={18} className="text-white" />
            </div>
          )}
          
          <div className="flex-1 flex space-x-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80 backdrop-blur-sm"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-full transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              <FiSend size={18} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}