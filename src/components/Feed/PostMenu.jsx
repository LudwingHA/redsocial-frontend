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
      aria-label="Menú de opciones"
      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-all duration-300 text-slate-600 dark:text-slate-400"
    >
      <FiMoreVertical size={20} />
    </button>

    {isOpen && (
      <>
        {/* Overlay para cerrar al hacer clic fuera */}
        <div
          className="fixed inset-0"
          onClick={() => setIsOpen(false)}
        />

        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-slate-200/80 dark:border-gray-700/80 overflow-hidden transition-all duration-300">
          {isAuthor ? (
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 text-sm font-medium"
            >
              <FiTrash2 size={16} />
              <span>Eliminar Post</span>
            </button>
          ) : (
            <button
              onClick={handleReport}
              className="w-full flex items-center gap-3 px-4 py-3 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 text-sm font-medium"
            >
              <FiFlag size={16} />
              <span>Reportar Post</span>
            </button>
          )}
        </div>
      </>
    )}
  </div>
);
}