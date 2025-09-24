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
  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start space-x-4">
        <img
          src={`${URL_SERVER}${user.avatar}`}
          alt={user.username}
          className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-lg"
        />
        <textarea
          placeholder="¿Qué estás pensando?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
          rows={3}
        />
      </div>
      
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src={imagePreview}
            alt="Preview"
            className="rounded-xl max-h-64 object-cover w-full"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-3 right-3 bg-red-500 dark:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
        <label className="flex items-center gap-3 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700">
          <FiImage size={22} />
          <span className="font-medium">Agregar imagen</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        <button
          type="submit"
          disabled={posting || (!content.trim() && !image)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 font-medium flex items-center gap-2"
        >
          <FiSend size={18} />
          <span>{posting ? 'Publicando...' : 'Publicar'}</span>
        </button>
      </div>
    </form>
  </div>
);
}