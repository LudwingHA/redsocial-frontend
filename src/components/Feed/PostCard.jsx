import React, { useState, useEffect } from 'react';
import { FiBookmark, FiHeart, FiMessageCircle, FiSend } from 'react-icons/fi';
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
  <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200/80 dark:border-gray-700/80 overflow-hidden transition-all duration-300">
    {/* Post Header */}
    <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${localPost.author._id}`} className="flex items-center gap-3 group">
          <img
            src={`${URL_SERVER}${localPost.author.avatar}`}
            alt={localPost.author.username}
            className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-600 group-hover:border-blue-500 transition-all duration-300 shadow-sm"
          />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">{localPost.author.username}</h3>
            {/* Fecha más discreta y abajo */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatDate(localPost.createdAt)}</p>
          </div>
        </Link>
        {/* {user.id !== localPost.author._id && <FollowButton currentUserId={user.id} targetUserId={localPost.author._id} />} <-- Si no va en el header, va aquí o en el menú */}
      </div>
      <PostMenu post={localPost} />
    </div>

    {/* Post Content - Imagen primero, luego texto (patrón de Instagram) */}
    {localPost.image && (
      <div className="w-full bg-black flex justify-center items-center">
        <img
          src={`${URL_SERVER}${localPost.image}`}
          alt="Post content"
          // Clases para que la imagen se vea bien en varios tamaños
          className="w-full h-auto max-h-[600px] object-cover" 
        />
      </div>
    )}

    {/* Action Buttons - Botones de interacción, ahora separados de la barra de likes */}
    <div className="flex items-center justify-between px-4 py-2 sm:px-5">
      <div className="flex items-center gap-3">
        {/* Botón de Like */}
        <button
          onClick={handleLike}
          disabled={!user || isLiking}
          aria-label="Me gusta"
          className={`p-1 transition-all duration-300 ${
            hasLiked
              ? 'text-rose-500 dark:text-rose-400 hover:text-rose-600'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <FiHeart size={24} fill={hasLiked ? 'currentColor' : 'none'} />
        </button>

        {/* Botón de Comentar */}
        <button
          onClick={() => setShowComments(!showComments)}
          aria-label="Comentar"
          className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
        >
          <FiMessageCircle size={24} />
        </button>
        
        {/* Botón de Compartir (Simulado con FiSend) */}
        <button 
          aria-label="Compartir"
          className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 transform rotate-45"
        >
          <FiSend size={24} />
        </button>
      </div>
      
      {/* Botón de Guardar (Bookmark) */}
      <button 
        aria-label="Guardar publicación"
        className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300"
      >
        <FiBookmark size={24} />
      </button>
    </div>

    {/* Stats Bar - Debajo de los botones (Patrón Instagram) */}
    <div className="px-4 pb-2 sm:px-5">
      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-blue-500 cursor-pointer">
        {localPost.likesCount} me gusta
      </span>
    </div>
    
    {/* Post Text - Texto de la publicación (Título/Caption) */}
    <div className="px-4 pb-4 sm:px-5">
      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
        <span className="font-bold mr-2">{localPost.author.username}</span>
        {localPost.content}
      </p>
      <button onClick={() => setShowComments(true)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors mt-1">
        Ver los {localPost.comments?.length || 0} comentarios
      </button>
    </div>


    {/* Comment List Section */}
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
};
