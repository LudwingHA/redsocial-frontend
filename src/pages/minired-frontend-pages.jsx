// Sistema completo con notificaciones para likes y comentarios
import React, { useEffect, useState, useRef } from "react";
import { postAPI, userAPI, chatAPI, notificationAPI } from "../api/api";
import { useAuth } from "../auth/context/AuthContext";
import { useSocket } from "../auth/context/SocketContext";
import { NotificationBell } from "../components/NotificationBell";

// Eliminar la importación de io y SOCKET_URL ya que ahora usamos el socket global

/* ------------------ Hook para Notificaciones (Actualizado) ------------------ */
export function useNotifications() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async (page = 1) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await notificationAPI.getNotifications(page);
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationIds) => {
    if (!user || !notificationIds.length) return;

    try {
      const data = await notificationAPI.markAsRead(notificationIds);
      if (data.success) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(data.unreadCount || 0);

        // Emitir via socket
        if (socket && isConnected) {
          socket.emit("markNotificationsRead", notificationIds);
        }
      }
    } catch (error) {
      console.error("Error marcando como leído:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const data = await notificationAPI.markAllAsRead();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        if (socket && isConnected) {
          const unreadIds = notifications
            .filter(n => !n.isRead)
            .map(n => n._id);
          if (unreadIds.length > 0) {
            socket.emit("markNotificationsRead", unreadIds);
          }
        }
      }
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
    }
  };

  // Configurar listeners de socket
  useEffect(() => {
    if (!user || !socket) return;

    console.log("🔔 Configurando listeners de notificaciones");

    const handleNewNotification = (notification) => {
      console.log("🔔 Nueva notificación recibida:", notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      showNotificationToast(notification);
    };

    const handleUnreadCountUpdated = ({ unreadCount }) => {
      console.log("🔔 Contador actualizado:", unreadCount);
      setUnreadCount(unreadCount);
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("unreadCountUpdated", handleUnreadCountUpdated);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("unreadCountUpdated", handleUnreadCountUpdated);
    };
  }, [user, socket, isConnected]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (user) {
      loadNotifications(1);
      
      // También cargar contador de no leídas
      notificationAPI.getUnreadCount()
        .then(data => {
          if (data.success) {
            setUnreadCount(data.unreadCount || 0);
          }
        })
        .catch(console.error);
    }
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
      // puedes mostrar mensaje
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
/* ------------------ FeedPage (Actualizado con Socket Global) ------------------ */
export function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { socket, isConnected } = useSocket(); // Usar socket global

  useEffect(() => {
    loadPage(page);
  }, [page]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("🔌 Configurando listeners del feed con socket global");

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
      if (socket) {
        socket.off("newPost");
        socket.off("postLiked");
        socket.off("newComment");
      }
    };
  }, [socket, isConnected]);

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

    // Usar socket global para emitir
    if (socket && isConnected) {
      socket.emit("newPost", newPost);
    }
  };

  return (
    <div>
      <h2>Feed {isConnected ? "🟢" : "🔴"}</h2>
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
/* ------------------ Post composer (texto + imagen) ------------------ */
export function PostComposer({ onPosted }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [posting, setPosting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return; // no vacío
    setPosting(true);
    try {
      const res = await postAPI.createPost({ content, image });
      if (res.success) {
        setContent("");
        setImage(null);
        onPosted && onPosted(res.post);
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

/* ------------------ CommentList (Actualizado) ------------------ */
function CommentList({ comments, onAdd, postId, postAuthorId }) {
  const [text, setText] = useState("");
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await onAdd(text);
      setText("");

      // EMITIR NOTIFICACIÓN DE COMENTARIO (también desde aquí por si acaso)
      if (socket && isConnected && user.id !== postAuthorId) {
        console.log("💬 Emitiendo notificación de comentario desde CommentList");
        socket.emit("newComment", {
          postId: postId,
          commenterId: user.id,
          commentContent: text,
          postAuthorId: postAuthorId
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
/* ------------------ PostCard (Actualizado para notificaciones) ------------------ */
export function PostCard({ post, onLikeToggle, onCommentAdd }) {
  const [localPost, setLocalPost] = useState(post);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

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

        // EMITIR NOTIFICACIÓN DE LIKE
        if (socket && isConnected && user.id !== localPost.author._id) {
          console.log("❤️ Emitiendo notificación de like");
          socket.emit("postLiked", {
            postId: localPost._id,
            likerId: user.id,  // Usar user.id
            postAuthorId: localPost.author._id
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

      // EMITIR NOTIFICACIÓN DE COMENTARIO
      if (socket && isConnected && user.id !== localPost.author._id) {
        console.log("💬 Emitiendo notificación de comentario");
        socket.emit("newComment", {
          postId: localPost._id,
          commenterId: user.id,  // Usar user.id
          commentContent: content,
          postAuthorId: localPost.author._id
        });
      }
    }
  };

  const hasLiked = localPost.likes?.some((like) =>
    like._id ? like._id.toString() === user?.id : like.toString() === user?.id
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

/* ------------------ ChatPage (Actualizado con Socket Global) ------------------ */

export function ChatPage() {
  const { user } = useAuth();
  const { socket, isConnected, waitForConnection } = useSocket(); // socket global
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutsRef = useRef({});

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Cargar usuarios disponibles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await chatAPI.getAllUsers();
        if (res.success) {
          setAvailableUsers(res.users.filter(u => u._id !== user._id));
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
        const res = await chatAPI.getUserChats();
        if (res.success) setChats(res.chats);
      } catch (err) {
        console.error("Error cargando chats:", err);
      }
    };
    if (user) loadChats();
  }, [user]);

  // Configurar listeners del socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log("🔌 Configurando listeners del chat global");

    const handleNewMessage = ({ chatId, message }) => {
      // Actualizar chats
      setChats(prev =>
        prev.map(c =>
          c._id === chatId
            ? { ...c, lastMessage: message.timestamp, lastMessageContent: message.content }
            : c
        )
      );

      // Actualizar mensajes del chat activo
      if (activeChat?._id === chatId) {
        setMessages(prev => {
          const exists = prev.find(
            m => m._id === message._id || (m.timestamp === message.timestamp && m.content === message.content)
          );
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    const handleTyping = ({ chatId, userId }) => {
      if (activeChat?._id !== chatId || userId === user._id) return;

      setTypingUsers(prev => (!prev.includes(userId) ? [...prev, userId] : prev));

      // Limpiar timeout anterior
      if (typingTimeoutsRef.current[userId]) clearTimeout(typingTimeoutsRef.current[userId]);

      typingTimeoutsRef.current[userId] = setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== userId));
        delete typingTimeoutsRef.current[userId];
      }, 2000);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [socket, isConnected, activeChat, user]);

  // Abrir chat
  const openChat = async (chat) => {
    try {
      setActiveChat(chat);
      const res = await chatAPI.getChatMessages(chat._id);
      if (res.success) setMessages(res.chat.messages || []);

      socket?.emit("joinChat", chat._id);
    } catch (err) {
      console.error("Error abriendo chat:", err);
    }
  };

  // Iniciar nuevo chat
  const startChat = async (participantId) => {
    try {
      const res = await chatAPI.createChat(participantId);
      if (res.success) {
        setChats(prev => [res.chat, ...prev]);
        openChat(res.chat);
      }
    } catch (err) {
      console.error("Error creando chat:", err);
    }
  };

  // Enviar mensaje
// En la función sendMessage del ChatPage, agregar:
const sendMessage = async (e) => {
  e.preventDefault();
  if (!text.trim() || !activeChat || !isConnected) return;

  try {
    // Mensaje optimista
    const tempMessage = {
      _id: Date.now().toString(),
      sender: { _id: user.id, username: user.username, avatar: user.avatar },
      content: text.trim(),
      timestamp: new Date(),
      isSending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    // Asegurar que el socket esté conectado antes de enviar
    await waitForConnection();

    // Enviar mensaje via HTTP API
    const res = await chatAPI.sendMessage(activeChat._id, text.trim());

    if (res.success) {
      // EMITIR NOTIFICACIÓN DE MENSAJE
      const receiver = activeChat.participants.find(p => p._id !== user.id);
      if (receiver) {
        console.log("💌 Emitiendo notificación de mensaje");
        socket.emit("newMessage", {
          chatId: activeChat._id,
          senderId: user.id,
          receiverId: receiver._id,
          messageContent: text.trim()
        });
      }
    } else {
      // Revertir mensaje optimista si falla
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
      setText(tempMessage.content);
    }
  } catch (err) {
    console.error("Error enviando mensaje:", err);
    setMessages((prev) => prev.filter((m) => !m.isSending));
  }
};

  // Emitir typing
  const handleTyping = () => {
    if (activeChat && isConnected) {
      socket?.emit("typing", { chatId: activeChat._id });
    }
  };

  if (!user) return <div>Inicia sesión para usar el chat</div>;

  return (
    <div style={{ display: "flex", gap: 10, height: "80vh" }}>
      {/* Sidebar chats */}
      <aside style={{ width: 240, borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h3>Chats {isConnected ? "🟢" : "🔴"}</h3>
        {chats.map(c => {
          const other = c.participants.find(p => p._id !== user._id);
          return (
            <div
              key={c._id}
              onClick={() => openChat(c)}
              style={{
                cursor: "pointer",
                padding: 10,
                borderBottom: "1px solid #eee",
                backgroundColor: activeChat?._id === c._id ? "#f0f0f0" : "transparent"
              }}
            >
              <div><strong>{other?.username || "Usuario"}</strong></div>
              <div style={{ fontSize: "0.8em", color: "#666" }}>
                {c.lastMessageContent || "Sin mensajes"}
              </div>
            </div>
          );
        })}
      </aside>

      {/* Usuarios disponibles */}
      <div style={{ width: 200, overflowY: "auto" }}>
        <h3>Usuarios disponibles</h3>
        {availableUsers.map(u => (
          <div key={u._id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
            <span>{u.username}</span>
            <button onClick={() => startChat(u._id)}>Chat</button>
          </div>
        ))}
      </div>

      {/* Chat principal */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeChat ? (
          <>
            <div style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 10
            }}>
              {messages.map((m, i) => (
                <div key={m._id || i} style={{ marginBottom: 5 }}>
                  <b>{m.sender?.username || "Usuario"}</b>: {m.content}
                  <span style={{ fontSize: "0.8em", color: "#666", marginLeft: 10 }}>
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}

              {typingUsers.length > 0 && (
                <div style={{ fontStyle: "italic", color: "gray" }}>
                  Escribiendo...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ display: "flex", gap: 10 }}>
              <input
                value={text}
                onChange={(e) => { setText(e.target.value); handleTyping(); }}
                placeholder="Escribe un mensaje..."
                style={{ flex: 1 }}
                disabled={!isConnected}
              />
              <button type="submit" disabled={!text.trim() || !isConnected}>
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 20 }}>
            Selecciona un chat para comenzar
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------ AppHeader con Indicador de Conexión ------------------ */
export function AppHeader() {
  const { user, logout } = useAuth();
  const { isConnected, connectionStatus } = useSocket();

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case "connected":
        return "🟢 Conectado";
      case "reconnecting":
        return "🟡 Reconectando...";
      case "error":
        return "🔴 Error";
      default:
        return "🔴 Desconectado";
    }
  };

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
          <span style={{ fontSize: "12px", color: "#666" }}>
            {getConnectionStatus()}
          </span>
          <span>Hola, {user.username}</span>
          <button onClick={logout} style={{ padding: "5px 10px" }}>
            Cerrar sesión
          </button>
        </div>
      )}
    </header>
  );
}

// Eliminar la exportación default null si no es necesaria
export default null;
