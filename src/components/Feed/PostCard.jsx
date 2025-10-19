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
  <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
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

    {/* Post Image */}
    {localPost.image && (
      <div className="aspect-square bg-black flex justify-center items-center">
        <img
          src={`${URL_SERVER}${localPost.image}`}
          alt="Post content"
          className="w-full h-full object-cover"
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

        <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 transform rotate-45">
          <FiSend size={24} />
        </button>
      </div>

      <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300">
        <FiBookmark size={24} />
      </button>
    </div>

    {/* Likes Count */}
    <div className="px-4 pb-2">
      <span className="text-sm font-semibold text-gray-900 dark:text-white">
        {localPost.likesCount} me gusta
      </span>
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
);
};
