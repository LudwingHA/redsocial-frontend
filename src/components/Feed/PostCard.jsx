import React, { useState, useEffect } from 'react';
import { FiBookmark, FiHeart, FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
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
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
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

  // Modal de Likes
  const LikesModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Me gusta
          </h3>
          <button
            onClick={() => setShowLikesModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiX size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {localPost.likes?.map((like) => (
            <div key={like._id || like} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <div className="flex items-center gap-3">
                <img
                  src={`${URL_SERVER}${like.avatar || like.author?.avatar}`}
                  alt={like.username || like.author?.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {like.username || like.author?.username}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {like.name || like.author?.name}
                  </p>
                </div>
              </div>
              <FollowButton userId={like._id || like} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Modal de Compartir
  const ShareModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Compartir publicación
          </h3>
          <button
            onClick={() => setShowShareModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiX size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <button className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
            Compartir en Facebook
          </button>
          <button className="w-full p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium">
            Compartir en Twitter
          </button>
          <button className="w-full p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
            Copiar enlace
          </button>
          <button 
            onClick={() => navigator.share?.({
              title: 'Mira esta publicación',
              text: localPost.content,
              url: window.location.href,
            })}
            className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
          >
            Compartir con...
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de Post Completo (Instagram Style) - CORREGIDO
  const PostModal = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row">
        {/* Botón cerrar */}
        <button
          onClick={() => setShowPostModal(false)}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <FiX size={24} />
        </button>

        {/* Imagen del post */}
        <div className="lg:w-3/5 bg-black flex items-center justify-center relative">
          {localPost.image && (
            <img
              src={`${URL_SERVER}${localPost.image}`}
              alt="Post content"
              className="w-full h-full max-h-[80vh] object-contain"
            />
          )}
        </div>

        {/* Contenido lateral derecho */}
        <div className="lg:w-2/5 flex flex-col h-full">
          {/* Header del post */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Link
                to={`/profile/${localPost.author._id}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                onClick={() => setShowPostModal(false)}
              >
                <img
                  src={`${URL_SERVER}${localPost.author.avatar}`}
                  alt={localPost.author.username}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {localPost.author.username}
                  </h3>
                </div>
              </Link>
            </div>
            <PostMenu post={localPost} />
          </div>

          {/* Comentarios - SOLO CommentList sin input duplicado */}
          <div className="flex-1 overflow-y-auto">
            {/* Contenido del post */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <img
                  src={`${URL_SERVER}${localPost.author.avatar}`}
                  alt={localPost.author.username}
                  className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white text-sm">
                    <span className="font-semibold mr-2">{localPost.author.username}</span>
                    {localPost.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(localPost.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de comentarios - CON input incluido */}
            <CommentList
              comments={localPost.comments}
              onAdd={addComment}
              postId={localPost._id}
              postAuthorId={localPost.author._id}
              showInput={true}
              autoFocus={true}
            />
          </div>

          {/* Acciones e info - SIN input duplicado */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            {/* Botones de acción */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={!user || isLiking}
                  className={`p-1 transition-all duration-300 ${
                    hasLiked
                      ? 'text-red-500 scale-110'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiHeart size={24} fill={hasLiked ? 'currentColor' : 'none'} />
                </button>

                <button
                  onClick={() => {
                    // Focus en el input de comentarios dentro del CommentList
                    const commentInput = document.querySelector('.comment-input input, .comment-input textarea');
                    commentInput?.focus();
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
                >
                  <FiMessageCircle size={24} />
                </button>

                <button 
                  onClick={() => setShowShareModal(true)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 transform rotate-45"
                >
                  <FiSend size={24} />
                </button>
              </div>

              <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300">
                <FiBookmark size={24} />
              </button>
            </div>

            {/* Contador de likes */}
            <button
              onClick={() => setShowLikesModal(true)}
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors block"
            >
              {localPost.likesCount} me gusta
            </button>

            {/* Fecha */}
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              {formatDate(localPost.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Post Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/profile/${localPost.author._id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src={`${URL_SERVER}${localPost.author.avatar}`}
                alt={localPost.author.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {localPost.author.username}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(localPost.createdAt)}
                </p>
              </div>
            </Link>
          </div>
          <PostMenu post={localPost} />
        </div>

        {/* Post Image - Clickable */}
        {localPost.image && (
          <div className="aspect-square bg-black flex justify-center items-center cursor-pointer">
            <img
              src={`${URL_SERVER}${localPost.image}`}
              alt="Post content"
              className="w-full h-full object-cover hover:opacity-95 transition-opacity"
              onClick={() => setShowPostModal(true)}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={!user || isLiking}
              className={`p-1 transition-all duration-300 ${
                hasLiked
                  ? 'text-red-500 scale-110'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FiHeart size={24} fill={hasLiked ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
            >
              <FiMessageCircle size={24} />
            </button>

            <button 
              onClick={() => setShowShareModal(true)}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 transform rotate-45"
            >
              <FiSend size={24} />
            </button>
          </div>

          <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300">
            <FiBookmark size={24} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowLikesModal(true)}
            className="text-sm font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {localPost.likesCount} me gusta
          </button>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-gray-900 dark:text-white text-sm">
            <span className="font-semibold mr-2">{localPost.author.username}</span>
            {localPost.content}
          </p>
         
          {localPost.comments?.length > 0 && (
            <button
              onClick={() => setShowComments(true)}
              className="text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300 mt-1 transition-colors"
            >
              Ver los {localPost.comments.length} comentarios
            </button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentList
            comments={localPost.comments}
            onAdd={addComment}
            postId={localPost._id}
            postAuthorId={localPost.author._id}
          />
        )}
      </article>

      {/* Modales */}
      {showLikesModal && <LikesModal />}
      {showShareModal && <ShareModal />}
      {showPostModal && <PostModal />}
    </>
  );
}