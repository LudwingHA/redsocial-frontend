import React, { useState } from 'react';
import { FiImage, FiSend } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { postAPI } from '../../api/api';

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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <form onSubmit={submit} className="space-y-4">
        <textarea
          placeholder="¿Qué estás pensando?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="rounded-lg max-h-64 object-cover w-full"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-blue-500 transition-colors">
            <FiImage size={20} />
            <span>Agregar imagen</span>
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
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiSend size={18} />
            <span>{posting ? 'Publicando...' : 'Publicar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}