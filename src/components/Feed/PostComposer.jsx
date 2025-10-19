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
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 transition-all duration-300">
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-3">
        <img
          src={`${URL_SERVER}${user.avatar}`}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0"
        />
        <textarea
          placeholder="¿Qué estás pensando?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 w-full px-4 py-3 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl focus:ring-0 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 text-sm"
          rows={3}
          disabled={posting}
        />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <label className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer transition-all duration-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
          posting ? 'opacity-50 pointer-events-none' : ''
        }`}>
          <FiImage size={18} />
          <span className="text-sm font-medium">Foto</span>
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
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2"
        >
          <FiSend size={16} />
          <span>{posting ? 'Publicando...' : 'Publicar'}</span>
        </button>
      </div>
    </form>
  </div>
);
}