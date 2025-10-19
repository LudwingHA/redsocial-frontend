import React from "react";
import { URL_SERVER } from "../../api/url";
import { StoryUploader } from "./StoryUploader";

export function StoriesList({ stories, onStoryClick, currentUser }) {
  const storyList = stories || [];
  
  if (!currentUser) return null;
// StoriesList.jsx - RETURN Mejorado
return (
  // Contenedor principal: Se hace transparente en desktop y tiene scroll horizontal
  <div className="w-full pt-4 pb-2 lg:pt-6 lg:pb-3 bg-white dark:bg-gray-900 sticky top-0 z-20">
    <div className="flex space-x-3 px-4 sm:px-0 max-w-4xl mx-auto overflow-x-auto whitespace-nowrap custom-scrollbar-hidden">
      <StoryUploader currentUser={currentUser} />
      
      {storyList.map((story, index) => (
        <StoryItem 
          key={story._id} 
          story={story}
          index={index}
          currentUser={currentUser}
          onStoryClick={onStoryClick}
        />
      ))}
    </div>
  </div>
);

// StoryItem.jsx - RETURN Mejorado (Función interna)
function StoryItem({ story, index, currentUser, onStoryClick }) {
  const isViewed = story.views?.some(view => view.user === currentUser?.id);
  
  return (
    <div 
      className="flex flex-col items-center flex-shrink-0 space-y-1.5 cursor-pointer group w-[72px] sm:w-[80px] transition-transform duration-200 hover:scale-105"
      onClick={() => onStoryClick(index)}
    >
      <div className={`relative w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] rounded-full p-[3px] transition-all duration-300 transform group-active:scale-95 ${
        isViewed 
          ? "bg-gray-300/70 dark:bg-gray-700/70" // Borde gris claro si está visto
          : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-md group-hover:shadow-lg" // Degradado si no está visto
      }`}>
        <img
          src={story.user?.avatar ? `${URL_SERVER}${story.user.avatar}` : "/default-avatar.png"}
          alt={story.user?.username}
          className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900 transition-all duration-300" // Borde más grueso para separar el avatar del anillo
        />
        
        {/* Indicador de 'Nuevo' (se mantiene, pero se hace más pequeño y discreto) */}
        {!isViewed && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse-slow"></div>
        )}
      </div>
      
      <span className={`text-xs text-center truncate w-full ${
        isViewed ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200 font-medium"
      }`}>
        {story.user?.username.length > 9 ? story.user?.username.substring(0, 8) + '...' : story.user?.username}
      </span>
    </div>
  );
}
}