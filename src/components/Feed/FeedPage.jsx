import React, { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { useSocket } from '../../auth/context/SocketContext';
import { postAPI } from '../../api/api';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';

export function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    loadPage(1);
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("🔌 Configurando listeners del feed con socket global");

    socket.on("newPost", (post) => {
      setPosts((prev) => [post, ...prev]);
    });

    socket.on("postLiked", ({ postId, likes }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes } : p))
      );
    });

    socket.on("newComment", ({ postId, comment }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: [...p.comments, comment] } : p
        )
      );
    });

    return () => {
      if (socket) {
        socket.off("newPost");
        socket.off("postLiked");
        socket.off("newComment");
      }
    };
  }, [socket, isConnected]);

  const loadPage = async (p) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await postAPI.getPosts(p, 10);
      if (res.success) {
        if (p === 1) {
          setPosts(res.posts || []);
          setHasMore(res.posts.length === 10);
        } else {
          setPosts((prev) => [...prev, ...(res.posts || [])]);
          setHasMore(res.posts.length === 10);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage);
  };

  const handleRefresh = () => {
    setPage(1);
    loadPage(1);
  };

  const handlePosted = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    if (socket && isConnected) {
      socket.emit("newPost", newPost);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Feed {isConnected ? "🟢" : "🔴"}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      <PostComposer onPosted={handlePosted} />
      
      <div className="space-y-4 mt-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}