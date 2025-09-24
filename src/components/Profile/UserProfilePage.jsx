import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProfileFeed } from '../../hooks/useProfileFeed.jsx';
import { PostCard } from '../Feed/PostCard';
import { URL_SERVER } from '../../api/url.js';
import { useAuth } from '../../auth/context/AuthContext';
import { userAPI } from '../../api/api';
import { FiUsers, FiUserPlus, FiUserCheck, FiX } from 'react-icons/fi';

export function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { userInfo, posts, loading, hasMore, loadMorePosts, refreshProfile } = useProfileFeed(userId);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser && currentUser.id === userId;

  const handleFollow = async () => {
    if (!currentUser || followLoading) return;
    
    setFollowLoading(true);
    try {
      if (userInfo.isFollowing) {
        await userAPI.unfollowUser(userId);
      } else {
        await userAPI.followUser(userId);
      }
      await refreshProfile();
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Función para manejar el clic en el backdrop
  const handleBackdropClick = (e, modalType) => {
    if (e.target === e.currentTarget) {
      if (modalType === 'followers') {
        setShowFollowers(false);
      } else if (modalType === 'following') {
        setShowFollowing(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header del perfil con gradiente */}
      {userInfo && (
        <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6 flex-1">
                <div className="relative">
                  <img 
                    src={URL_SERVER + userInfo.avatar} 
                    alt={userInfo.username} 
                    className="w-24 h-24 rounded-full border-4 border-white/30 shadow-2xl object-cover" 
                  />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-3xl font-bold">{userInfo.username}</h2>
                    {!isOwnProfile && currentUser && (
                      <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                          userInfo.isFollowing 
                            ? 'bg-white/20 hover:bg-white/30 border border-white/30' 
                            : 'bg-white text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {followLoading ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : userInfo.isFollowing ? (
                          <>
                            <FiUserCheck size={16} />
                            <span>Siguiendo</span>
                          </>
                        ) : (
                          <>
                            <FiUserPlus size={16} />
                            <span>Seguir</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                    {userInfo.bio || 'Este usuario aún no ha agregado una biografía...'}
                  </p>
                  
                  {/* Estadísticas interactivas */}
                  <div className="flex items-center space-x-8">
                    <button 
                      onClick={() => setShowFollowers(true)}
                      className="text-center hover:scale-105 transition-transform duration-200"
                    >
                      <div className="text-2xl font-bold">{userInfo.followersCount || 0}</div>
                      <div className="text-blue-100 text-sm flex items-center space-x-1">
                        <FiUsers size={14} />
                        <span>Seguidores</span>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setShowFollowing(true)}
                      className="text-center hover:scale-105 transition-transform duration-200"
                    >
                      <div className="text-2xl font-bold">{userInfo.followingCount || 0}</div>
                      <div className="text-blue-100 text-sm flex items-center space-x-1">
                        <FiUserPlus size={14} />
                        <span>Siguiendo</span>
                      </div>
                    </button>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">{posts.length}</div>
                      <div className="text-blue-100 text-sm">Publicaciones</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seguidores recientes */}
            {userInfo.followers && userInfo.followers.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                  <FiUsers size={18} />
                  <span>Seguidores recientes</span>
                </h3>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {userInfo.followers.slice(0, 6).map((follower, index) => (
                    <div key={follower._id || index} className="flex flex-col items-center space-y-1 flex-shrink-0">
                      <img 
                        src={URL_SERVER + follower.avatar} 
                        alt={follower.username} 
                        className="w-12 h-12 rounded-full border-2 border-white/50 object-cover hover:scale-110 transition-transform duration-200" 
                      />
                      <span className="text-xs text-blue-100 truncate max-w-[70px]">{follower.username}</span>
                    </div>
                  ))}
                  {userInfo.followers.length > 6 && (
                    <button 
                      onClick={() => setShowFollowers(true)}
                      className="flex flex-col items-center justify-center space-y-1 flex-shrink-0 w-12 hover:scale-105 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                        <span className="text-lg font-bold">+{userInfo.followers.length - 6}</span>
                      </div>
                      <span className="text-xs text-blue-100">Ver todos</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid de publicaciones */}
      <div className="grid gap-6">
        {posts.map(post => (
          <div key={post._id} className="transform hover:scale-[1.02] transition-transform duration-300">
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Botón cargar más */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMorePosts}
            disabled={loading}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 font-semibold"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Cargando...</span>
              </div>
            ) : (
              'Cargar más publicaciones'
            )}
          </button>
        </div>
      )}

      {/* Estado vacío */}
      {posts.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl p-12 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">📝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Sin publicaciones</h3>
            <p className="text-gray-600">Este usuario aún no ha compartido contenido.</p>
          </div>
        </div>
      )}

      {/* Modal de Seguidores */}
      {showFollowers && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => handleBackdropClick(e, 'followers')}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Seguidores</h3>
                <p className="text-gray-600 text-sm">{userInfo.followersCount} personas</p>
              </div>
              <button 
                onClick={() => setShowFollowers(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-64">
              {userInfo.followers && userInfo.followers.length > 0 ? (
                userInfo.followers.map((follower) => (
                  <div key={follower._id} className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                    <img 
                      src={URL_SERVER + follower.avatar} 
                      alt={follower.username} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-800">{follower.username}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">{follower.bio || 'Sin biografía'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiUsers size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No tiene seguidores</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={() => setShowFollowers(false)}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 py-3 rounded-xl transition-all duration-300 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Siguiendo */}
      {showFollowing && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => handleBackdropClick(e, 'following')}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Siguiendo</h3>
                <p className="text-gray-600 text-sm">{userInfo.followingCount} personas</p>
              </div>
              <button 
                onClick={() => setShowFollowing(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-64">
              {userInfo.following && userInfo.following.length > 0 ? (
                userInfo.following.map((followed) => (
                  <div key={followed._id} className="flex items-center p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                    <img 
                      src={URL_SERVER + followed.avatar} 
                      alt={followed.username} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-800">{followed.username}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">{followed.bio || 'Sin biografía'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiUsers size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No sigue a nadie</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={() => setShowFollowing(false)}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 py-3 rounded-xl transition-all duration-300 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default UserProfilePage