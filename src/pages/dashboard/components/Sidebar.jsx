import { FaSignOutAlt, FaCircle, FaUserFriends } from 'react-icons/fa';

export default function Sidebar({ onlineUsers, chatUser, setChatUser, logout, user }) {
  return (
    <div className="w-80 bg-background-secondary border-r border-border min-h-screen p-6">
      {/* Header del usuario actual */}
      <div className="flex items-center space-x-3 mb-6 p-3 bg-background-primary rounded-lg border border-border">
        <img
          src={`http://localhost:4000${user.avatar}`}
          alt={user.username}
          className="w-12 h-12 rounded-full border-2 border-primary-500"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">{user.username}</h3>
          <p className="text-sm text-green-500 flex items-center">
            <FaCircle className="text-xs mr-1" />
            En línea
          </p>
        </div>
      </div>

      {/* Lista de usuarios online */}
      <div className="mb-6">
        <div className="flex items-center text-text-primary mb-3">
          <FaUserFriends className="mr-2" />
          <h3 className="font-semibold">Usuarios Online ({onlineUsers.length})</h3>
        </div>
        
        {onlineUsers.length === 0 ? (
          <p className="text-text-tertiary text-center py-4 text-sm">No hay otros usuarios conectados</p>
        ) : (
          <div className="space-y-2">
            {onlineUsers.map((u) => (
              <div
                key={u.userId}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                  chatUser === u.userId 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'bg-background-primary hover:bg-background-tertiary text-text-primary border border-border'
                }`}
                onClick={() => setChatUser(u.userId)}
              >
                <div className="relative">
                  <img
                    src={`http://localhost:4000${u.avatar}`}
                    alt={u.username}
                    className="w-10 h-10 rounded-full border-2 border-border"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="ml-3">
                  <div className="font-medium">{u.username}</div>
                  <div className="text-xs opacity-75">Haz clic para chatear</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Botón de logout */}
      <button 
        onClick={logout}
        className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-all flex items-center justify-center font-medium mt-auto"
      >
        <FaSignOutAlt className="mr-2" />
        Cerrar sesión
      </button>
    </div>
  );
}