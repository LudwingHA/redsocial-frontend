import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import socketManager from '../../hooks/socket';

const SocketContext = createContext();

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe ser usado dentro de SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // <--- Nuevo estado

  useEffect(() => {
    if (!user) {
      socketManager.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setError(null);
      setOnlineUsers([]);
      return;
    }

    const userId = user._id || user.id;
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.error('❌ ID de usuario inválido');
      socketManager.disconnect();
      setIsConnected(false);
      setConnectionStatus('error');
      setError('ID de usuario inválido');
      return;
    }

    setError(null);
    setConnectionStatus('connecting');

    socketManager.initSocket(user)
      .then((socket) => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);

        // Manejo de desconexión/reconexión
        socket.on('disconnect', () => {
          setIsConnected(false);
          setConnectionStatus('disconnected');
        });

        socket.on('reconnect', () => {
          setIsConnected(true);
          setConnectionStatus('connected');
        });

        socket.on('reconnect_attempt', () => setConnectionStatus('reconnecting'));

        socket.on('connect_error', (err) => {
          setConnectionStatus('error');
          setError(err.message);
        });

        // ← Aquí escuchamos la lista de usuarios online
        socket.on('updateOnlineUsers', (users) => {
          setOnlineUsers(users);
        });

      })
      .catch((err) => {
        setConnectionStatus('error');
        setError(err.message);
        setIsConnected(false);
      });

    return () => {
      const socket = socketManager.getSocket();
      if (socket) {
        socket.off('disconnect');
        socket.off('reconnect');
        socket.off('reconnect_attempt');
        socket.off('connect_error');
        socket.off('updateOnlineUsers'); // limpiar listener
      }
    };
  }, [user]);

  const value = {
    socket: socketManager.getSocket(),
    isConnected,
    connectionStatus,
    error,
    onlineUsers, // <--- Exponemos el estado
    waitForConnection: socketManager.waitForConnection.bind(socketManager)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
