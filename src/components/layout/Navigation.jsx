import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiSend,
  FiUser,
  FiLogOut,
  FiWifi,
  FiWifiOff,
  FiBell,
  FiSettings, 
} from "react-icons/fi";
import { useAuth } from "../../auth/context/AuthContext";
import { useSocket } from "../../auth/context/SocketContext";
import { NotificationBell } from "../Notification/NotificationBell";
import ThemeToggle from "../ThemeToggle";

const menuItems = [
  { key: "feed", label: "Inicio", icon: FiHome, path: "/" },
  // { key: "explore", label: "Explorar", icon: FiSearch, path: "/explore" },
  // { key: "post", label: "Crear", icon: FiPlusSquare, path: "/create" },
  { key: "chat", label: "Mensajes", icon: FiSend, path: "/chat" },
  {key: "settings", label: "Settings", icon: FiSettings, path: "/settings"}
];

export function Navigation() {
  const { user, logout } = useAuth();
  const { connectionStatus } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const profilePath = `/profile/${user?.id}`;

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case "connected":
        return { text: "Conectado", icon: <FiWifi className="text-green-500" /> };
      case "reconnecting":
        return { text: "Reconectando...", icon: <FiWifi className="text-yellow-500 animate-pulse" /> };
      case "error":
        return { text: "Error", icon: <FiWifiOff className="text-red-500" /> };
      default:
        return { text: "Desconectado", icon: <FiWifiOff className="text-gray-400" /> };
    }
  };

  const status = getConnectionStatus();

  if (!user) return null;

  const getIsActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/profile") return location.pathname.startsWith("/profile/");
    return location.pathname.startsWith(path);
  };

  return (
    <>

      <nav className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200/60 dark:border-gray-700/60 z-50 lg:hidden shadow-xl h-14 sm:h-16">
        <div className="flex justify-around items-center h-full max-w-xl mx-auto px-2 sm:px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.path);

            if (item.key === "post") {
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.path)}
                  className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform hover:scale-105 transition-transform duration-300"
                  title={item.label}
                >
                  <Icon size={24} />
                </button>
              );
            }
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                  isActive
                    ? "text-purple-600 dark:text-pink-400" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
                title={item.label}
              >
                <Icon size={24} className={`${isActive ? "scale-105" : ""}`} />
              </NavLink>
            );
          })}
          <NavLink
            to={profilePath}
            className={`flex items-center justify-center p-1 rounded-full border-2 transition-all duration-300 ${
              getIsActive("/profile")
                ? "border-purple-500 dark:border-pink-400 scale-105"
                : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            title="Perfil"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-sm font-bold uppercase">
                {user.username?.charAt(0)}
              </span>
            </div>
          </NavLink>
          <NotificationBell 
            iconClass="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-pink-400"
            buttonClass="p-2 sm:p-3 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
          />
        </div>
      </nav>
      <aside className="hidden lg:flex flex-col justify-between fixed left-0 top-0 h-screen w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200/60 dark:border-gray-700/60 z-40 transition-all duration-300 shadow-lg">
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 my-4 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
              MiRedSocial
            </h1>
          </div>

          {/* Menú principal */}
          <div className="flex flex-col gap-1 mt-4">
            {[...menuItems, { key: "notifications", label: "Notificaciones", icon: FiBell, path: "/notifications" }].map((item) => {
              const Icon = item.icon;
              const path = item.key === "profile" ? profilePath : item.path;
              const isActive = getIsActive(item.path);
              
              const baseClasses = "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-lg";
              const activeClasses = "bg-purple-500/10 dark:bg-purple-900/30 text-purple-600 dark:text-pink-400 font-bold border border-purple-200/50 dark:border-purple-700/50";
              const inactiveClasses = "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100";

              if (item.key === "notifications") {
                return (
                  <div key={item.key} className={`${baseClasses} ${inactiveClasses}`}>
                    <NotificationBell 
                      iconClass="text-current"
                      buttonClass="p-0"
                      size={24}
                    />
                    <span className="text-lg">{item.label}</span>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.key}
                  to={path}
                  className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                >
                  <Icon size={24} className={isActive ? "fill-current" : ""} />
                  <span className="text-lg">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
          <NavLink
            to={profilePath}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl mt-2 transition-all duration-200 border-2 ${
              getIsActive("/profile")
                ? "border-purple-500 dark:border-pink-400 bg-purple-500/10 dark:bg-purple-900/30 font-bold"
                : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50"
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold uppercase">
                {user.username?.charAt(0)}
              </span>
            </div>
            <span className="text-lg text-gray-800 dark:text-gray-200">Perfil</span>
          </NavLink>
        </div>

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
   
          <div className="flex items-center gap-3 bg-gray-100/70 dark:bg-gray-800/70 px-4 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            {status.icon}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {status.text}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <ThemeToggle />
            
            <button
              onClick={logout}
              className="flex items-center gap-2 p-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 font-medium"
              title="Cerrar sesión"
            >
              <FiLogOut size={20} />
              <span className="text-base hidden sm:block">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}