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
    <nav className="w-64 bg-white shadow-lg min-h-screen p-4">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.key;
          
          return (
            <button
              key={item.key}
              onClick={() => onPageChange(item.key)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}