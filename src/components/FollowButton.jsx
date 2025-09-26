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
    small: { 
      padding: "px-2 py-2", 
      text: "text-sm", 
      iconSize: 4, 
      loadingSize: "w-2 h-2" 
    },
    medium: { 
      padding: "px-3 py-3", 
      text: "text-sm", 
      iconSize: 6, 
      loadingSize: "w-3 h-3" 
    },
    large: { 
      padding: "px-4 py-4", 
      text: "text-base", 
      iconSize: 8, 
      loadingSize: "w-4 h-4" 
    }
  };
  
  const { padding, text, iconSize, loadingSize } = sizeConfig[size];
  const followingNow = isFollowing(targetUserId);

  return (
    <button
      onClick={handleFollowClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading || !currentUserId}
      className={`
        relative flex items-center justify-center gap-2 rounded-full font-semibold 
        transition-all duration-400 shadow-lg hover:shadow-xl transform 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        group overflow-hidden backdrop-blur-sm
        ${padding} ${text}
        ${followingNow 
          ? (isHovering
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-500"
            : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600")
          : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border border-blue-500"
        }
        ${!isLoading && 'hover:scale-105 active:scale-95'}
      `}
    >
      {/* Efecto de brillo al hover */}
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-150"></div>
      
      {/* Contenido */}
      <div className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <div className={`${loadingSize} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
        ) : followingNow ? (
          <>
            {isHovering 
              ? <FiUserX size={iconSize} className="transition-transform duration-300" />
              : <FiUserCheck size={iconSize} className="transition-transform duration-300" />
            }
            <span className="whitespace-nowrap">
              {isHovering ? "Dejar de seguir" : "Siguiendo"}
            </span>
          </>
        ) : (
          <>
            <FiUserPlus size={iconSize} className="transition-transform duration-300 group-hover:scale-110" />
            <span className="whitespace-nowrap">Seguir</span>
          </>
        )}
      </div>
    </button>
  );
}