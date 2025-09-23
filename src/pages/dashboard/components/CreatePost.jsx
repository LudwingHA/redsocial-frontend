import { useState } from 'react';
import { FaImage, FaPaperPlane, FaTimes } from 'react-icons/fa';

export default function CreatePost({ newPost, newImage, setNewPost, setNewImage, onCreatePost }) {
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewImage(null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    onCreatePost();
    setImagePreview(null);
  };

  return (
    <div className="bg-background-secondary border border-border rounded-xl p-4 mb-6 shadow-sm">
      <textarea
        placeholder="¿Qué estás pensando?"
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        className="w-full p-3 bg-background-primary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        rows="3"
      />
      
      {imagePreview && (
        <div className="relative mt-3">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full max-h-64 object-cover rounded-lg border border-border"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-3">
        <label className="flex items-center text-text-secondary hover:text-primary-500 cursor-pointer transition-colors">
          <FaImage className="mr-2" />
          <span>Subir imagen</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
        
        <button 
          onClick={handleSubmit}
          disabled={!newPost.trim() && !newImage}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center font-medium"
        >
          <FaPaperPlane className="mr-2" />
          Publicar
        </button>
      </div>
    </div>
  );
}