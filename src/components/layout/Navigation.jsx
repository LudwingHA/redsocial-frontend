import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiPlusSquare,
  FiMessageSquare,
  FiSettings,
  FiSend,
} from "react-icons/fi";
import { useAuth } from "../../auth/context/AuthContext";
import { NotificationBell } from "../Notification/NotificationBell"; // Re-importado para la nav inferior

const menuItems = [
  { key: "feed", label: "Inicio", icon: FiHome, path: "/" },
  { key: "explore", label: "Explorar", icon: FiSearch, path: "/explore", hiddenOnMobile: true },
  { key: "post", label: "Crear", icon: FiPlusSquare, path: "/create", hiddenOnMobile: true },
  { key: "chat", label: "Mensajes", icon: FiMessageSquare, path: "/chat" },
  { key: "configuracion", label: "configuracion", icon: FiSettings, path: "/settings" },
];

// Componente para el NavLink estándar (Sidebar)
const NavItem = ({ item, isActive, navigate, user }) => {
  const Icon = item.icon;
  
  if (item.key === 'notifications') {
    return (
        <div className={`p-0 flex items-center ${isActive ? 'lg:hidden' : ''}`}>
             <NavLink
                to={item.path}
                end
                className={({ isActive: navActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group min-w-max lg:min-w-full ${
                        navActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/30 dark:shadow-purple-500/30 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-gray-800/50 hover:text-slate-900 dark:hover:text-white border border-transparent"
                    }`
                }
            >
                <NotificationBell isMobile={false} />
                <span className="font-medium text-sm lg:text-base">{item.label}</span>
            </NavLink>
        </div>
    );
  }

  return (
    <NavLink
      key={item.key}
      to={item.path}
      end
      className={({ isActive: navActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group min-w-max lg:min-w-full ${
          navActive
            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/30 dark:shadow-purple-500/30 font-semibold"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-gray-800/50 hover:text-slate-900 dark:hover:text-white border border-transparent"
        }`
      }
    >
      <Icon size={20} />
      <span className="font-medium text-sm lg:text-base hidden lg:block">{item.label}</span> {/* Oculto en nav inferior */}
    </NavLink>
  );
};


export function Navigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profilePath = `/profile/${user?.id}`;

  return (
    <>
      {/* 1. Barra de Navegación Lateral (Desktop: lg+) */}
      <nav className="hidden lg:block lg:w-64 xl:w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl lg:min-h-[calc(100vh-65px)] p-6 border-r border-slate-200/60 dark:border-gray-700/60 transition-all duration-300 flex-shrink-0">
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavItem key={item.key} item={item} navigate={navigate} user={user} />
          ))}

          {/* Enlace de Perfil para Desktop */}
          <NavLink
            to={profilePath}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group min-w-max lg:min-w-full ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/30 dark:shadow-purple-500/30 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-gray-800/50 hover:text-slate-900 dark:hover:text-white border border-transparent"
              }`
            }
          >
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white text-xs font-bold uppercase">
                    {user.username?.charAt(0)}
                </span>
            </div>
            <span className="font-medium text-sm lg:text-base">Perfil</span>
          </NavLink>
        </div>
      </nav>

      {/* 2. Barra de Navegación Inferior (Móvil: <lg) */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-gray-700/80 z-40 lg:hidden shadow-2xl">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-2">
          {menuItems
            .filter(item => !item.hiddenOnMobile) // Filtra items para móvil
            .map((item) => {
              const Icon = item.icon;
              if (item.key === 'notifications') { // En móvil, la campana de notificación está en la nav
                  return <NotificationBell key={item.key} isMobile={true} />;
              }
              if (item.key === 'chat') { // Mensajes Directos en móvil (como Instagram)
                  return (
                    <NavLink
                        key={item.key}
                        to={item.path}
                        className={({ isActive }) =>
                            `p-2 transition-all duration-300 ${
                            isActive
                                ? "text-purple-600 dark:text-purple-400 scale-110"
                                : "text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400"
                            }`
                        }
                    >
                        <FiSend size={24} />
                    </NavLink>
                  );
              }
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `p-2 transition-all duration-300 ${
                      isActive
                        ? "text-purple-600 dark:text-purple-400 scale-110"
                        : "text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400"
                    }`
                  }
                >
                  <Icon size={24} />
                </NavLink>
              );
            })}
            
            {/* Avatar del Usuario para Perfil en Móvil */}
            <NavLink
                to={profilePath}
                className={({ isActive }) =>
                    `p-1 transition-all duration-300 rounded-full ${
                        isActive
                        ? "ring-2 ring-offset-2 ring-purple-500 ring-offset-white dark:ring-offset-gray-900"
                        : ""
                    }`
                }
            >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold uppercase">
                        {user.username?.charAt(0)}
                    </span>
                </div>
            </NavLink>
        </div>
      </nav>
    </>
  );
}