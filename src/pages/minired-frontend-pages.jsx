// minired-frontend-pages.jsx
// Sistema completo con notificaciones para likes y comentarios

import React, { useEffect, useState, useRef } from "react";
import { postAPI, userAPI, chatAPI, notificationAPI } from "../api/api";
import { io } from "socket.io-client";
import { useAuth } from "../auth/context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

/* ------------------ Hook para Notificaciones ------------------ */
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async (page = 1) => {
    const token = localStorage.getItem("token");
    if (!user || !token) return;

    try {
      setIsLoading(true);
      const data = await notificationAPI.getNotifications(page);
      if (data.success) {
        setNotifications((prev) =>
          page === 1 ? data.notifications : [...prev, ...data.notifications]
        );
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationIds) => {
    try {
      const data = await notificationAPI.markAsRead(notificationIds);
      if (data.success) {
        setUnreadCount(data.unreadCount);
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n
          )
        );

        if (window.socket) {
          window.socket.emit("markNotificationsRead", notificationIds);
        }
      }
    } catch (error) {
      console.error("Error marcando como leído:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const data = await notificationAPI.markAllAsRead();
      if (data.success) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

        if (window.socket) {
          const unreadIds = notifications
            .filter((n) => !n.isRead)
            .map((n) => n._id);
          window.socket.emit("markNotificationsRead", unreadIds);
        }
      }
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
    }
  };

  // Configuración de socket para notificaciones en tiempo real
  useEffect(() => {
    if (!user || !window.socket) return;

    const socket = window.socket;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      showNotificationToast(notification);
    };

    const handleUnreadCountUpdated = ({ unreadCount }) => {
      setUnreadCount(unreadCount);
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("unreadCountUpdated", handleUnreadCountUpdated);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("unreadCountUpdated", handleUnreadCountUpdated);
    };
  }, [user]);

  useEffect(() => {
    if (user) loadNotifications(1);
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
}

/* ------------------ Componente Campana de Notificaciones ------------------ */
export function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  const getNotificationText = (notification) => {
    const senderName = notification.sender?.username || "Alguien";

    switch (notification.type) {
      case "like_post":
        return `${senderName} le dio like a tu publicación`;
      case "comment_post":
        return `${senderName} comentó: "${
          notification.comment || notification.metadata?.comment || "..."
        }"`;
      case "new_message":
        return `${senderName} te envió un mensaje`;
      default:
        return "Nueva notificación";
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead([notification._id]);
    }

    // Navegar según el tipo de notificación
    if (
      notification.type === "like_post" ||
      notification.type === "comment_post"
    ) {
      if (notification.post) {
        window.location.href = `/post/${notification.post}`;
      }
    } else if (
      notification.type === "new_message" &&
      notification.metadata?.chatId
    ) {
      window.location.href = `/chat?chatId=${notification.metadata.chatId}`;
    }

    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
          position: "relative",
          padding: "5px",
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              background: "red",
              color: "white",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "0",
            width: "350px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: "15px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Marcar todas
              </button>
            )}
          </div>

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {isLoading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>
                Cargando...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#666" }}
              >
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: "12px 15px",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    background: notification.isRead ? "white" : "#f8f9fa",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#f0f0f0")}
                  onMouseLeave={(e) =>
                    (e.target.style.background = notification.isRead
                      ? "white"
                      : "#f8f9fa")
                  }
                >
                  <div
                    style={{
                      fontWeight: notification.isRead ? "normal" : "bold",
                      fontSize: "14px",
                    }}
                  >
                    {getNotificationText(notification)}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginTop: "5px",
                    }}
                  >
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------ Helper: Mostrar Toast de Notificación ------------------ */
function showNotificationToast(notification) {
  const text = getNotificationText(notification);

  // Intentar usar las notificaciones del navegador
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Nueva notificación", {
      body: text,
      icon: "/icon.png",
    });
  } else {
    // Fallback: mostrar alerta simple en la esquina
    showSimpleToast(text);
  }
}

function getNotificationText(notification) {
  const senderName = notification.sender?.username || "Alguien";

  switch (notification.type) {
    case "like_post":
      return `${senderName} le dio like a tu publicación`;
    case "comment_post":
      return `${senderName} comentó tu publicación`;
    case "new_message":
      return `${senderName} te envió un mensaje`;
    default:
      return "Tienes una nueva notificación";
  }
}

