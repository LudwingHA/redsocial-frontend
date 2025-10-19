import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useSocket } from "../../auth/context/SocketContext";
import { postAPI } from "../../api/api";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import { StoryUploader } from "../Story/StoryUploader";
import { StoryViewer } from "../Story/StoryViewer";

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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Stories Section - Minimalista y al inicio */}
      <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/80 shadow-md">
        <StoryViewer />
      </div>

      {/* Post Composer - Ahora justo debajo de las stories */}
      <section className="z-0">
        <PostComposer onPosted={handlePosted} />
      </section>
      
      {/* Botón de Refrescar - Movido a una posición más discreta */}
      <div className="flex justify-between items-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white hidden sm:block">
          Novedades
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          aria-label="Actualizar Feed"
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-all duration-300 border border-slate-200/60 dark:border-gray-600/60 disabled:opacity-50 text-sm font-medium"
        >
          <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>


      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {/* Load More Button - Se mantiene igual, es funcional */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/30 disabled:opacity-50 font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <FiRefreshCw size={18} className="animate-spin" />
                <span>Cargando...</span>
              </>
            ) : (
              <span>Cargar más posts</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
export default FeedPage;
