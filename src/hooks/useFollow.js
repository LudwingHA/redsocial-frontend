import { useState } from "react";
import { userAPI } from "../api/api";

export function useFollow(currentUserId) {
  const [following, setFollowing] = useState([]);

  const follow = async (targetId) => {
    await userAPI.followUser(targetId);
    setFollowing(prev => [...prev, targetId]);
  };

  const unfollow = async (targetId) => {
    await userAPI.unfollowUser(targetId);
    setFollowing(prev => prev.filter(id => id !== targetId));
  };

  const fetchFollowing = async () => {
    const users = await userAPI.getFollowing(currentUserId);
    setFollowing(users.map(u => u._id));
  };

  return { following, follow, unfollow, fetchFollowing };
}
