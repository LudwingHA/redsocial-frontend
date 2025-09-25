import { useState, useEffect } from "react";
import { userAPI } from "../api/api";

export function useFollow(currentUserId) {
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (currentUserId) fetchFollowing();
  }, [currentUserId]);

  const fetchFollowing = async () => {
    try {
      const users = await userAPI.getFollowing(currentUserId);
      setFollowing(users.map(u => u._id));
    } catch (err) {
      console.error("Error cargando following:", err);
    }
  };

  const follow = async (targetId) => {
    try {
      const res = await userAPI.followUser(targetId);
      if (res.success !== false) { // Ajusta según tu API
        setFollowing(prev => [...prev, targetId]);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error al seguir usuario:", err);
      return false;
    }
  };

  const unfollow = async (targetId) => {
    try {
      const res = await userAPI.unfollowUser(targetId);
      if (res.success !== false) {
        setFollowing(prev => prev.filter(id => id !== targetId));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error al dejar de seguir:", err);
      return false;
    }
  };

  return { following, follow, unfollow, fetchFollowing, isFollowing: (id) => following.includes(id) };
}
