// useProfileFeed.jsx - Versión corregida
import { useState, useEffect, useCallback } from 'react';
import { postAPI, userAPI } from '../api/api';
import { useSocket } from '../auth/context/SocketContext';

export function useProfileFeed(userIdParam = null) {
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { socket, isConnected } = useSocket();

  // Función para cargar la info del usuario
  const loadUserInfo = useCallback(async () => {
    if (!userIdParam) return;
    try {
      const res = await userAPI.getProfile(userIdParam);
      if (res.success) setUserInfo(res.user);
    } catch (err) {
      console.error('Error al cargar info del usuario:', err);
    }
  }, [userIdParam]);

  // Función para cargar posts
  const loadPosts = useCallback(async (p = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      let res;
      if (userIdParam) {
        res = await postAPI.getUserPosts(userIdParam, p, 10);
      } else {
        res = await postAPI.getPosts(p, 10);
      }

      if (res.success) {
        if (p === 1) setPosts(res.posts);
        else setPosts(prev => [...prev, ...res.posts]);
        setHasMore(res.posts.length === 10);
      }
    } catch (err) {
      console.error('Error al cargar posts:', err);
    } finally {
      setLoading(false);
    }
  }, [userIdParam, loading]);

  // Refrescar todo (info + posts)
  const refreshProfile = useCallback(() => {
    setPage(1);
    return Promise.all([loadPosts(1), loadUserInfo()]);
  }, [loadPosts, loadUserInfo]);

  // Cargar más posts (paginación)
  const loadMorePosts = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  }, [page, loadPosts]);

  // Socket: escuchar likes y comentarios en tiempo real
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewComment = ({ postId, comment }) => {
      setPosts(prev =>
        prev.map(p => (p._id === postId ? { ...p, comments: [...p.comments, comment] } : p))
      );
    };

    const handlePostLiked = ({ postId, likes }) => {
      setPosts(prev =>
        prev.map(p => (p._id === postId ? { ...p, likes } : p))
      );
    };

    socket.on('newComment', handleNewComment);
    socket.on('postLiked', handlePostLiked);

    return () => {
      socket.off('newComment', handleNewComment);
      socket.off('postLiked', handlePostLiked);
    };
  }, [socket, isConnected]);

  // ✅ CORREGIDO: Eliminar refreshProfile de las dependencias
  useEffect(() => {
    // Cargar datos iniciales directamente
    setPage(1);
    loadPosts(1);
    loadUserInfo();
  }, [userIdParam]); // ← Solo depende de userIdParam

  return {
    userInfo,
    posts,
    loading,
    hasMore,
    refreshProfile,
    loadMorePosts,
  };
}