function showSimpleToast(message) {
  // Crear un toast simple en la esquina superior derecha
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    z-index: 10000;
    max-width: 300px;
    font-size: 14px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 4000);
}

/* ------------------ Profile Edit + Avatar Upload ------------------ */
export function ProfileEditPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    username: "",
    bio: "",
    phone: "",
    age: "",
    location: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user)
      setForm({
        username: user.username || "",
        bio: user.bio || "",
        phone: user.phone || "",
        age: user.age || "",
        location: user.location || "",
      });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(form);
      if (res.success) updateUser(res.user);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    try {
      const res = await userAPI.updateAvatar(file);
      if (res.success) updateUser(res.user);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div>Debes iniciar sesión.</div>;

  return (
    <div>
      <h2>Editar perfil</h2>
      <form onSubmit={handleSaveProfile}>
        <label>
          Usuario
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
          />
        </label>
        <label>
          Bio
          <textarea name="bio" value={form.bio} onChange={handleChange} />
        </label>
        <label>
          Teléfono
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          Edad
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
          />
        </label>
        <label>
          Ubicación
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </label>
        <button type="submit" disabled={saving}>
          Guardar
        </button>
      </form>

      <div>
        <h3>Cambiar avatar</h3>
        <img
          src={`http://localhost:5000${user.avatar}`}
          alt="avatar"
          width={80}
        />
        <input type="file" accept="image/*" onChange={handleAvatar} />
      </div>
    </div>
  );
}

