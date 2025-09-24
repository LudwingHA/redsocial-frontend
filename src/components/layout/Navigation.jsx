import React from 'react';
import { FiHome, FiMessageSquare, FiUser, FiBell } from 'react-icons/fi';

const menuItems = [
  { key: 'feed', label: 'Feed', icon: FiHome },
  { key: 'chat', label: 'Chat', icon: FiMessageSquare },
  { key: 'profile', label: 'Perfil', icon: FiUser },
  { key: 'notifications', label: 'Notificaciones', icon: FiBell },
];

export function Navigation({ activePage, onPageChange }) {
 return (
  <nav className="w-72 bg-gradient-to-b from-white to-gray-50/80 shadow-2xl min-h-screen p-6 border-r border-gray-200/60">
    <div className="space-y-3">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.key;
        
        return (
          <button
            key={item.key}
            onClick={() => onPageChange(item.key)}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-md'
            }`}
          >
            <Icon 
              size={22} 
              className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'} 
            />
            <span className="font-semibold text-lg">{item.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
}