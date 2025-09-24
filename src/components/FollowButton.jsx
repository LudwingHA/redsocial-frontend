// frontend/src/components/FollowButton.jsx
import React, { useEffect } from "react";
import { useFollow } from "../hooks/useFollow";


export function FollowButton({ currentUserId, targetUserId }) {
  const { following, follow, unfollow, fetchFollowing } = useFollow(currentUserId);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const isFollowing = following.includes(targetUserId);

  return (
    <button
      onClick={() => (isFollowing ? unfollow(targetUserId) : follow(targetUserId))}
      className={`px-4 py-2 rounded ${isFollowing ? "bg-gray-300" : "bg-blue-500 text-white"}`}
    >
      {isFollowing ? "Dejar de seguir" : "Seguir"}
    </button>
  );
}
