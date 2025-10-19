import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../../auth/context/SocketContext";
import { storyAPI } from "../../api/api";
import { URL_SERVER } from "../../api/url";
import {
  FiX,
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiPause,
  FiPlay,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../../auth/context/AuthContext";
import { StoriesList } from "./StoriesList";

const STORY_DURATION = 15000;

export function StoryViewer() {
  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");
  const [videoError, setVideoError] = useState(null);
  const { socket } = useSocket();
  const progressRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { user } = useAuth();

  // Agrupar stories por usuario
  const storiesByUser = stories.reduce((acc, story) => {
    const userId = story.user._id;
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(story);
    return acc;
  }, {});

  const userStories = Object.values(storiesByUser);
  const currentUserStories = userStories[currentUserIndex] || [];
  const currentStory = currentUserStories[currentStoryIndex];
  const isLiked = currentStory?.likes?.some((like) => like._id === user?._id);

  const fetchStories = useCallback(async () => {
    try {
      const res = await storyAPI.getStories();
      if (res.success) setStories(res.stories || []);
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Progress bar
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused || isLoading) {
      clearInterval(progressRef.current);
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(percentage);

      if (percentage >= 100) {
        handleNext();
      }
    }, 50);

    return () => clearInterval(progressRef.current);
  }, [currentStoryIndex, currentUserIndex, isOpen, isPaused, isLoading, currentStory]);

  // Manejo de video
  useEffect(() => {
    if (videoRef.current && currentStory?.type === "video") {
      const video = videoRef.current;
      
      const handleLoadStart = () => {
        setIsLoading(true);
        setVideoError(null);
      };
      
      const handleLoadedData = () => {
        setIsLoading(false);
        setHasInteracted(true);
      };
      
      const handleCanPlay = () => {
        setIsLoading(false);
      };
      
      const handleError = (e) => {
        console.error("❌ Video error:", e);
        setIsLoading(false);
        setVideoError("Error al cargar el video");
      };

      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      video.load();
      
      if (!isPaused && hasInteracted) {
        video.play().catch(err => {
          console.log("⚠️ Auto-play prevented:", err);
          setHasInteracted(false);
        });
      }

      return () => {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, [currentStoryIndex, currentUserIndex, currentStory?.type, isPaused, hasInteracted]);

  const handleNext = useCallback(async () => {
    if (!currentStory) return;

    if (user && !currentStory.views?.some((view) => view._id === user._id)) {
      await storyAPI.viewStory(currentStory._id);
    }

    if (currentStoryIndex + 1 < currentUserStories.length) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
      setHasInteracted(false);
      setVideoError(null);
    } else if (currentUserIndex + 1 < userStories.length) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
      setHasInteracted(false);
      setVideoError(null);
    } else {
      handleClose();
    }
  }, [currentStoryIndex, currentUserIndex, currentUserStories.length, userStories.length, currentStory, user]);

  const handlePrev = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
      setHasInteracted(false);
      setVideoError(null);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      const prevUserStories = userStories[currentUserIndex - 1] || [];
      setCurrentStoryIndex(prevUserStories.length - 1);
      setProgress(0);
      setHasInteracted(false);
      setVideoError(null);
    }
  }, [currentStoryIndex, currentUserIndex, userStories]);

  const handleLike = async () => {
    if (!currentStory) return;
    await storyAPI.likeStory(currentStory._id);
  };

  const handleStoryClick = (userIndex, storyIndex = 0) => {
    setCurrentUserIndex(userIndex);
    setCurrentStoryIndex(storyIndex);
    setIsOpen(true);
    setHasInteracted(false);
    setProgress(0);
    setIsPaused(false);
    setVideoError(null);
  };

  // 🎯 FUNCIÓN MEJORADA PARA CERRAR
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsPaused(false);
    setHasInteracted(false);
    setProgress(0);
    setShowMessageInput(false);
    setMessage("");
    setVideoError(null);
    setCurrentStoryIndex(0);
    setCurrentUserIndex(0);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    clearInterval(progressRef.current);
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleVideoInteraction = () => {
    if (!hasInteracted && currentStory?.type === "video") {
      setHasInteracted(true);
      videoRef.current?.play().catch(error => {
        console.error("Error al reproducir:", error);
        setVideoError("Error al reproducir el video");
      });
    }
    togglePause();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    console.log("Enviar mensaje:", message);
    setMessage("");
    setShowMessageInput(false);
  };

  // 🎯 NUEVO: Manejar tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  // 🎯 NUEVO: Cerrar al hacer click fuera del contenido
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Renderizado condicional CORREGIDO
  if (!isOpen) {
    return <StoriesList stories={stories} onStoryClick={handleStoryClick} currentUser={user} />;
  }
