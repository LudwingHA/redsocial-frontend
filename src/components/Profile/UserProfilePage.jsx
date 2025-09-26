import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useProfileFeed } from "../../hooks/useProfileFeed.jsx";
import { PostCard } from "../Feed/PostCard";
import { URL_SERVER } from "../../api/url.js";
import { useAuth } from "../../auth/context/AuthContext";
import { userAPI } from "../../api/api";
import { FiUsers, FiUserPlus, FiUserCheck, FiX } from "react-icons/fi";


export function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { userInfo, posts, loading, hasMore, loadMorePosts, refreshProfile } =
    useProfileFeed(userId);
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
    } finally {
      setFollowLoading(false);
    }
  };

  // Función para manejar el clic en el backdrop
  const handleBackdropClick = (e, modalType) => {
    if (e.target === e.currentTarget) {
      if (modalType === "followers") {
        setShowFollowers(false);
      } else if (modalType === "following") {
        setShowFollowing(false);
      }
    }
  };
return (
  <div className="max-w-2xl mx-auto p-4 space-y-6">
    {userInfo && (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 dark:border-gray-700/60 overflow-hidden transition-all duration-300">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={URL_SERVER + userInfo.avatar}
                alt={userInfo.username}
                className="w-20 h-20 rounded-full object-cover border border-slate-200 dark:border-gray-600 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                  {userInfo.username}
                </h2>
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                      userInfo.isFollowing
                        ? 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } disabled:opacity-50`}
                  >
                    {userInfo.isFollowing ? (
                      <>
                        <FiUserCheck size={14} />
                        <span>Siguiendo</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus size={14} />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {userInfo.bio && (
                <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {userInfo.bio}
                </p>
              )}

              <div className="flex items-center gap-6">
                <button
                  onClick={() => setShowFollowers(true)}
                  className="text-center hover:scale-105 transition-transform duration-200"
                >
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {userInfo.followersCount || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Seguidores</div>
                </button>

                <button
                  onClick={() => setShowFollowing(true)}
                  className="text-center hover:scale-105 transition-transform duration-200"
                >
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {userInfo.followingCount || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Siguiendo</div>
                </button>

                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {posts.length}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Publicaciones</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>

    {hasMore && (
      <div className="flex justify-center">
        <button
          onClick={loadMorePosts}
          disabled={loading}
          className="bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg transition-all duration-300 border border-slate-200/60 dark:border-gray-600/60 disabled:opacity-50 font-medium"
        >
          {loading ? 'Cargando...' : 'Cargar más'}
        </button>
      </div>
    )}

    {posts.length === 0 && !loading && (
      <div className="text-center py-12">
        <div className="bg-slate-100/50 dark:bg-gray-700/50 rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-300 dark:bg-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
            Sin publicaciones
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Este usuario aún no ha compartido contenido.
          </p>
        </div>
      </div>
    )}

    {showFollowers && (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => handleBackdropClick(e, "followers")}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md w-full max-h-96 overflow-hidden border border-slate-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-gray-700/60">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Seguidores</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {userInfo.followersCount} personas
              </p>
            </div>
            <button
              onClick={() => setShowFollowers(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-64">
            {userInfo.followers && userInfo.followers.length > 0 ? (
              userInfo.followers.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center p-3 hover:bg-slate-50/50 dark:hover:bg-gray-700/50 border-b border-slate-100/60 dark:border-gray-700/60 last:border-b-0"
                >
                  <img
                    src={URL_SERVER + follower.avatar}
                    alt={follower.username}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-gray-600"
                  />
                  <div className="ml-3 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {follower.username}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {follower.bio || "Sin biografía"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <FiUsers size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p>No tiene seguidores</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {showFollowing && (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={(e) => handleBackdropClick(e, "following")}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md w-full max-h-96 overflow-hidden border border-slate-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-gray-700/60">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Siguiendo</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {userInfo.followingCount} personas
              </p>
            </div>
            <button
              onClick={() => setShowFollowing(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-64">
            {userInfo.following && userInfo.following.length > 0 ? (
              userInfo.following.map((followed) => (
                <div
                  key={followed._id}
                  className="flex items-center p-3 hover:bg-slate-50/50 dark:hover:bg-gray-700/50 border-b border-slate-100/60 dark:border-gray-700/60 last:border-b-0"
                >
                  <img
                    src={URL_SERVER + followed.avatar}
                    alt={followed.username}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-gray-600"
                  />
                  <div className="ml-3 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">
                      {followed.username}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {followed.bio || "Sin biografía"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <FiUsers size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p>No sigue a nadie</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
}
export default UserProfilePage;
