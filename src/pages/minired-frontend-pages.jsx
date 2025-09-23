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
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Inicializar socket
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    const socket = socketRef.current;

    socket.on("connect", () => console.log("🔌 Socket conectado", socket.id));

    socket.on("newMessage", ({ chatId, message }) => {
      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId
            ? { ...c, lastMessage: message.timestamp, messages: [...(c.messages || []), message] }
            : c
        )
      );

      if (activeChat?._id === chatId) {
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    });

    socket.on("typing", ({ chatId, username }) => {
      if (activeChat?._id === chatId && username !== user.username) {
        setTypingUsers((prev) => {
          if (!prev.includes(username)) return [...prev, username];
          return prev;
        });

        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== username));
        }, 2000); // desaparece después de 2s
      }
    });

    socket.on("notification", ({ title, body }) => {
      // Puedes mostrar alerta o toast
      alert(`${title}: ${body}`);
    });

    return () => socket.disconnect();
  }, [activeChat, user.username]);

  // Cargar usuarios disponibles
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await chatAPI.getAllUsers();
      if (res.success) setAvailableUsers(res.users.filter((u) => u._id !== user._id));
    };
    fetchUsers();
  }, [user._id]);

  // Cargar chats del usuario
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await chatAPI.getUserChats();
        if (res.success) setChats(res.chats);
      } catch (err) {
        console.error(err);
      }
    };
    loadChats();
  }, []);

  // Abrir chat
  const openChat = async (chat) => {
    setActiveChat(chat);
    try {
      const res = await chatAPI.getChatMessages(chat._id);
      if (res.success) setMessages(res.chat.messages || []);
      socketRef.current?.emit("joinChat", chat._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Iniciar nuevo chat
  const startChat = async (participantId) => {
    const res = await chatAPI.createChat(participantId);
    if (res.success) openChat(res.chat);
  };

  // Enviar mensaje
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;

    const newMessage = { sender: user._id, content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, { ...newMessage, sender: { username: user.username } }]);
    setText("");

    socketRef.current?.emit("sendMessage", { chatId: activeChat._id, message: newMessage });
  };

  // Emitir typing
  const handleTyping = () => {
    if (activeChat) {
      socketRef.current?.emit("typing", { chatId: activeChat._id, userId: user._id, username: user.username });
    }
  };

  if (!user) return <div>Inicia sesión para usar el chat</div>;

  return (
    <div style={{ display: "flex", gap: 10 }}>
      {/* Sidebar chats */}
      <aside style={{ width: 240, borderRight: "1px solid #ccc" }}>
        <h3>Chats</h3>
        {chats.map((c) => {
          const other = c.participants.find((p) => p._id !== user._id);
          return (
            <div
              key={c._id}
              onClick={() => openChat(c)}
              style={{ cursor: "pointer", padding: 5, borderBottom: "1px solid #eee" }}
            >
              {other?.username || "Chat"}
            </div>
          );
        })}
      </aside>

      {/* Usuarios disponibles */}
      <div style={{ width: 200 }}>
        <h3>Usuarios disponibles</h3>
        {availableUsers.map((u) => (
          <div key={u._id} style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{u.username}</span>
            <button onClick={() => startChat(u._id)}>Iniciar chat</button>
          </div>
        ))}
      </div>

      {/* Chat principal */}
      <main style={{ flex: 1, padding: 10 }}>
        {activeChat ? (
          <>
            <div style={{ height: 400, overflowY: "auto", border: "1px solid #ddd", padding: 5 }}>
              {messages.map((m, i) => (
                <div key={i}>
                  <b>{m.sender?.username || "anon"}</b>: {m.content}
                </div>
              ))}
              {typingUsers.length > 0 && (
                <div style={{ fontStyle: "italic", color: "gray" }}>
                  {typingUsers.join(", ")} está escribiendo...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ marginTop: 10 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleTyping}
                placeholder="Escribe un mensaje..."
                style={{ width: "80%" }}
              />
              <button type="submit">Enviar</button>
            </form>
          </>
        ) : (
          <div>Selecciona un chat</div>
        )}
      </main>
    </div>
  );
}


/* ------------------ Export default (vacío) ------------------ */
export default null;
