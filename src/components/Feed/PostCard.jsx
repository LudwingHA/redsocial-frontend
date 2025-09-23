import React, { useState, useEffect } from 'react';
import { FiHeart, FiMessageCircle, FiMoreVertical } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { useSocket } from '../../auth/context/SocketContext';
import { postAPI } from '../../api/api';
import { CommentList } from './CommentList';
import { PostMenu } from './PostMenu';

export function PostCard({ post }) {
  const [localPost, setLocalPost] = useState(post);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  useEffect(() => setLocalPost(post), [post]);

  const handleLike = async () => {
    if (!user || isLiking) return;
    
    setIsLiking(true);
    try {
      const res = await postAPI.toggleLike(localPost._id);
      if (res.success) {
        setLocalPost((prev) => ({
          ...prev,
          likes: res.likes,
          likesCount: res.likes.length,
        }));

        // EMITIR NOTIFICACIÓN DE LIKE
        if (socket && isConnected && user.id !== localPost.author._id) {
          socket.emit("postLiked", {
            postId: localPost._id,
            likerId: user.id,
            postAuthorId: localPost.author._id
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const addComment = async (content) => {
    try {
      const res = await postAPI.addComment(localPost._id, content);
      if (res.success) {
        setLocalPost((prev) => ({
          ...prev,
          comments: [...prev.comments, res.comment],
        }));

        // EMITIR NOTIFICACIÓN DE COMENTARIO
        if (socket && isConnected && user.id !== localPost.author._id) {
          socket.emit("newComment", {
            postId: localPost._id,
            commenterId: user.id,
            commentContent: content,
            postAuthorId: localPost.author._id
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const hasLiked = localPost.likes?.some((like) =>
    like._id ? like._id.toString() === user?.id : like.toString() === user?.id
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header del Post */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <img
            src={`http://localhost:5000${localPost.author.avatar}`}
            alt={localPost.author.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{localPost.author.username}</h3>
            <p className="text-sm text-gray-500">{formatDate(localPost.createdAt)}</p>
          </div>
        </div>
        <PostMenu post={localPost} />
      </div>

      {/* Contenido del Post */}
      <div className="p-4">
        <p className="text-gray-800 whitespace-pre-wrap">{localPost.content}</p>
        
        {localPost.image && (
          <div className="mt-3">
            <img
              src={`http://localhost:5000${localPost.image}`}
              alt="Post content"
              className="rounded-lg max-w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}
      </div>

      {/* Stats y Acciones */}
      <div className="px-4 py-2 border-t border-b bg-gray-50">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{localPost.likesCount || 0} me gusta</span>
          <span>{localPost.comments?.length || 0} comentarios</span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex border-b">
        <button
          onClick={handleLike}
          disabled={!user || isLiking}
          className={`flex-1 flex items-center justify-center py-3 space-x-2 transition-colors ${
            hasLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-gray-800'
          } disabled:opacity-50`}
        >
          <FiHeart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
          <span>Me gusta</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center py-3 space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FiMessageCircle size={20} />
          <span>Comentar</span>
        </button>
      </div>

      {/* Comentarios */}
      {showComments && (
        <CommentList
          comments={localPost.comments}
          onAdd={addComment}
          postId={localPost._id}
          postAuthorId={localPost.author._id}
        />
      )}
    </article>
  );
}