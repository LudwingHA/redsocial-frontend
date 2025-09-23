import axios from "axios";

const API_URL = "http://localhost:4000/api";

const api = axios.create({ baseURL: API_URL });

// Función para setear o remover token automáticamente
export const setToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// ---------------------------
// Auth
// ---------------------------
export const loginUser = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  setToken(res.data.token);
  return res;
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  setToken(res.data.token);
  return res;
};

// ---------------------------
// Posts
// ---------------------------
export const getPosts = async () => {
  const res = await api.get("/posts");
  return res.data;
};

export const createPost = async (content, image, token) => {
  const formData = new FormData();
  formData.append("content", content);
  if (image) formData.append("image", image);

  const res = await api.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // 🔑 muy importante
    },
  });
  return res.data;
};


export const toggleLike = async (postId) => {
  const res = await api.patch(`/posts/like/${postId}`);
  return res.data;
};

export const addComment = async (postId, text) => {
  const res = await api.post(`/posts/comment/${postId}`, { text });
  return res.data;
};

// ---------------------------
// Chat
// ---------------------------
export const sendMessage = async (receiver, text) => {
  const res = await api.post("/chat", { receiver, text });
  return res.data;
};

export const getMessages = async (user2) => {
  const res = await api.get(`/chat?user2=${user2}`);
  return res.data;
};

export default api;
