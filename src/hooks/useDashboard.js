// hooks/useDashboard.js
import { useContext, useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { getPosts, createPost, toggleLike, addComment, getMessages } from "../utils/api";
import { AuthContext } from "../auth/context/AuthContext";

export function useDashboard() {
  const { user, logout, token } = useContext(AuthContext);
  const socketRef = useSocket();

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [chatUser, setChatUser] = useState("");
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Cargar posts
  useEffect(() => {
    const loadPosts = async () => setPosts(await getPosts());
    loadPosts();
  }, []);

  // Socket.IO logic
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.emit("userConnected", user._id);

    socketRef.current.on("onlineUsers", (users) => {
      setOnlineUsers(users.filter((id) => id !== user._id));
    });

    socketRef.current.on("receiveMessage", (msg) => {
      if (msg.sender === chatUser || msg.receiver === chatUser) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socketRef.current?.off("onlineUsers");
      socketRef.current?.off("receiveMessage");
    };
  }, [socketRef, user._id, chatUser]);

  // Post actions
  const handleCreatePost = async () => {
    if (!newPost && !newImage) return;
    const post = await createPost(newPost, newImage, token);
    setPosts((prev) => [post, ...prev]);
    setNewPost("");
    setNewImage(null);
  };

  const handleLike = async (postId) => {
    const updatedPost = await toggleLike(postId);
    setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
  };

  const handleComment = async (postId, text) => {
    if (!text) return;
    const updatedPost = await addComment(postId, text);
    setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
  };

  // Chat actions
  const handleSendMessage = () => {
    if (!chatText || !chatUser || !socketRef.current) return;

    const msg = { sender: user._id, receiver: chatUser, text: chatText };
    socketRef.current.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setChatText("");
  };

  const loadMessages = async () => {
    if (!chatUser) return;
    const msgs = await getMessages(chatUser);
    setMessages(msgs);
  };

  useEffect(() => {
    loadMessages();
  }, [chatUser]);

  return {
    // State
    user,
    posts,
    newPost,
    newImage,
    chatUser,
    chatText,
    messages,
    onlineUsers,
    
    // Setters
    setNewPost,
    setNewImage,
    setChatUser,
    setChatText,
    
    // Actions
    logout,
    handleCreatePost,
    handleLike,
    handleComment,
    handleSendMessage
  };
}