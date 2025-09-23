// minired-frontend-pages.jsx
// Conjunto de páginas y componentes (sin diseño) para:
// - Editar perfil y cambiar avatar
// - Feed dinámico con posts (texto/imagen), likes y comentarios (sin recargar)
// - Componer post con subida de imagen
// - Chat privado básico en tiempo real (socket.io-client)
// - Sistema simple de seguidores
// - Notificaciones simples (evento: nuevo mensaje, nuevo like)

/*
Requisitos:
- Tener los servicios api: userAPI, postAPI, chatAPI (ya los tienes)
- Tener useAuth (AuthContext) exportando { user, updateUser }
- Instalar socket.io-client: npm i socket.io-client
- Integrar las páginas en tu router (react-router-dom)

Uso:
import { FeedPage, ProfileEditPage, ChatPage } from './minired-frontend-pages.jsx'
*/

import React, { useEffect, useState, useRef } from "react"; // ajusta ruta
import { postAPI, userAPI, chatAPI } from "../api/api"; // ajusta ruta
import { io } from "socket.io-client";
import { useAuth } from "../auth/context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

/* ------------------ Helper: Notifications (simple) ------------------ */
export function Notifications({ socket }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!socket) return;
    const onNotify = (payload) => {
      setItems((prev) => [payload, ...prev].slice(0, 20));
    };

    socket.on("notification", onNotify);
    return () => socket.off("notification", onNotify);
  }, [socket]);

  if (items.length === 0) return null;
  return (
    <div aria-live="polite">
      {items.map((it, i) => (
        <div key={i}>
          {it.title ?? "Notificación"} - {it.body}
        </div>
      ))}
    </div>
  );
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

/* ------------------ PostCard (like + comments without reload) ------------------ */
function CommentList({ comments, onAdd }) {
  const [text, setText] = useState("");
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await onAdd(text);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      {comments?.map((c) => (
        <div key={c._id || c.timestamp}>
          {c.author?.username || "anon"}: {c.content}
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

export function PostCard({ post, onLikeToggle, onCommentAdd }) {
  const [localPost, setLocalPost] = useState(post);

  useEffect(() => setLocalPost(post), [post]);

  const handleLike = async () => {
    try {
      const res = await postAPI.toggleLike(localPost._id);
      if (res.success) {
        setLocalPost((prev) => ({
          ...prev,
          likes: res.likes,
          likesCount: res.likesCount,
        }));
        onLikeToggle && onLikeToggle(localPost._id, res);
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

  return (
    <article>
      <div>{localPost.author?.username}</div>
      <div>{localPost.content}</div>
      {localPost.image && (
        <img
          src={`http://localhost:5000${localPost.image}`}
          alt="post"
          style={{ maxWidth: 300 }}
        />
      )}
      <div>Likes: {localPost.likes?.length ?? 0}</div>
      <button onClick={handleLike}>Me gusta</button>
      <CommentList comments={localPost.comments} onAdd={addComment} />
    </article>
  );
}

/* ------------------ FeedPage (dinámico, paginación simple) ------------------ */
export function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    loadPage(page);
  }, [page]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    const socket = socketRef.current;
    socket.on("connect", () => console.log("socket conectado", socket.id));

    // recibir nuevo post en tiempo real
    socket.on("newPost", (post) => {
      setPosts((prev) => [post, ...prev]);
    });

    // actualizar like en tiempo real
    socket.on("postLiked", ({ postId, likes }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes } : p))
      );
    });

    return () => socket.disconnect();
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
    // optimista: agregar al inicio
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div>
      <h2>Feed</h2>
      <PostComposer onPosted={handlePosted} />
      <div>
        {posts.map((p) => (
          <PostCard key={p._id || p.createdAt} post={p} />
        ))}
      </div>
      <div>
        <button onClick={() => setPage((prev) => prev + 1)} disabled={loading}>
          Cargar más
        </button>
      </div>
    </div>
  );
}

/* ------------------ Followers / Follow toggle (simple) ------------------ */
export function FollowButton({ targetUserId, initialFollowing, onChange }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await userAPI.toggleFollow(targetUserId);
      if (res.success) {
        setFollowing(res.following); // backend puede devolver estado
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

/* ------------------ ChatPage (básico, tiempo real) ------------------ */


export function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Inicializar socket
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(SOCKET_URL, { 
      withCredentials: true,
      query: { userId: user._id }
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
      
      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId
            ? { 
                ...c, 
                lastMessage: message.timestamp, 
                lastMessageContent: message.content 
              }
            : c
        )
      );

      if (activeChat?._id === chatId) {
        setMessages((prev) => {
          // Evitar duplicados
          const exists = prev.find((m) => 
            m._id === message._id || 
            (m.timestamp === message.timestamp && m.content === message.content)
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

        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
        }, 2000);
      }
    });

    socket.on("notification", ({ title, body }) => {
      console.log("Notificación:", title, body);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, activeChat]);

  // Cargar usuarios disponibles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await chatAPI.getAllUsers();
        if (res.success) setAvailableUsers(res.users.filter((u) => u._id !== user._id));
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
        setChats(prev => [res.chat, ...prev]);
        openChat(res.chat);
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
      // Enviar mensaje via HTTP API
      const res = await chatAPI.sendMessage(activeChat._id, text);
      
      if (res.success) {
        setText("");
        // El socket se encargará de actualizar la interfaz via el evento "newMessage"
      }
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  // Emitir typing
  const handleTyping = () => {
    if (activeChat && isConnected) {
      socketRef.current?.emit("typing", { chatId: activeChat._id });
    }
  };

  if (!user) return <div>Inicia sesión para usar el chat</div>;

  return (
    <div style={{ display: "flex", gap: 10, height: "80vh" }}>
      {/* Sidebar chats */}
      <aside style={{ width: 240, borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h3>Chats {isConnected ? "🟢" : "🔴"}</h3>
        {chats.map((c) => {
          const other = c.participants.find((p) => p._id !== user._id);
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
        {availableUsers.map((u) => (
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
                onChange={(e) => {
                  setText(e.target.value);
                  handleTyping();
                }}
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

/* ------------------ Export default (vacío) ------------------ */
export default null;
