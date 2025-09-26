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
  <article className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 dark:border-gray-700/60 overflow-hidden transition-all duration-300 hover:shadow-md">
    <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-gray-700/60">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${localPost.author._id}`} className="flex items-center gap-3">
          <img
            src={`${URL_SERVER}${localPost.author.avatar}`}
            alt={localPost.author.username}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-gray-600 shadow-sm"
          />
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{localPost.author.username}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(localPost.createdAt)}</p>
          </div>
        </Link>
        {user.id !== localPost.author._id && <FollowButton currentUserId={user.id} targetUserId={localPost.author._id} />}
      </div>
      <PostMenu post={localPost} />
    </div>

    <div className="p-4">
      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{localPost.content}</p>
      {localPost.image && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <img
            src={`${URL_SERVER}${localPost.image}`}
            alt="Post content"
            className="w-full h-auto max-h-80 object-cover"
          />
        </div>
      )}
    </div>

    <div className="px-4 py-2 bg-slate-50/50 dark:bg-gray-700/50 border-y border-slate-200/60 dark:border-gray-700/60">
      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>{localPost.likesCount} me gusta</span>
        <span>{localPost.comments?.length || 0} comentarios</span>
      </div>
    </div>

    <div className="flex">
      <button
        onClick={handleLike}
        disabled={!user || isLiking}
        className={`flex-1 flex items-center justify-center gap-2 py-3 transition-all duration-300 ${
          hasLiked
            ? 'text-rose-500 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-gray-700/50'
        } disabled:opacity-50`}
      >
        <FiHeart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
        <span className="font-medium">Me gusta</span>
      </button>

      <button
        onClick={() => setShowComments(!showComments)}
        className="flex-1 flex items-center justify-center gap-2 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-all duration-300"
      >
        <FiMessageCircle size={20} />
        <span className="font-medium">Comentar</span>
      </button>
    </div>

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
