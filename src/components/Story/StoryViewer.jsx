import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../../auth/context/SocketContext";
import { storyAPI } from "../../api/api";
import { URL_SERVER } from "../../api/url";
import {
  FiX,
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiMoreVertical,
  FiPause,
  FiPlay,
  FiEye,
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

  // Socket events (mantener igual)
  useEffect(() => {
    if (!socket) return;
    // ... (socket events igual que antes)
  }, [socket]);

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

  // **CORRECCIÓN CRÍTICA: Manejo de video mejorado**
  useEffect(() => {
    if (videoRef.current && currentStory?.type === "video") {
      const video = videoRef.current;
      
      const handleLoadStart = () => {
        console.log("🔄 Video load start");
        setIsLoading(true);
        setVideoError(null);
      };
      
      const handleLoadedData = () => {
        console.log("✅ Video loaded data");
        setIsLoading(false);
        setHasInteracted(true);
      };
      
      const handleCanPlay = () => {
        console.log("🎵 Video can play");
        setIsLoading(false);
      };
      
      const handleError = (e) => {
        console.error("❌ Video error:", {
          error: video.error,
          networkState: video.networkState,
          readyState: video.readyState,
          src: video.src
        });
        setIsLoading(false);
        setVideoError("Error al cargar el video");
      };

      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      // Reset video state cuando cambia el story
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

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsPaused(false);
    setHasInteracted(false);
    setProgress(0);
    setShowMessageInput(false);
    setMessage("");
    setVideoError(null);

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

  // Gestos y teclado (mantener igual)
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    // ... (gestos igual que antes)
  }, [isOpen, handleNext, handlePrev, handleClose, togglePause]);

  if (!isOpen || !currentStory) {
    return <StoriesList stories={stories} onStoryClick={handleStoryClick} currentUser={user} />;
  }

  return (
    <>
      <StoriesList stories={stories} onStoryClick={handleStoryClick} currentUser={user} />
      
      {/* Story Viewer */}
      <div className="fixed inset-0 z-[9999] bg-black">
        <div ref={containerRef} className="relative w-full h-full">
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 z-20 p-3 flex gap-1">
            {userStories.map((userStoryGroup, userIndex) => (
              <div key={userIndex} className="flex-1 flex gap-1">
                {userStoryGroup.map((story, storyIndex) => (
                  <div
                    key={story._id}
                    className={`h-1 rounded-full transition-all duration-100 ${
                      userIndex < currentUserIndex
                        ? "bg-white"
                        : userIndex === currentUserIndex
                        ? storyIndex <= currentStoryIndex
                          ? "bg-white"
                          : "bg-white bg-opacity-40"
                        : "bg-white bg-opacity-40"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-20 px-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <img
                  src={currentStory.user?.avatar ? `${URL_SERVER}${currentStory.user.avatar}` : "/default-avatar.png"}
                  alt={currentStory.user?.username}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-white font-semibold block truncate">
                    {currentStory.user?.username || "Usuario"}
                  </span>
                  <span className="text-gray-300 text-xs block">
                    {currentStory.createdAt ? new Date(currentStory.createdAt).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit",
                    }) : ""}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePause}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  {isPaused ? <FiPlay size={20} /> : <FiPause size={20} />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* **PARTE CRÍTICA - CONTENIDO DEL STORY MEJORADO** */}
          <div className="relative w-full h-full flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}

            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-80">
                <div className="text-center text-white">
                  <div className="text-red-400 mb-2">❌</div>
                  <p className="text-lg font-semibold mb-2">Error con el video</p>
                  <p className="text-sm text-gray-300 mb-4">{videoError}</p>
                  <button
                    onClick={() => {
                      setVideoError(null);
                      setHasInteracted(false);
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                    }}
                    className="px-4 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {currentStory.type === "image" ? (
              <img
                src={`${URL_SERVER}${currentStory.mediaUrl}`}
                alt="story"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error("❌ Error cargando imagen:", currentStory.mediaUrl);
                  e.target.src = "/default-image.png";
                }}
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* **REPRODUCTOR DE VIDEO QUE FUNCIONA** */}
                <video
                  ref={videoRef}
                  src={`${URL_SERVER}${currentStory.mediaUrl}`}
                  muted
                  autoPlay={!isPaused && hasInteracted}
                  playsInline
                  controls={false}
                  className="max-w-full max-h-full object-contain"
                  onEnded={handleNext}
                  onClick={handleVideoInteraction}
                  onLoadedData={() => {
                    console.log("✅ Video cargado correctamente");
                    setHasInteracted(true);
                  }}
                  onError={(e) => {
                    console.error("❌ Error en elemento video:", {
                      src: `${URL_SERVER}${currentStory.mediaUrl}`,
                      error: e.target.error,
                      networkState: e.target.networkState,
                      readyState: e.target.readyState
                    });
                    setVideoError("Error al cargar el video. Intenta con otro formato.");
                  }}
                  onLoadStart={() => console.log("🔄 Cargando video...")}
                  onCanPlay={() => console.log("🎵 Video puede reproducirse")}
                  onCanPlayThrough={() => console.log("🎵 Video puede reproducirse completamente")}
                />
                
                {/* Estado de carga mejorado */}
                {!hasInteracted && currentStory.type === "video" && !videoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p className="text-white text-sm mb-4">Preparando video...</p>
                    <button
                      onClick={() => {
                        setHasInteracted(true);
                        if (videoRef.current) {
                          videoRef.current.play().catch((error) => {
                            console.error("Error al reproducir:", error);
                            setVideoError("No se pudo reproducir el video");
                            videoRef.current.load();
                          });
                        }
                      }}
                      className="px-6 py-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all text-white flex items-center space-x-2"
                    >
                      <FiPlay size={20} />
                      <span>Reproducir</span>
                    </button>
                  </div>
                )}

                {/* Indicador de pausa */}
                {isPaused && hasInteracted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="p-4 bg-black bg-opacity-50 rounded-full">
                      <FiPlay size={40} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Overlay de navegación */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 cursor-pointer" onClick={handlePrev} />
            <div className="flex-1 cursor-pointer" onClick={handleNext} />
          </div>

          {/* Footer con acciones */}
          <div className="absolute bottom-6 left-0 right-0 z-20 px-4">
            <div className="flex items-center justify-between">
              {showMessageInput ? (
                <form onSubmit={handleSendMessage} className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Envía un mensaje..."
                    className="flex-1 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-full px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-white"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors disabled:opacity-50"
                  >
                    <FiSend size={20} />
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Envía un mensaje..."
                      onClick={() => setShowMessageInput(true)}
                      className="w-full bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-full px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-white cursor-text"
                      readOnly
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-3">
                    <button
                      onClick={handleLike}
                      className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                        isLiked
                          ? "bg-red-500 bg-opacity-90 text-white"
                          : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                      }`}
                    >
                      <FiHeart size={24} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => setShowMessageInput(true)}
                      className="p-3 bg-white bg-opacity-20 text-white rounded-full backdrop-blur-sm hover:bg-opacity-30 transition-all"
                    >
                      <FiMessageCircle size={24} />
                    </button>
                    <button className="p-3 bg-white bg-opacity-20 text-white rounded-full backdrop-blur-sm hover:bg-opacity-30 transition-all">
                      <FiMoreVertical size={24} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contador de vistas */}
          {currentStory.views && currentStory.views.length > 0 && (
            <div className="absolute bottom-20 left-4 flex items-center space-x-1 text-white text-sm bg-black bg-opacity-50 backdrop-blur-sm px-3 py-1 rounded-full">
              <FiEye size={14} />
              <span>{currentStory.views.length}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}