return (
  <>
    {/* Mostrar la lista de stories cuando el visor está cerrado */}
    <StoriesList stories={stories} onStoryClick={handleStoryClick} currentUser={user} />
    
    {/* Modal del Story Viewer (Inmersivo) */}
    {isOpen && currentStory && (
      <div 
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-in fade-in"
        onClick={handleBackdropClick}
      >
        <div className="relative w-full h-full max-w-sm mx-auto flex flex-col justify-between" ref={containerRef}>
          
          {/* 1. Progress Bars */}
          <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
            {currentUserStories.map((story, index) => (
              <div key={story._id} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ease-linear ${
                    index < currentStoryIndex 
                      ? "bg-white" 
                      : index === currentStoryIndex 
                      ? "bg-white" 
                      : "bg-transparent"
                  }`}
                  style={{
                    width: index === currentStoryIndex ? `${progress}%` : 
                                  index < currentStoryIndex ? '100%' : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* 2. Header (Avatar, Username, Tiempo, Pausa) */}
          <div className="absolute top-6 left-0 right-0 z-20 px-4">
            <div className="flex items-center justify-between">
              {/* Información del usuario */}
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-9 h-9 rounded-full bg-white p-0.5 flex-shrink-0">
                  <img
                    src={currentStory.user?.avatar ? `${URL_SERVER}${currentStory.user.avatar}` : "/default-avatar.png"}
                    alt={currentStory.user?.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-white font-bold text-sm block truncate">
                    {currentStory.user?.username}
                  </span>
                  <span className="text-gray-300 text-xs block">
                    {currentStory.createdAt ? new Date(currentStory.createdAt).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit", hour12: false,
                    }) : ""}
                  </span>
                </div>
              </div>
              
              {/* Controles de pausa y cierre */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePause}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                  title={isPaused ? "Reproducir" : "Pausar"}
                >
                  {isPaused ? <FiPlay size={20} /> : <FiPause size={20} />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                  title="Cerrar (Esc)"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Contenido del Story y Controles Laterales */}
          <div className="flex-1 relative w-full flex items-center justify-center">
            
            {/* Contenido Media */}
            <div className="relative w-full h-full">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-white"></div>
                </div>
              )}
              {videoError && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/70 text-white p-4">
                    <FiAlertCircle size={32} className="text-red-500 mb-3" />
                    <p className="text-center font-semibold">{videoError}. Intenta deslizar.</p>
                 </div>
              )}

              {currentStory.type === "image" ? (
                <img
                  src={`${URL_SERVER}${currentStory.mediaUrl}`}
                  alt="story"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={`${URL_SERVER}${currentStory.mediaUrl}`}
                  muted
                  autoPlay={!isPaused && hasInteracted}
                  playsInline
                  className="w-full h-full object-contain"
                  onEnded={handleNext}
                  onClick={handleVideoInteraction}
                />
              )}
              
              {/* Texto de la Story (Opcional, si existe) */}
              {currentStory.caption && (
                <div className="absolute bottom-10 left-0 right-0 p-4 z-10 bg-gradient-to-t from-black/50 to-transparent">
                    <p className="text-white text-base font-medium text-center">{currentStory.caption}</p>
                </div>
              )}
            </div>

            {/* Zonas de Clic para Navegación (Superpuestas) */}
            <div className="absolute inset-0 flex justify-between">
              <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); handlePrev(); }}></div>
              <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); handleVideoInteraction(); }}></div>
              <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); handleNext(); }}></div>
            </div>
          </div>
          
          {/* 4. Footer con Acciones */}
          {/* CORRECCIÓN APLICADA: mb-16 eleva el footer sobre la navbar inferior en móvil */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4 mb-16 lg:mb-4 transition-all duration-300">
            <div className="flex items-center space-x-3">
              {/* Input de Mensaje Rápido */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Envía un mensaje..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className="w-full bg-white/20 backdrop-blur-lg border border-white/30 rounded-full px-5 py-3 text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/30 transition-colors text-sm"
                />
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`p-3 rounded-full backdrop-blur-lg transition-all ${
                    isLiked
                      ? "bg-red-500 text-white animate-pop"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                  title="Me gusta"
                >
                  <FiHeart size={20} fill={isLiked ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className={`p-3 rounded-full backdrop-blur-lg transition-all ${
                    message.trim()
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-white/20 text-white/50 cursor-not-allowed"
                  }`}
                  title="Enviar"
                >
                  <FiSend size={20} />
                </button>
              </div>
            </div>
            
            {/* Vistas (Solo si el story es del usuario actual) */}
            {currentStory.user?._id === user?._id && (
              <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/60 transition-colors">
                <FiEye size={16} className="text-white" />
                <span className="text-white text-xs font-semibold">
                  {currentStory.views?.length || 0} Vistas
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    <style jsx global>{`
      .custom-scrollbar-hidden::-webkit-scrollbar {
        display: none;
      }
      .custom-scrollbar-hidden {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
    `}</style>
  </>
);
};