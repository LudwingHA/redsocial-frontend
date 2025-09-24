import React, { useState } from 'react';
import { FiMoreVertical, FiTrash2, FiFlag } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';

export function PostMenu({ post }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const isAuthor = user && post.author._id === user.id;

  const handleDelete = async () => {
    console.log('Eliminar post:', post._id);
    setIsOpen(false);
  };

  const handleReport = async () => {
    console.log('Reportar post:', post._id);
    setIsOpen(false);
  };

  return (
  <div className="relative">
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
    >
      <FiMoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
    </button>

    {isOpen && (
      <>
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
        
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden transition-colors duration-300">
          {isAuthor ? (
            <button
              onClick={handleDelete}
              className="w-full flex items-center space-x-3 px-4 py-4 text-red-600 dark:text-red-400 hover:bg-gradient-to-r from-red-50 to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 transition-all duration-300"
            >
              <FiTrash2 size={18} />
              <span className="font-medium">Eliminar publicación</span>
            </button>
          ) : (
            <button
              onClick={handleReport}
              className="w-full flex items-center space-x-3 px-4 py-4 text-orange-600 dark:text-orange-400 hover:bg-gradient-to-r from-orange-50 to-yellow-50 dark:hover:from-orange-900/20 dark:hover:to-yellow-900/20 transition-all duration-300"
            >
              <FiFlag size={18} />
              <span className="font-medium">Reportar publicación</span>
            </button>
          )}
        </div>
      </>
    )}
  </div>
  );
}