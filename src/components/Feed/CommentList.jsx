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
  <div className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-slate-200/60 dark:border-gray-700/60 transition-all duration-300">
    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
      {comments?.map((comment) => (
        <div key={comment._id} className="flex gap-3">
          <div className="flex-shrink-0">
            {comment.author?.avatar ? (
              <img
                src={`${URL_SERVER}${comment.author.avatar}`}
                alt={comment.author.username}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-gray-600 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-sm">
                <FiUser size={16} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-slate-100/80 dark:bg-gray-700/80 rounded-2xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                  {comment.author?.username || 'Usuario'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-gray-600/50 px-2 py-1 rounded-full">
                  {formatCommentDate(comment.createdAt || comment.timestamp)}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{comment.content}</p>
            </div>
          </div>
        </div>
      ))}
      
      {(!comments || comments.length === 0) && (
        <div className="text-center py-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm bg-white/30 dark:bg-gray-700/30 rounded-xl p-3">
            No hay comentarios aún. Sé el primero en comentar.
          </p>
        </div>
      )}
    </div>

    {user && (
      <form onSubmit={handleAdd} className="flex gap-3 items-start">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img
              src={`${URL_SERVER}${user.avatar}`}
              alt={user.username}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-gray-600 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-sm">
              <FiUser size={16} className="text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 px-4 py-2 border border-slate-200 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 transition-all duration-300"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white p-2 rounded-full transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend size={16} />
          </button>
        </div>
      </form>
    )}
  </div>
);
}