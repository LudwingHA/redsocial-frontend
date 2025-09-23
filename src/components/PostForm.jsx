import { useState } from "react";
import { createPost } from "../api/api";

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPost = await createPost({ content, image });
      onPostCreated(newPost);
      setContent("");
      setImage(null);
      setPreview(null);
    } catch (error) {
      console.error("Error creando post", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4 bg-white">
      <textarea
        className="w-full p-2 border rounded mb-2"
        rows="3"
        placeholder="¿Qué estás pensando?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        className="mb-2"
        onChange={(e) => {
          const file = e.target.files[0];
          setImage(file);
          setPreview(URL.createObjectURL(file));
        }}
      />
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-40 h-40 object-cover rounded mb-2"
        />
      )}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Publicar
      </button>
    </form>
  );
}
