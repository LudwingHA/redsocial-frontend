import React, { useState, useEffect } from 'react';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { useSocket } from '../../auth/context/SocketContext';
import { postAPI } from '../../api/api';
import { CommentList } from './CommentList';
import { PostMenu } from './PostMenu';
import { URL_SERVER } from '../../api/url';
import { FollowButton } from '../FollowButton';
import { Link } from 'react-router-dom';

export function PostCard({ post }) {
  const [localPost, setLocalPost] = useState({
    ...post,
    likesCount: post.likes?.length || 0
  });
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  // Actualiza localPost si la prop post cambia
  useEffect(() => {
    setLocalPost({
      ...post,
      likesCount: post.likes?.length || 0
    });
  }, [post]);

  // Función para dar like
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

        // Emitir evento socket
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

  // Función para agregar comentario
  const addComment = async (content) => {
    try {
      const res = await postAPI.addComment(localPost._id, content);
      if (res.success) {
        setLocalPost((prev) => ({
          ...prev,
          comments: [...prev.comments, res.comment],
        }));

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

  // Saber si el usuario ya dio like
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
    <article className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
      {/* Header del Post */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Link to={`/profile/${localPost.author._id}`}> 
              <img
                src={`${URL_SERVER}${localPost.author.avatar}`}
                alt={localPost.author.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white"></div>

          </div>
          <div>
            <h3 className="font-bold text-gray-80 flex items-center gap-3 ">{localPost.author.username}{user.id != localPost.author._id ? (<FollowButton currentUserId={user.id} targetUserId={localPost.author._id} />) : ""}</h3>
            <p className="text-sm text-gray-500">{formatDate(localPost.createdAt)}</p>
          </div>
        </div>
        <PostMenu post={localPost} />
      </div>

      {/* Contenido del Post */}
      <div className="p-6">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{localPost.content}</p>
        {localPost.image && (
          <div className="mt-4 rounded-xl overflow-hidden shadow-lg">
            <img
              src={`${URL_SERVER}${localPost.image}`}
              alt="Post content"
              className="w-full h-auto max-h-96 object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex justify-between text-sm text-gray-600">
          <span className="font-medium">{localPost.likesCount} me gusta</span>
          <span className="font-medium">{localPost.comments?.length || 0} comentarios</span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={!user || isLiking}
          className={`flex-1 flex items-center justify-center py-4 space-x-2 transition-all duration-300 ${hasLiked
              ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-500 hover:text-red-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            } disabled:opacity-50`}
        >
          <FiHeart size={22} fill={hasLiked ? 'currentColor' : 'none'} />
          <span className="font-medium">Me gusta</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center py-4 space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all duration-300"
        >
          <FiMessageCircle size={22} />
          <span className="font-medium">Comentar</span>
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
