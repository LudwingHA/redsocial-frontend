import { useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../auth/context/AuthContext";

export const useSocket = () => {
  const { token, user } = useContext(AuthContext);
  const socketRef = useRef();

  useEffect(() => {
    if (!token || !user) return;

    // Conectar socket con token
    const socket = io("http://localhost:4000", {
      auth: { token }
    });

    // Guardar referencia
    socketRef.current = socket;

    // Unirse a sala personal
    socket.emit("joinRoom", user._id);

    // Escuchar mensajes
    socket.on("receiveMessage", (msg) => {
      console.log("Nuevo mensaje recibido:", msg);
    });

    // Escuchar notificaciones
    socket.on("notification", (data) => {
      console.log("Nueva notificación:", data);
    });

    return () => socket.disconnect();
  }, [token, user]);

  return socketRef;
};
