import React, { useState, useEffect } from "react";
import { useFollow } from "../hooks/useFollow";
import { FiUserPlus, FiUserCheck, FiUserX } from "react-icons/fi";

export function FollowButton({ currentUserId, targetUserId, size = "medium" }) {
  const { following, follow, unfollow, fetchFollowing, isFollowing } = useFollow(currentUserId);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (currentUserId) fetchFollowing();
  }, [currentUserId]);

  const handleFollowClick = async () => {
    if (!currentUserId || isLoading) return;
    setIsLoading(true);
    try {
      if (isFollowing(targetUserId)) await unfollow(targetUserId);
      else await follow(targetUserId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeConfig = {
    small: { padding: "px-3 py-1.5", text: "text-sm", iconSize: 14, loadingSize: "w-3 h-3" },
    medium: { padding: "px-4 py-2", text: "text-base", iconSize: 16, loadingSize: "w-4 h-4" },
    large: { padding: "px-6 py-3", text: "text-lg", iconSize: 18, loadingSize: "w-5 h-5" }
  };
  const { padding, text, iconSize, loadingSize } = sizeConfig[size];

  const followingNow = isFollowing(targetUserId);

  return (
    <button
      onClick={handleFollowClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading || !currentUserId}
      className={`flex items-center space-x-2 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${padding} ${text} ${
        followingNow ? (isHovering
          ? "bg-red-500 text-white"
          : "bg-gray-200 text-gray-700 border border-gray-300") 
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {isLoading ? (
        <div className={`${loadingSize} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
      ) : followingNow ? (
        <>
          {isHovering ? <FiUserX size={iconSize} /> : <FiUserCheck size={iconSize} />}
          <span>{isHovering ? "Dejar de seguir" : "Siguiendo"}</span>
        </>
      ) : (
        <>
          <FiUserPlus size={iconSize} />
          <span>Seguir</span>
        </>
      )}
    </button>
  );
}
