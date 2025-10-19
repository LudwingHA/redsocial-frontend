import React from 'react';
import { FiUserPlus, FiUsers } from 'react-icons/fi';
import { URL_SERVER } from '../../api/url';

export function UsersList({ users = [], onUserSelect, searchTerm, onMenuToggle }) {
  if (searchTerm && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-6 text-center">
        <FiUserPlus size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-lg font-semibold mb-2">No se encontraron usuarios</p>
        <p className="text-sm">
          No hay usuarios que coincidan con "{searchTerm}"
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-6 text-center">
        <FiUsers size={48} className="mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-lg font-semibold mb-2">No hay usuarios disponibles</p>
        <p className="text-sm">
          Todos los usuarios están en tus chats o no hay más usuarios registrados
        </p>
      </div>
    );
  }
// UsersList.jsx - RETURN Mejorado

return (
  <div className="h-full overflow-y-auto bg-white dark:bg-gray-900 transition-colors duration-300">
    <div className="p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-900 shadow-sm">
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
        Usuarios para chatear
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Encuentra a alguien en línea para empezar un chat privado.</p>
    </div>
    
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => onUserSelect(user._id)}
          className="p-3 lg:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 group flex items-center space-x-3 lg:space-x-4 border-l-4 border-transparent hover:border-blue-500/50 dark:hover:border-blue-700/50"
        >
          <div className="relative flex-shrink-0">
            <img
              src={user.avatar ? `${URL_SERVER}${user.avatar}` : "/default-avatar.png"}
              alt={user.username}
              onError={(e) => { e.target.src = "/default-avatar.png"; }}
              className="w-14 h-14 rounded-full object-cover border-3 border-white dark:border-gray-900 shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            {user.isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-lg" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate">
              {user.username}
            </h4>
            <p className={`text-sm truncate mt-1 ${user.isOnline ? 'text-green-500 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
              {user.isOnline ? 'En línea ahora' : (user.bio || 'Sin biografía')}
            </p>
          </div>

          <button className="bg-blue-500 text-white p-2 lg:p-2.5 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 flex-shrink-0"
            title="Iniciar chat"
          >
            <FiUserPlus size={18} />
          </button>
        </div>
      ))}
    </div>
  </div>
);
}