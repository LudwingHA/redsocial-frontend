import React from 'react';
import { FiUserPlus, FiUsers } from 'react-icons/fi';

export function UsersList({ users, onUserSelect, searchTerm }) {
  if (searchTerm && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <FiUserPlus size={48} className="mb-4 text-gray-300" />
        <p className="text-center">No se encontraron usuarios</p>
        <p className="text-sm text-center mt-2">
          No hay usuarios que coincidan con "{searchTerm}"
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <FiUsers size={48} className="mb-4 text-gray-300" />
        <p className="text-center">No hay usuarios disponibles</p>
        <p className="text-sm text-center mt-2">
          Todos los usuarios están en tus chats o no hay más usuarios registrados
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Usuarios disponibles</h3>
        <p className="text-sm text-gray-600">Selecciona un usuario para comenzar a chatear</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {users.map((user) => (
          <div
            key={user._id}
            onClick={() => onUserSelect(user._id)}
            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <img
                src={`http://localhost:5000${user.avatar}`}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{user.username}</h4>
                {user.bio && (
                  <p className="text-sm text-gray-600 truncate">{user.bio}</p>
                )}
              </div>
              
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                <FiUserPlus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}