import axios from "axios";
import { URL_SERVER } from "./url";

const API_BASE_URL = `${URL_SERVER}/api`; // Ajusta según tu backend

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get("/auth/verify");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  checkUsername: async (username) => {
    try {
      // Validación básica en el frontend
      if (!username || username.length < 3) {
        return {
          success: false,
          error: "Username debe tener al menos 3 caracteres",
        };
      }

      const response = await api.get(
        `/auth/check-username/${encodeURIComponent(username)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking username:", error);

      if (error.response) {
        // Error del servidor (4xx, 5xx)
        return {
          success: false,
          error: error.response.data.error || "Error del servidor",
        };
      } else if (error.request) {
        // Error de red
        return {
          success: false,
          error: "Error de conexión",
        };
      } else {
        // Otros errores
        return {
          success: false,
          error: "Error inesperado",
        };
      }
    }
  },

  checkEmail: async (email) => {
    const response = await api.get(`/auth/check-email/${email}`);
    return response.data;
  },
};

// Servicios de usuarios
export const userAPI = {
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },

  updateAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await api.put("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get(`/users/search?q=${query}`);
    return response.data;
  },

  toggleFollow: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },
};

// Servicios de posts
export const postAPI = {
  getPosts: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  getUserPosts: async (userId, page = 1, limit = 10) => {
    const response = await api.get(
      `/posts/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getPost: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  createPost: async (postData) => {
    const formData = new FormData();

    if (postData.content) formData.append("content", postData.content);
    if (postData.tags)
      formData.append(
        "tags",
        Array.isArray(postData.tags) ? postData.tags.join(",") : postData.tags
      );
    if (postData.privacy) formData.append("privacy", postData.privacy);
    if (postData.image) formData.append("image", postData.image);
    if (postData.video) formData.append("video", postData.video);

    const response = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updatePost: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  toggleLike: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  addComment: async (postId, content) => {
    const response = await api.post(`/posts/${postId}/comment`, { content });
    return response.data;
  },

  deleteComment: async (postId, commentId) => {
    const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
    return response.data;
  },

  searchPosts: async (query, tag, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (tag) params.append("tag", tag);
    params.append("page", page);
    params.append("limit", limit);

    const response = await api.get(`/posts/search?${params}`);
    return response.data;
  },
};

// Servicios de chat
export const chatAPI = {
  getUserChats: async () => {
    const response = await api.get("/chats");
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get("/users/all");
    return response.data;
  },

  createChat: async (participantId) => {
    const response = await api.post("/chats", { participantId });
    return response.data;
  },

  getChatMessages: async (chatId) => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  },

  sendMessage: async (chatId, content) => {
    const response = await api.post(`/chats/${chatId}/message`, { content });
    return response.data;
  },

  deleteChat: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  },
};
export const notificationAPI = {
  getNotifications: async (page = 1) => {
    const response = await fetch(`/api/notifications?page=${page}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return await response.json();
  },

  markAsRead: async (notificationIds) => {
    const response = await fetch("/api/notifications/read", {
      method: "PATCH", // Tu backend usa PATCH, no PUT
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ notificationIds }),
    });
    return await response.json();
  },

  markAllAsRead: async () => {
    const response = await fetch("/api/notifications/read-all", {
      method: "PATCH", // Tu backend usa PATCH
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return await response.json();
  },

  getUnreadCount: async () => {
    const response = await fetch("/api/notifications/unread-count", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return await response.json();
  },
};

export default api;
