import React, { useState } from 'react';
import { FiMoreVertical, FiTrash2, FiFlag } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';

export function PostMenu({ post }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const isAuthor = user && post.author._id === user.id;

  const handleDelete = async () => {
    // Implementar eliminación de post
    console.log('Eliminar post:', post._id);
    setIsOpen(false);
  };

  const handleReport = async () => {
    // Implementar reporte de post
    console.log('Reportar post:', post._id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <FiMoreVertical size={18} className="text-gray-600" />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menú desplegable */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {isAuthor ? (
              <button
                onClick={handleDelete}
                className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
              >
                <FiTrash2 size={16} />
                <span>Eliminar publicación</span>
              </button>
            ) : (
              <button
                onClick={handleReport}
                className="w-full flex items-center space-x-2 px-4 py-3 text-orange-600 hover:bg-orange-50 transition-colors rounded-lg"
              >
                <FiFlag size={16} />
                <span>Reportar publicación</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}