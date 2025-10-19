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
      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-gray-600 dark:text-gray-400"
    >
      <FiMoreVertical size={20} />
    </button>

    {isOpen && (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />

        {/* Menu */}
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
          {isAuthor ? (
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 text-sm font-medium"
            >
              <FiTrash2 size={16} />
              <span>Eliminar</span>
            </button>
          ) : (
            <button
              onClick={handleReport}
              className="w-full flex items-center gap-3 px-4 py-3 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 text-sm font-medium"
            >
              <FiFlag size={16} />
              <span>Reportar</span>
            </button>
          )}
        </div>
      </>
    )}
  </div>
);
}