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
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header con gradiente moderno */}
      <div className="flex items-center justify-between mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Tu Feed {isConnected ? "🟢" : "🔴"}
          </h2>
          <p className="text-blue-100 text-sm">Conectado con tus amigos</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 disabled:opacity-50"
        >
          <FiRefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span className="font-medium">Actualizar</span>
        </button>
      </div>

      <PostComposer onPosted={handlePosted} />
      
      <div className="space-y-6 mt-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 font-medium"
          >
            {loading ? 'Cargando...' : 'Cargar más publicaciones'}
          </button>
        </div>
      )}
    </div>
  );
}