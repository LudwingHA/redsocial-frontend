import React from "react";
import { FiPlus } from "react-icons/fi";
import { URL_SERVER } from "../../api/url";
import { StoryUploader } from "./StoryUploader";

export function StoriesList({ stories, onStoryClick, currentUser }) {
  // 🚀 CORRECCIÓN: El 'StoryUploader' (Tu Story) debe mostrarse siempre.
  const storyList = stories || []; 

  if (!currentUser) return null; 

return (
  <div className="flex space-x-4 pb-2 overflow-x-auto custom-scrollbar">
    {/* 🎯 Tu Story (StoryUploader) siempre va primero */}
    <StoryUploader currentUser={currentUser} />  

    {/* Stories de otros usuarios */}
    {storyList.map((story, index) => (
      <div 
        key={story._id} 
        className="flex flex-col items-center flex-shrink-0 space-y-1 cursor-pointer group w-16"
        onClick={() => onStoryClick(index)}
      >
        <div className={`w-16 h-16 rounded-full p-0.5 transition-all duration-300 ${
            story.views?.some(view => view.user === currentUser?.id) 
              ? "bg-gray-300 dark:bg-gray-600"
              : "bg-gradient-to-r from-yellow-400 to-pink-500 group-hover:from-yellow-500 group-hover:to-pink-600"
          }`}>
          <img
            src={story.user?.avatar ? `${URL_SERVER}${story.user.avatar}` : "/default-avatar.png"}
            alt={story.user?.username}
            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-800"
          />
        </div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-full">
          {story.user?.username}
        </span>
      </div>
    ))}
  </div>
);
}