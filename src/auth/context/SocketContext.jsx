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

  useEffect(() => {
    console.log('🔍 SocketProvider - User actualizado:', user);
    
    // Función para validar el usuario
    const validateUser = (user) => {
      if (!user) {
        return { valid: false, error: 'Usuario no autenticado' };
      }
      
      // Obtener ID sin importar si es _id o id
      const userId = user._id || user.id;
      
      if (!userId) {
        return { valid: false, error: 'ID de usuario no encontrado' };
      }
      
      if (userId === 'undefined' || userId === 'null') {
        return { valid: false, error: 'ID de usuario inválido' };
      }
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
      if (!isValidObjectId) {
        return { valid: false, error: 'Formato de ID de usuario inválido' };
      }
      
      return { valid: true, userId };
    };

    if (!user) {
      console.log('🔌 No hay usuario, desconectando socket...');
      socketManager.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setError(null);
      return;
    }

    // Validar el usuario antes de conectar
    const validation = validateUser(user);
    console.log('🔍 Validación del usuario:', validation);
    
    if (!validation.valid) {
      console.error('❌ Usuario inválido para conexión socket:', validation.error);
      socketManager.disconnect();
      setIsConnected(false);
      setConnectionStatus('error');
      setError(validation.error);
      return;
    }

    setError(null);
    setConnectionStatus('connecting');

    socketManager.initSocket(user)
      .then((socket) => {
        console.log('✅ Socket conectado exitosamente');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);

        socket.on('disconnect', (reason) => {
          console.log('🔌 Socket desconectado:', reason);
          setIsConnected(false);
          setConnectionStatus('disconnected');
        });

        socket.on('reconnect', (attemptNumber) => {
          console.log(`🔌 Socket reconectado (intento ${attemptNumber})`);
          setIsConnected(true);
          setConnectionStatus('connected');
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔌 Intentando reconectar... (${attemptNumber})`);
          setConnectionStatus('reconnecting');
        });

        socket.on('connect_error', (error) => {
          console.error('🔌 Error de conexión:', error);
          setConnectionStatus('error');
          setError(error.message);
        });

      })
      .catch((error) => {
        console.error('❌ Error inicializando socket:', error);
        setConnectionStatus('error');
        setError(error.message);
        setIsConnected(false);
      });

    return () => {
      const socket = socketManager.getSocket();
      if (socket) {
        socket.off('disconnect');
        socket.off('reconnect');
        socket.off('reconnect_attempt');
        socket.off('connect_error');
      }
    };
  }, [user]);

  const value = {
    socket: socketManager.getSocket(),
    isConnected,
    connectionStatus,
    error,
    waitForConnection: socketManager.waitForConnection.bind(socketManager)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}