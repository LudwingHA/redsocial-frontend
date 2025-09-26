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
  <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-gray-700/60 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          Tu Feed {isConnected ? "🟢" : "🔴"}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm">Conectado con tus amigos</p>
      </div>
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-2 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg transition-all duration-300 border border-slate-200/60 dark:border-gray-600/60 disabled:opacity-50"
      >
        <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        <span className="font-medium">Actualizar</span>
      </button>
    </div>

    <PostComposer onPosted={handlePosted} />
    
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>

    {hasMore && (
      <div className="flex justify-center pt-4">
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg transition-all duration-300 border border-slate-200/60 dark:border-gray-600/60 disabled:opacity-50 font-medium"
        >
          {loading ? 'Cargando...' : 'Cargar más'}
        </button>
      </div>
    )}
  </div>
);
}
export default FeedPage