// frontend/src/components/FollowButton.jsx
import React, { useEffect, useState } from "react";
import { useFollow } from "../hooks/useFollow";
import { FiUserPlus, FiUserCheck, FiUserX } from "react-icons/fi";

export function FollowButton({ currentUserId, targetUserId, size = "medium" }) {
  const { following, follow, unfollow, fetchFollowing } = useFollow(currentUserId);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      fetchFollowing();
    }
  }, [currentUserId]);

  const isFollowing = following.includes(targetUserId);

  const handleFollowClick = async () => {
    if (!currentUserId || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollow(targetUserId);
      } else {
        await follow(targetUserId);
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Configuración de tamaños
  const sizeConfig = {
    small: {
      padding: "px-3 py-1.5",
      text: "text-sm",
      iconSize: 6,
      loadingSize: "w-3 h-3"
    },
    medium: {
      padding: "px-4 py-2",
      text: "text-base",
      iconSize: 8,
      loadingSize: "w-4 h-4"
    },
    large: {
      padding: "px-6 py-3",
      text: "text-lg",
      iconSize: 10,
      loadingSize: "w-5 h-5"
    }
  };

  const { padding, text, iconSize, loadingSize } = sizeConfig[size];

  return (
    <button
      onClick={handleFollowClick}
      disabled={isLoading || !currentUserId}
      className={`
        flex items-center space-x-2 rounded-full font-semibold transition-all duration-300 
        shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
        ${padding} ${text}
        ${isFollowing 
          ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300' 
          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
        }
      `}
    >
      {isLoading ? (
        <div className={`${loadingSize} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
      ) : isFollowing ? (
        <>
          <FiUserCheck size={iconSize} />
          <span>Siguiendo</span>
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

// Versión alternativa con efecto de "Dejar de seguir" al hover
export function FollowButtonHover({ currentUserId, targetUserId, size = "medium" }) {
  const { following, follow, unfollow, fetchFollowing } = useFollow(currentUserId);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      fetchFollowing();
    }
  }, [currentUserId]);

  const isFollowing = following.includes(targetUserId);

  const handleFollowClick = async () => {
    if (!currentUserId || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollow(targetUserId);
      } else {
        await follow(targetUserId);
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeConfig = {
    small: {
      padding: "px-3 py-1.5",
      text: "text-sm",
      iconSize: 14,
      loadingSize: "w-3 h-3"
    },
    medium: {
      padding: "px-4 py-2",
      text: "text-base",
      iconSize: 16,
      loadingSize: "w-4 h-4"
    },
    large: {
      padding: "px-6 py-3",
      text: "text-lg",
      iconSize: 18,
      loadingSize: "w-5 h-5"
    }
  };

  const { padding, text, iconSize, loadingSize } = sizeConfig[size];

  return (
    <button
      onClick={handleFollowClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading || !currentUserId}
      className={`
        flex items-center space-x-2 rounded-full font-semibold transition-all duration-300 
        shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
        ${padding} ${text}
        ${isFollowing 
          ? isHovering
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300'
          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
        }
      `}
    >
      {isLoading ? (
        <div className={`${loadingSize} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
      ) : isFollowing ? (
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