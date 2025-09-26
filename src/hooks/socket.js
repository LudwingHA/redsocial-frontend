import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

class SocketManager {
  constructor() {
    this.socket = null;
    this.isInitializing = false;
    this.connectCallbacks = [];
    this.currentUser = null;
  }

  initSocket(user) {
    // Obtener el ID sin importar si es _id o id
    const userId = user?._id || user?.id;
    
    // Validar que el user y user ID existan y sean válidos
    if (!user || !userId || userId === 'undefined' || userId === 'null') {
      console.error('❌ User ID inválido para conectar socket:', userId);
  
      this.disconnect();
      return Promise.reject(new Error('User ID inválido'));
    }

    if (this.socket?.connected && this.currentUser?._id === userId) {
      return Promise.resolve(this.socket);
    }

    if (this.isInitializing) {
      return new Promise((resolve) => {
        this.connectCallbacks.push(resolve);
      });
    }

    this.isInitializing = true;
    this.currentUser = { ...user, _id: userId }; // Normalizar a _id

    return new Promise((resolve, reject) => {
      try {
        // Cerrar socket existente si hay uno
        if (this.socket) {
          this.socket.disconnect();
        }

        // Validar que el userId sea un ObjectId válido (24 caracteres hex)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
        if (!isValidObjectId) {
          console.error('❌ User ID no es un ObjectId válido:', userId);
          this.isInitializing = false;
          reject(new Error('User ID no válido'));
          return;
        }

        this.socket = io(SOCKET_URL, {
          withCredentials: true,
          query: { 
            userId: userId,
            timestamp: Date.now() // Para evitar cache
          },
          autoConnect: true,
          transports: ["websocket", "polling"]
        });

        this.socket.on("connect", () => {
          this.isInitializing = false;
          
          this.connectCallbacks.forEach(callback => callback(this.socket));
          this.connectCallbacks = [];
          
          resolve(this.socket);
        });

        this.socket.on("disconnect", (reason) => {
          
        });

        this.socket.on("connect_error", (error) => {
          console.error("🔌 Error de conexión socket:", error);
          this.isInitializing = false;
          this.connectCallbacks = [];
          reject(error);
        });

        this.socket.on("reconnect", (attemptNumber) => {
      
          if (this.currentUser) {
            this.socket.emit("reauthenticate", { userId: this.currentUser._id });
          }
        });

      } catch (error) {
        console.error("Error inicializando socket:", error);
        this.isInitializing = false;
        this.connectCallbacks = [];
        reject(error);
      }
    });
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isInitializing = false;
    this.connectCallbacks = [];
    this.currentUser = null;
  }

  async waitForConnection() {
    if (this.socket?.connected) {
      return this.socket;
    }
    
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(this.socket);
      } else {
        this.connectCallbacks.push(resolve);
      }
    });
  }
}

const socketManager = new SocketManager();
export default socketManager;