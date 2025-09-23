import { useState } from "react";
import { FaHeart, FaRegHeart, FaComment, FaPaperPlane, FaEllipsisH } from 'react-icons/fa';

export default function Post({ post, onLike, onComment, currentUserId }) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Verificaciones de seguridad
  if (!post || !post.user) {
    return null;
  }

  const isLiked = post.likes && post.likes.includes(currentUserId);
  const likeCount = post.likes ? post.likes.length : 0;
  const commentCount = post.comments ? post.comments.length : 0;

  const handleCommentSubmit = async (e) => {
    if (e.key === "Enter" && commentText.trim()) {
      await onComment(post._id, commentText);
      setCommentText("");
    }
  };

  const handleCommentClick = async () => {
    if (commentText.trim()) {
      await onComment(post._id, commentText);
      setCommentText("");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Ahora';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-background-secondary border border-border rounded-xl p-4 mb-4 shadow-sm">
      {/* Header del post */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={`http://localhost:4000${post.user.avatar}`}
            alt={post.user.username}
            className="w-10 h-10 rounded-full border-2 border-primary-500"
          />
          <div>
            <div className="font-semibold text-text-primary">{post.user.username}</div>
            <div className="text-xs text-text-tertiary">{formatTime(post.createdAt)}</div>
          </div>
        </div>
        <button className="text-text-tertiary hover:text-text-primary">
          <FaEllipsisH />
        </button>
      </div>
      
      {/* Contenido del post */}
      <p className="text-text-primary mb-3 whitespace-pre-wrap">{post.content}</p>
      
      {/* Imagen del post */}
      {post.image && (
        <img
          src={`http://localhost:4000${post.image}`}
          alt="Post content"
          className="w-full rounded-lg mb-3 border border-border max-h-96 object-cover"
        />
      )}
      
      {/* Stats y acciones */}
      <div className="flex items-center justify-between text-sm text-text-tertiary mb-3">
        <div className="flex space-x-4">
          <span>{likeCount} me gusta</span>
          <span>{commentCount} comentarios</span>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="flex border-t border-border pt-3 space-x-2">
        <button 
          onClick={() => onLike(post._id)}
          className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${
            isLiked ? 'text-red-500 bg-red-50' : 'text-text-tertiary hover:text-red-500'
          }`}
        >
          {isLiked ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
          Me gusta
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center py-2 rounded-lg text-text-tertiary hover:text-blue-500 transition-all"
        >
          <FaComment className="mr-2" />
          Comentar
        </button>
      </div>
      
      {/* Sección de comentarios */}
      {showComments && (
        <div className="mt-3 border-t border-border pt-3">
          {/* Lista de comentarios */}
          {post.comments && post.comments.map((comment, index) => (
            <div key={index} className="flex items-start space-x-2 mb-3">
              <img
                src={`http://localhost:4000${comment.user.avatar}`}
                alt={comment.user.username}
                className="w-6 h-6 rounded-full mt-1"
              />
              <div className="flex-1 bg-background-primary rounded-lg p-2">
                <div className="font-semibold text-text-primary text-sm">
                  {comment.user.username}
                </div>
                <div className="text-text-secondary text-sm">{comment.text}</div>
              </div>
            </div>
          ))}
          
          {/* Input de comentario */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Escribe un comentario..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleCommentSubmit}
              className="flex-1 p-2 bg-background-primary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button 
              onClick={handleCommentClick}
              disabled={!commentText.trim()}
              className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-all"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}