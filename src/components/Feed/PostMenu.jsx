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
      className="p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-gray-700/50 transition-all duration-300"
    >
      <FiMoreVertical size={18} className="text-slate-600 dark:text-slate-400" />
    </button>

    {isOpen && (
      <>
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
        
        <div className="absolute right-0 top-full mt-1 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/60 dark:border-gray-700/60 z-20 overflow-hidden transition-all duration-300">
          {isAuthor ? (
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 transition-all duration-300 text-sm"
            >
              <FiTrash2 size={16} />
              <span>Eliminar</span>
            </button>
          ) : (
            <button
              onClick={handleReport}
              className="w-full flex items-center gap-2 px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-all duration-300 text-sm"
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