/* ------------------ PostComposer (actualizado para notificaciones) ------------------ */
export function PostComposer({ onPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [posting, setPosting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setPosting(true);
    try {
      const res = await postAPI.createPost({ content, image });
      if (res.success) {
        setContent("");
        setImage(null);
        onPosted && onPosted(res.post);

        // Emitir evento de nuevo post para notificaciones a seguidores
        if (window.socket) {
          window.socket.emit("newPost", res.post);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <textarea
        placeholder="¿Qué estás pensando?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button type="submit" disabled={posting}>
        Publicar
      </button>
    </form>
  );
}

/* ------------------ CommentList (actualizado) ------------------ */
function CommentList({ comments, onAdd, postId, postAuthorId }) {
  const [text, setText] = useState("");
  const { user } = useAuth();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await onAdd(text);
      setText("");

      // Emitir evento de nuevo comentario para notificación
      if (window.socket && user._id !== postAuthorId) {
        window.socket.emit("newComment", {
          postId,
          commenterId: user._id,
          commentContent: text,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {comments?.map((c) => (
        <div key={c._id || c.timestamp}>
          <strong>{c.author?.username || "anon"}</strong>: {c.content}
        </div>
      ))}
      <form onSubmit={handleAdd}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario"
        />
        <button type="submit">Comentar</button>
      </form>
    </div>
  );
}

/* ------------------ PostCard (con notificaciones para likes y comentarios) ------------------ */
export function PostCard({ post, onLikeToggle, onCommentAdd }) {
  const [localPost, setLocalPost] = useState(post);
  const { user } = useAuth();

  useEffect(() => setLocalPost(post), [post]);

  const handleLike = async () => {
    try {
      const res = await postAPI.toggleLike(localPost._id);
      if (res.success) {
        setLocalPost((prev) => ({
          ...prev,
          likes: res.likes,
          likesCount: res.likes.length,
        }));
        onLikeToggle && onLikeToggle(localPost._id, res);

        // Emitir evento de like para notificación (solo si no es el propio autor)
        if (window.socket && user._id !== localPost.author._id) {
          window.socket.emit("postLiked", {
            postId: localPost._id,
            likerId: user._id,
            postAuthorId: localPost.author._id,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (content) => {
    const res = await postAPI.addComment(localPost._id, content);
    if (res.success) {
      setLocalPost((prev) => ({
        ...prev,
        comments: [...prev.comments, res.comment],
      }));
      onCommentAdd && onCommentAdd(localPost._id, res.comment);
    }
  };

  const hasLiked = localPost.likes?.some((like) =>
    like._id ? like._id.toString() === user?._id : like.toString() === user?._id
  );

  return (
    <article
      style={{ border: "1px solid #ccc", padding: "15px", margin: "10px 0" }}
    >
      <div>
        <strong>{localPost.author?.username}</strong>
      </div>
      <div>{localPost.content}</div>
      {localPost.image && (
        <img
          src={`http://localhost:5000${localPost.image}`}
          alt="post"
          style={{ maxWidth: 300 }}
        />
      )}
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleLike} style={{ marginRight: "10px" }}>
          {hasLiked ? "❤️" : "🤍"} {localPost.likes?.length || 0}
        </button>
        <span>💬 {localPost.comments?.length || 0}</span>
      </div>
      <CommentList
        comments={localPost.comments}
        onAdd={addComment}
        postId={localPost._id}
        postAuthorId={localPost.author._id}
      />
    </article>
  );
}

/* ------------------ FeedPage (actualizado con notificaciones) ------------------ */
export function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    loadPage(page);
  }, [page]);

  useEffect(() => {
    // Guardar socket globalmente para acceso desde otros componentes
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    window.socket = socketRef.current;

    const socket = socketRef.current;
    socket.on("connect", () => console.log("socket conectado", socket.id));

    // Eventos para actualizaciones en tiempo real
    socket.on("newPost", (post) => {
      setPosts((prev) => [post, ...prev]);
    });

    socket.on("postLiked", ({ postId, likes }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes } : p))
      );
    });

    socket.on("newComment", ({ postId, comment }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: [...p.comments, comment] } : p
        )
      );
    });

    return () => {
      socket.disconnect();
      window.socket = null;
    };
  }, []);

  const loadPage = async (p) => {
    setLoading(true);
    try {
      const res = await postAPI.getPosts(p, 10);
      if (res.success) {
        if (p === 1) setPosts(res.posts);
        else setPosts((prev) => [...prev, ...res.posts]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handlePosted = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div>
      <h2>Feed</h2>
      <PostComposer onPosted={handlePosted} />
      <div>
        {posts.map((p) => (
          <PostCard key={p._id} post={p} />
        ))}
      </div>
      <div>
        <button onClick={() => setPage((prev) => prev + 1)} disabled={loading}>
          {loading ? "Cargando..." : "Cargar más"}
        </button>
      </div>
    </div>
  );
}

/* ------------------ FollowButton (sin cambios) ------------------ */
export function FollowButton({ targetUserId, initialFollowing, onChange }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await userAPI.toggleFollow(targetUserId);
      if (res.success) {
        setFollowing(res.following);
        onChange && onChange(res.following);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <button onClick={toggle} disabled={loading}>
      {following ? "Siguiendo" : "Seguir"}
    </button>
  );
}

/* ------------------ ChatPage (ya está actualizado) ------------------ */
// minired-frontend-pages.jsx - Componente ChatPage
export function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Inicializar socket
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      query: { userId: user._id },
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🔌 Socket conectado", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket desconectado");
      setIsConnected(false);
    });

    // Manejar nuevos mensajes
    socket.on("newMessage", ({ chatId, message }) => {
      console.log("Nuevo mensaje recibido:", message);

      // Actualizar lista de chats
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                lastMessage: message.timestamp,
                lastMessageContent: message.content,
                messages: [...(chat.messages || []), message],
              }
            : chat
        )
      );

      // Si el chat activo es este, agregar mensaje
      if (activeChat?._id === chatId) {
        setMessages((prev) => {
          const exists = prev.find(
            (m) =>
              m._id === message._id ||
              (m.timestamp === message.timestamp &&
                m.content === message.content)
          );
          if (exists) return prev;
          return [...prev, message];
        });
      }
    });

    // Manejar typing
    socket.on("typing", ({ chatId, userId }) => {
      if (activeChat?._id === chatId && userId !== user._id) {
        setTypingUsers((prev) => {
          if (!prev.includes(userId)) return [...prev, userId];
          return prev;
        });

        // Limpiar typing después de 2 segundos
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
        }, 2000);
      }
    });

    // Manejar usuario dejó de escribir
    socket.on("stopTyping", ({ chatId, userId }) => {
      if (activeChat?._id === chatId) {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, [user, activeChat]);

  // Cargar usuarios disponibles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await chatAPI.getAllUsers();
        if (res.success) {
          setAvailableUsers(res.users.filter((u) => u._id !== user._id));
        }
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  // Cargar chats del usuario
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const res = await chatAPI.getUserChats();
        if (res.success) {
          setChats(res.chats);
        }
      } catch (err) {
        console.error("Error cargando chats:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadChats();
  }, [user]);

  // Abrir chat
  const openChat = async (chat) => {
    try {
      setActiveChat(chat);
      const res = await chatAPI.getChatMessages(chat._id);
      if (res.success) {
        setMessages(res.chat.messages || []);
        // Unirse a la sala del chat
        socketRef.current?.emit("joinChat", chat._id);
      }
    } catch (err) {
      console.error("Error abriendo chat:", err);
    }
  };

  // Iniciar nuevo chat
  const startChat = async (participantId) => {
    try {
      const res = await chatAPI.createChat(participantId);
      if (res.success) {
        // Si el chat ya existe, lo abrimos directamente
        const existingChat = chats.find((c) =>
          c.participants.some((p) => p._id === participantId)
        );

        if (existingChat) {
          openChat(existingChat);
        } else {
          setChats((prev) => [res.chat, ...prev]);
          openChat(res.chat);
        }
      }
    } catch (err) {
      console.error("Error creando chat:", err);
    }
  };

  // Enviar mensaje
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !isConnected) return;

    try {
      // Mensaje optimista
      const tempMessage = {
        _id: Date.now().toString(),
        sender: { _id: user._id, username: user.username, avatar: user.avatar },
        content: text.trim(),
        timestamp: new Date(),
        isSending: true,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setText("");

      // Enviar mensaje via HTTP API
      const res = await chatAPI.sendMessage(activeChat._id, text.trim());

      if (!res.success) {
        // Revertir mensaje optimista si falla
        setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
        setText(tempMessage.content); // Restaurar texto
      }
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      // Revertir mensaje optimista
      setMessages((prev) => prev.filter((m) => !m.isSending));
    }
  };

  // Emitir typing
  const handleTyping = () => {
    if (activeChat && isConnected) {
      socketRef.current?.emit("typing", { chatId: activeChat._id });
    }
  };

  // Emitir stop typing
  const handleStopTyping = () => {
    if (activeChat && isConnected) {
      socketRef.current?.emit("stopTyping", { chatId: activeChat._id });
    }
  };

  // Formatear fecha del mensaje
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Ahora"; // Menos de 1 minuto
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`; // Menos de 1 hora
    if (diff < 86400000)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }); // Hoy
    return date.toLocaleDateString([], { month: "short", day: "numeric" }); // Otros días
  };

  // Obtener nombre del otro participante
  const getOtherParticipant = (chat) => {
    if (!chat.participants) return "Usuario";
    const other = chat.participants.find((p) => p._id !== user._id);
    return other?.username || "Usuario";
  };

  // Obtener avatar del otro participante
  const getOtherAvatar = (chat) => {
    if (!chat.participants) return "/default-avatar.png";
    const other = chat.participants.find((p) => p._id !== user._id);
    return other?.avatar || "/default-avatar.png";
  };

  if (!user) return <div>Inicia sesión para usar el chat</div>;

  return (
    <div
      style={{
        display: "flex",
        height: "80vh",
        maxWidth: "1200px",
        margin: "0 auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* Sidebar - Lista de chats */}
      <div
        style={{
          width: "300px",
          borderRight: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "15px",
            borderBottom: "1px solid #eee",
            background: "#f8f9fa",
          }}
        >
          <h3 style={{ margin: 0 }}>Chats {isConnected ? "🟢" : "🔴"}</h3>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#fff",
          }}
        >
          {loading ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#666" }}
            >
              Cargando chats...
            </div>
          ) : chats.length === 0 ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#666" }}
            >
              No tienes chats iniciados
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => openChat(chat)}
                style={{
                  padding: "12px 15px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  background:
                    activeChat?._id === chat._id ? "#e3f2fd" : "transparent",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
                onMouseLeave={(e) =>
                  (e.target.style.background =
                    activeChat?._id === chat._id ? "#e3f2fd" : "transparent")
                }
              >
                <img
                  src={`http://localhost:5000${getOtherAvatar(chat)}`}
                  alt="Avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {getOtherParticipant(chat)}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {chat.lastMessageContent || "Sin mensajes"}
                  </div>
                </div>
                {chat.lastMessage && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatMessageTime(chat.lastMessage)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Lista de usuarios disponibles */}
        <div
          style={{
            borderTop: "1px solid #eee",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "10px 15px", background: "#f8f9fa" }}>
            <strong style={{ fontSize: "14px" }}>Usuarios disponibles</strong>
          </div>
          {availableUsers.map((userObj) => (
            <div
              key={userObj._id}
              style={{
                padding: "8px 15px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => startChat(userObj._id)}
            >
              <span style={{ fontSize: "14px" }}>{userObj.username}</span>
              <button
                style={{
                  padding: "4px 8px",
                  fontSize: "12px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Área de chat principal */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#fafafa",
        }}
      >
        {activeChat ? (
          <>
            {/* Header del chat */}
            <div
              style={{
                padding: "15px 20px",
                borderBottom: "1px solid #eee",
                background: "white",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src={`http://localhost:5000${getOtherAvatar(activeChat)}`}
                alt="Avatar"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div>
                <div style={{ fontWeight: "bold" }}>
                  {getOtherParticipant(activeChat)}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {typingUsers.length > 0 ? "Escribiendo..." : "En línea"}
                </div>
              </div>
            </div>

            {/* Área de mensajes */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                background: "white",
              }}
            >
              {messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    marginTop: "50px",
                  }}
                >
                  No hay mensajes aún. ¡Envía el primero!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id || message.timestamp}
                    style={{
                      marginBottom: "15px",
                      display: "flex",
                      flexDirection:
                        message.sender?._id === user._id
                          ? "row-reverse"
                          : "row",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    {message.sender?._id !== user._id && (
                      <img
                        src={`http://localhost:5000${
                          message.sender?.avatar || "/default-avatar.png"
                        }`}
                        alt="Avatar"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div
                      style={{
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                          message.sender?._id === user._id
                            ? "flex-end"
                            : "flex-start",
                      }}
                    >
                      {message.sender?._id !== user._id && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginBottom: "2px",
                          }}
                        >
                          {message.sender?.username}
                        </div>
                      )}
                      <div
                        style={{
                          padding: "10px 15px",
                          background:
                            message.sender?._id === user._id
                              ? "#007bff"
                              : "#e9ecef",
                          color:
                            message.sender?._id === user._id
                              ? "white"
                              : "black",
                          borderRadius: "18px",
                          fontSize: "14px",
                          wordWrap: "break-word",
                          opacity: message.isSending ? 0.7 : 1,
                        }}
                      >
                        {message.content}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          marginTop: "4px",
                        }}
                      >
                        {formatMessageTime(message.timestamp)}
                        {message.isSending && " · Enviando..."}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {typingUsers.length > 0 && (
                <div
                  style={{
                    fontStyle: "italic",
                    color: "#666",
                    fontSize: "14px",
                    margin: "10px 0",
                    textAlign: "left",
                  }}
                >
                  {getOtherParticipant(activeChat)} está escribiendo...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Formulario de envío */}
            <form
              onSubmit={sendMessage}
              style={{
                padding: "15px 20px",
                borderTop: "1px solid #eee",
                background: "white",
                display: "flex",
                gap: "10px",
              }}
            >
              <input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  handleTyping();
                }}
                onBlur={handleStopTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Escribe un mensaje..."
                style={{
                  flex: 1,
                  padding: "10px 15px",
                  border: "1px solid #ddd",
                  borderRadius: "20px",
                  outline: "none",
                  fontSize: "14px",
                }}
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!text.trim() || !isConnected}
                style={{
                  padding: "10px 20px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "14px",
                  opacity: !text.trim() || !isConnected ? 0.5 : 1,
                }}
              >
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: "16px",
            }}
          >
            Selecciona un chat para comenzar a conversar
          </div>
        )}
      </div>
    </div>
  );
}
/* ------------------ Header con Notificaciones ------------------ */
export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        padding: "10px 20px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#f8f9fa",
      }}
    >
      <h1 style={{ margin: 0 }}>MiRedSocial</h1>

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <NotificationBell />
          <span>Hola, {user.username}</span>
          <button onClick={logout} style={{ padding: "5px 10px" }}>
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}

/* ------------------ Export default ------------------ */
export default null;
