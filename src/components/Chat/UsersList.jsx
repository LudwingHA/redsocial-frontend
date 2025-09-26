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

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-white/80 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-900/50 transition-colors duration-300">
      <div className="p-4 lg:p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white to-gray-50/80 dark:from-gray-800 dark:to-gray-900/80">
        <h3 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Usuarios disponibles ({users.length})
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Selecciona un usuario para comenzar a chatear</p>
      </div>
      
      <div className="divide-y divide-gray-100/50 dark:divide-gray-700/50">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => onUserSelect(user._id)}
            className="p-3 lg:p-4 cursor-pointer hover:bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 group flex items-center space-x-3 lg:space-x-4"
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.avatar ? `${URL_SERVER}${user.avatar}` : "/default-avatar.png"}
                alt={user.username}
                onError={(e) => { e.target.src = "/default-avatar.png"; }}
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md group-hover:scale-105 transition-transform duration-300"
              />
              {user.isOnline && (
                <span className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full shadow-md" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm lg:text-base truncate">
                {user.username}
              </h4>
              {user.bio && (
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                  {user.bio}
                </p>
              )}
            </div>

            <button className="bg-gradient-to-r from-green-500 to-blue-500 dark:from-green-600 dark:to-blue-600 hover:from-green-600 hover:to-blue-600 dark:hover:from-green-700 dark:hover:to-blue-700 text-white p-2 lg:p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 flex-shrink-0">
              <FiUserPlus size={16} className="lg:w-4 lg:h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}