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
// FollowButton.jsx - RETURN COMPLETO Y MEJORADO

return (
  <button
    onClick={handleFollowClick}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    disabled={isLoading || !currentUserId}
    className={`
      relative flex items-center justify-center rounded-lg font-semibold 
      transition-all duration-300 shadow-sm hover:shadow-md transform 
      disabled:opacity-50 disabled:cursor-not-allowed text-sm
      w-auto
      ${size === 'small' ? 'h-8 px-2' : size === 'large' ? 'h-10 px-4 text-base' : 'h-9 px-3'} 
      
      ${followingNow 
        ? (isHovering
          // Estado: Siguiendo (Hover/Dejar de seguir)
          ? "bg-red-500 text-white border border-red-500 hover:bg-red-600 active:scale-95"
          // Estado: Siguiendo (Default)
          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600")
        // Estado: Seguir
        : "bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 hover:scale-105 active:scale-95"
      }
      ${isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95'}
    `}
  >
    {/* Contenido (Ícono + Texto) */}
    <div className="relative z-10 flex items-center gap-1.5">
      {isLoading ? (
        <div className={`${loadingSize} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
      ) : followingNow ? (
        <>
          {/* Ícono dinámico: Check si sigues, X si harás unfollow */}
          {isHovering 
            ? <FiUserX size={18} className="transition-transform duration-300" />
            : <FiUserCheck size={18} className="transition-transform duration-300" />
          }
          <span className="whitespace-nowrap">
            {isHovering ? "Dejar de seguir" : "Siguiendo"}
          </span>
        </>
      ) : (
        <>
          {/* Botón Seguir */}
          <FiUserPlus size={18} className="transition-transform duration-300" />
          <span className="whitespace-nowrap">Seguir</span>
        </>
      )}
    </div>
  </button>
);
}