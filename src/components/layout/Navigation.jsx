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
    key: "settings",
    label: "Configuraciones",
    icon: FiSettings,
    path: "/settings",
  },
];

export function Navigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
return (
  <nav className="w-full lg:w-80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg lg:min-h-[calc(100vh-80px)] p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-gray-700/60 transition-all duration-300">
    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.key}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group min-w-max lg:min-w-0 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white hover:shadow-md border border-transparent hover:border-slate-200/60 dark:hover:border-gray-600/60"
              }`
            }
          >
            <Icon size={20} />
            <span className="font-medium text-sm lg:text-base">{item.label}</span>
          </NavLink>
        );
      })}

      <button
        onClick={() => navigate(`/profile/${user?.id}`)}
        className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group min-w-max lg:min-w-0 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-white hover:shadow-md border border-transparent hover:border-slate-200/60 dark:hover:border-gray-600/60"
      >
        <FiUser size={20} />
        <span className="font-medium text-sm lg:text-base">Perfil</span>
      </button>
    </div>
  </nav>
);
}
