import { useTheme } from "../../context/ThemeContext";
import { useDashboard } from "../../hooks/useDashboard";
import Chat from "./components/Chat";
import PostFeed from "./components/PostFeed";
import Sidebar from "./components/Sidebar";


export default function Dashboard() {
  const {
    user,
    posts,
    newPost,
    newImage,
    chatUser,
    chatText,
    messages,
    onlineUsers,
    setNewPost,
    setNewImage,
    setChatUser,
    setChatText,
    logout,
    handleCreatePost,
    handleLike,
    handleComment,
    handleSendMessage
  } = useDashboard();

  const { themeName, toggleTheme } = useTheme();

  if (!user) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-text-primary">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <div className="flex">
        <Sidebar
          onlineUsers={onlineUsers}
          chatUser={chatUser}
          setChatUser={setChatUser}
          logout={logout}
          user={user}
        />
        
        <PostFeed
          user={user}
          posts={posts}
          newPost={newPost}
          newImage={newImage}
          setNewPost={setNewPost}
          setNewImage={setNewImage}
          onCreatePost={handleCreatePost}
          onLike={handleLike}
          onComment={handleComment}
        />
        
        <Chat
          chatUser={chatUser}
          chatText={chatText}
          messages={messages}
          setChatText={setChatText}
          onSendMessage={handleSendMessage}
          user={user}
        />
      </div>

      {/* Botón para cambiar tema */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all flex items-center justify-center z-50"
        title={`Cambiar a modo ${themeName === 'light' ? 'oscuro' : 'claro'}`}
      >
        {themeName === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Notificación de conexión */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center">
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
        Conectado como {user.username}
      </div>
    </div>
  );
}