import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiMessageSquare,
  FiUser,
  FiBell,
  FiSettings,
} from "react-icons/fi";
import { useAuth } from "../../auth/context/AuthContext";

const menuItems = [
  { key: "feed", label: "Feed", icon: FiHome, path: "/" },
  { key: "chat", label: "Chat", icon: FiMessageSquare, path: "/chat" },
  {
    key: "notifications",
    label: "Notificaciones",
    icon: FiBell,
    path: "/notifications",
  },
  {
    key: "settings",
    label: "Configuraciones",
    icon: FiSettings,
    path: "/settings",
  },
];

export function Navigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  console.log(user);

 return (
  <nav className="w-72 bg-gradient-to-b from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-800/80 shadow-2xl min-h-screen p-6 border-r border-gray-200/60 dark:border-gray-700/60 transition-colors duration-300">
    <div className="space-y-3">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.key}
            to={item.path}
            end
            className={({ isActive }) =>
              `w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                  : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white hover:shadow-md"
              }`
            }
          >
            <Icon
              size={22}
              className={({ isActive }) =>
                isActive
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
              }
            />
            <span className="font-semibold text-lg">{item.label}</span>
          </NavLink>
        );
      })}

      {/* Perfil dinámico del usuario logueado */}
      <button
        onClick={() => navigate(`/profile/${user?.id}`)}
        className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white hover:shadow-md"
      >
        <FiUser
          size={22}
          className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
        />
        <span className="font-semibold text-lg">Perfil</span>
      </button>
    </div>
  </nav>
);
}
