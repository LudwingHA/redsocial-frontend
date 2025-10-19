import React, { useState, useRef, useCallback, useEffect } from "react";
import { storyAPI } from "../../api/api";
import { FiPlus, FiX, FiUploadCloud, FiAlertCircle, FiVideo, FiImage } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../../auth/context/AuthContext";
import { URL_SERVER } from "../../api/url";

// Constantes
const MAX_STORY_DURATION_SECONDS = 15;
const MAX_FILE_SIZE_MB = 100;

// ... (La función checkVideoDuration se mantiene igual)

const checkVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("video/")) {
      resolve({ duration: 0, isValid: true });
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.src = url;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const isValid = duration <= MAX_STORY_DURATION_SECONDS;
      resolve({ duration, isValid, url });
    };

    video.onerror = (e) => {
      console.error("Error al cargar metadatos del video:", e);
      reject(new Error("No se pudieron cargar los metadatos del video."));
    };
  });
};

/**
 * 🚀 Componente principal: StoryUploader
 */
export function StoryUploader({ onUploaded }) {
  const [storyMedia, setStoryMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const currentUser = user;

  useEffect(() => {
    return () => {
      if (storyMedia?.previewUrl) {
        URL.revokeObjectURL(storyMedia.previewUrl);
      }
    };
  }, [storyMedia]);

  const handleCloseModal = useCallback(() => {
    if (storyMedia?.previewUrl) {
      URL.revokeObjectURL(storyMedia.previewUrl);
    }
    setStoryMedia(null);
    setIsModalOpen(false);
  }, [storyMedia]);

  const handleFileChange = useCallback(async (selectedFile) => {
    if (!selectedFile) return;

    setError(null);
    setLoading(true);

    if (
      !selectedFile.type.startsWith("video/") &&
      !selectedFile.type.startsWith("image/")
    ) {
      setError("Solo se permiten archivos de tipo imagen y video.");
      setLoading(false);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(
        `El archivo excede el tamaño máximo permitido de ${MAX_FILE_SIZE_MB}MB.`
      );
      setLoading(false);
      return;
    }

    try {
      if (selectedFile.type.startsWith("video/")) {
        const { duration, isValid, url } = await checkVideoDuration(
          selectedFile
        );

        if (!isValid) {
          setError(
            `El video dura ${duration.toFixed(
              1
            )}s y excede el máximo de ${MAX_STORY_DURATION_SECONDS}s.`
          );
          URL.revokeObjectURL(url);
        } else {
          setStoryMedia({
            file: selectedFile,
            type: "video",
            duration,
            previewUrl: url,
          });
          setIsModalOpen(true);
        }
      } else {
        const url = URL.createObjectURL(selectedFile);
        setStoryMedia({ file: selectedFile, type: "image", previewUrl: url });
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Error al procesar el archivo:", err);
      setError("Error al procesar el archivo. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    e.target.value = null;
    handleFileChange(selectedFile);
  };

  const handleUpload = async () => {
    if (!storyMedia || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await storyAPI.uploadStory(storyMedia.file, storyMedia.type);

      if (res && res.success) {
        if (onUploaded) onUploaded(res.story);
        handleCloseModal();
      } else {
        setError(
          `Error al subir story: ${
            res.message || "Error desconocido del servidor."
          }`
        );
      }
    } catch (err) {
      console.error("Error de subida:", err);
      setError("Ocurrió un error de red o del servidor al subir la story.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    if (loading) return;
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Botón Compacto para Mobile */}
      <div 
        className="flex-shrink-0 cursor-pointer"
        onClick={handleAddClick}
      >
        <div className="relative">
          {/* Avatar más pequeño para mobile */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-purple-600 hover:from-yellow-500 hover:to-purple-700 transition-all duration-200">
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center relative overflow-hidden">
              <img
                src={currentUser.avatar ? `${URL_SERVER}${currentUser.avatar}` : "/default-avatar.png"}
                alt={currentUser.username}
                className="w-full h-full rounded-full object-cover hover:scale-105 transition-transform duration-200"
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <ClipLoader size={14} color="#fff" />
                </div>
              )}
            </div>
          </div>
          
          {/* Plus icon más pequeño */}
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full flex items-center justify-center">
              <FiPlus size={10} className="text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Toast Compacto */}
      {error && (
        <div className="fixed top-3 left-1/2 transform -translate-x-1/2 z-[10000] max-w-[90vw]">
          <div className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 text-sm">
            <FiAlertCircle size={16} />
            <span className="flex-1 truncate max-w-[200px]">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="p-0.5 hover:bg-red-600 rounded-full"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Input de archivo oculto */}
      <input 
        type="file" 
        accept="image/*,video/*" 
        onChange={handleFileInputChange}
        ref={fileInputRef}
        className="hidden"
      />

      {/* Modal Compacto y Responsive */}
      {isModalOpen && storyMedia && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-3 sm:p-4 z-[9999]">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm transform animate-scale-in">
            
            {/* Header Compacto */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Crear story
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Preview Content Compacto */}
            <div className="p-4">
              <div className="aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                {storyMedia.type === "image" ? (
                  <img
                    src={storyMedia.previewUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={storyMedia.previewUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* File Info Compacto */}
              <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  {storyMedia.type === 'image' ? (
                    <FiImage size={14} className="text-green-500" />
                  ) : (
                    <FiVideo size={14} className="text-blue-500" />
                  )}
                  <span className="truncate max-w-[120px] sm:max-w-[150px]">
                    {storyMedia.file.name}
                  </span>
                </div>
                {storyMedia.duration && (
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {storyMedia.duration.toFixed(1)}s
                  </span>
                )}
              </div>
              
              {/* Action Buttons Compactos */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all text-sm disabled:opacity-50 flex items-center justify-center space-x-1"
                >
                  {loading ? (
                    <>
                      <ClipLoader size={12} color="white" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <FiUploadCloud size={14} />
                      <span>Compartir</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}