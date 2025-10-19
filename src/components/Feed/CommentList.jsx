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
  <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300">
    {/* Comments List */}
    <div className="max-h-60 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
      {comments?.map((comment) => (
        <div key={comment._id} className="flex gap-3 items-start">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {comment.author?.avatar ? (
              <img
                src={`${URL_SERVER}${comment.author.avatar}`}
                alt={comment.author.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <FiUser size={14} className="text-white" />
              </div>
            )}
          </div>
          
          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl px-3 py-2">
              <p className="text-sm text-gray-900 dark:text-white break-words">
                <span className="font-semibold mr-2">
                  {comment.author?.username || 'Usuario'}
                </span>
                {comment.content}
              </p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block px-1">
              {formatCommentDate(comment.createdAt || comment.timestamp)}
            </span>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {(!comments || comments.length === 0) && (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sé el primero en comentar
          </p>
        </div>
      )}
    </div>

    {/* Comment Form */}
    {user && (
      <form onSubmit={handleAdd} className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-3 items-center">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img
                src={`${URL_SERVER}${user.avatar}`}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <FiUser size={16} className="text-white" />
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="flex-1 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Añade un comentario..."
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-full focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className={`px-4 font-semibold text-sm transition-all duration-300 ${
                !text.trim() || isSubmitting 
                  ? 'text-blue-300 dark:text-blue-600 cursor-not-allowed' 
                  : 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
              }`}
            >
              Publicar
            </button>
          </div>
        </div>
      </form>
    )}
  </div>
);
}