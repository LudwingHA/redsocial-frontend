import React, { useState } from 'react';
import { FiImage, FiSend } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { postAPI } from '../../api/api';
import { URL_SERVER } from '../../api/url';

export function PostComposer({ onPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setPosting(true);
    try {
      const res = await postAPI.createPost({ content, image });
      if (res.success) {
        setContent('');
        setImage(null);
        setImagePreview(null);
        onPosted?.(res.post);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  if (!user) return null;

return (
  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/60 dark:border-gray-700/60 p-5 transition-all duration-300">
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <img
            src={`${URL_SERVER}${user.avatar}`}
            alt={user.username}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-gray-600 shadow-sm"
          />
        </div>
        <textarea
          placeholder="¿Qué estás pensando?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 transition-all duration-300 text-base"
          rows={4} // Aumentado a 4 filas
          disabled={posting}
        />
      </div>

      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-gray-600">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-64 object-contain w-full"
          />
          <button
            type="button"
            onClick={removeImage}
            title="Quitar imagen"
            className="absolute top-3 right-3 bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors text-xl font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-slate-200/60 dark:border-gray-700/60">
        <label className={`flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg ${posting ? 'opacity-50 pointer-events-none' : 'hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-50/50 dark:hover:bg-gray-700/50'}`}>
          <FiImage size={20} />
          <span className="font-medium text-sm">Añadir Imagen</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={posting}
          />
        </label>

        <button
          type="submit"
          disabled={posting || (!content.trim() && !image)}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
        >
          <FiSend size={18} />
          <span>{posting ? 'Publicando...' : 'Publicar'}</span>
        </button>
      </div>
    </form>
  </div>

);
}