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
// StoryUploader.jsx - RETURN Mejorado
return (
  <>
    {/* Botón "Tu Story" */}
    <div 
      className="flex-shrink-0 cursor-pointer group w-[72px] sm:w-[80px] flex flex-col items-center space-y-1.5" 
      onClick={handleAddClick}
    >
      <div className="relative w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] p-[3px] rounded-full transition-all duration-300">
        {/* Marco de "Tu Story" - Borde gris sutil */}
        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center relative overflow-hidden border-2 border-gray-300 dark:border-gray-700">
          <img
            src={currentUser.avatar ? `${URL_SERVER}${currentUser.avatar}` : "/default-avatar.png"}
            alt={currentUser.username}
            className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900 group-hover:scale-105 transition-transform duration-300 opacity-80"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-sm">
              <ClipLoader size={20} color="#fff" />
            </div>
          )}
        </div>
        
        {/* Icono de "+" flotante */}
        <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-xl border-2 border-white dark:border-gray-900">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <FiPlus size={14} className="text-white" />
          </div>
        </div>
      </div>
      
      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate w-full text-center">
        Tu story
      </span>
    </div>
    
    {/* Input de archivo oculto */}
    <input 
      type="file" 
      accept="image/*,video/*" 
      onChange={handleFileInputChange}
      ref={fileInputRef}
      className="hidden"
    />

    {/* Error Toast Mejorado (Posición centrada) */}
    {error && (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4">
        <div className="bg-red-500 text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm backdrop-blur-sm border border-red-400 max-w-xs sm:max-w-md">
          <FiAlertCircle size={20} className="flex-shrink-0" />
          <span className="flex-1 font-semibold">{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="p-1 hover:bg-red-600/80 rounded-full transition-colors flex-shrink-0"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    )}

    {/* Modal de Preview con Aspect Ratio 9/16 */}
    {isModalOpen && storyMedia && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999] animate-in fade-in">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm transform scale-95 animate-in slide-in-from-bottom-4">
          
          {/* Header del Modal */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Compartir Story
            </h3>
            <button 
              onClick={handleCloseModal}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {/* Contenido del Modal */}
          <div className="p-4 space-y-4">
            <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl">
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
            
            {/* Información del archivo */}
            <div className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 font-semibold">
                {storyMedia.type === 'image' ? (
                  <FiImage size={18} className="text-green-500" />
                ) : (
                  <FiVideo size={18} className="text-blue-500" />
                )}
                <span className="truncate max-w-[150px]">
                  {storyMedia.file.name}
                </span>
              </div>
              {storyMedia.duration && (
                <span className="text-xs text-gray-700 dark:text-gray-300 font-bold bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {storyMedia.duration.toFixed(1)}s
                </span>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCloseModal}
                disabled={loading}
                className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Descartar
              </button>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/30"
              >
                {loading ? (
                  <>
                    <ClipLoader size={16} color="white" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud size={20} />
                    <span>Publicar Story</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
}