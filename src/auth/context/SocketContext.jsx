// auth/context/SocketContext.jsx
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";


const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth(); // <-- aquí tomamos tu usuario actual
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return; // no conectamos si no hay usuario

    socketRef.current = io("http://localhost:5000", {
      query: { userId: user._id }, // enviamos el ID al servidor
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("🔌 Socket conectado:", socketRef.current.id);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);