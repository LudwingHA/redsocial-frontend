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
  <div className="max-w-2xl mx-auto space-y-4 pb-20 lg:pb-4">
 
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <StoryViewer />
    </div>


    <PostComposer onPosted={handlePosted} />


    <div className="flex justify-between items-center px-2">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
        Inicio
      </h2>
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-600 disabled:opacity-50 text-sm font-medium"
      >
        <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
        <span className="hidden sm:inline">Actualizar</span>
      </button>
    </div>


    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>


    {hasMore && (
      <div className="flex justify-center pt-6">
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl transition-all duration-300 font-medium flex items-center gap-2 border border-gray-200 dark:border-gray-600"
        >
          {loading ? (
            <>
              <FiRefreshCw size={18} className="animate-spin" />
              <span>Cargando...</span>
            </>
          ) : (
            <span>Ver más publicaciones</span>
          )}
        </button>
      </div>
    )}
  </div>
);
}
export default FeedPage;
