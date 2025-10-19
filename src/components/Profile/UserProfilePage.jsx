import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProfileFeed } from "../../hooks/useProfileFeed.jsx";
import { PostCard } from "../Feed/PostCard";
import { URL_SERVER } from "../../api/url.js";
import { useAuth } from "../../auth/context/AuthContext";
import { FiUsers, FiX, FiSettings } from "react-icons/fi";
import { FollowButton } from "../FollowButton.jsx";

export function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { userInfo, posts, loading, hasMore, loadMorePosts, refreshProfile } =
    useProfileFeed(userId);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const isOwnProfile = currentUser && currentUser.id === userId;

  const handleFollowAction = () => {
    refreshProfile();
  };

  const handleBackdropClick = (e, modalType) => {
    if (e.target === e.currentTarget) {
      if (modalType === "followers") {
        setShowFollowers(false);
      } else if (modalType === "following") {
        setShowFollowing(false);
      }
    }
  };

  if (!userInfo && loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 dark:text-gray-400">
          Perfil no encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-8 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-300">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={
                  userInfo.avatar
                    ? URL_SERVER + userInfo.avatar
                    : "/default-avatar.png"
                }
                alt={userInfo.username}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-purple-500 shadow-xl"
              />
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-md"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mb-3">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white truncate">
                  {userInfo.username}
                </h2>

                <div className="flex items-center gap-3">
                  {!isOwnProfile && currentUser && (
                    <FollowButton
                      currentUserId={currentUser.id}
                      targetUserId={userId}
                      size="medium"
                      onFollowToggle={handleFollowAction}
                    />
                  )}

                  {isOwnProfile && (
                    <Link
                      to="/settings"
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm transition-colors shadow-md flex items-center gap-2"
                    >
                      <FiSettings size={18} />
                      Editar Perfil
                    </Link>
                  )}
                </div>
              </div>

              {userInfo.bio && (
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed max-w-lg text-sm">
                  {userInfo.bio}
                </p>
              )}

              <div className="flex items-center gap-6 lg:gap-8 border-t border-b border-gray-100 dark:border-gray-700/50 py-3 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {posts.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Publicaciones
                  </div>
                </div>

                <button
                  onClick={() => setShowFollowers(true)}
                  className="text-center hover:scale-105 transition-transform duration-200"
                >
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {userInfo.followersCount || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Seguidores
                  </div>
                </button>

                <button
                  onClick={() => setShowFollowing(true)}
                  className="text-center hover:scale-105 transition-transform duration-200"
                >
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {userInfo.followingCount || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Siguiendo
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700/50 p-4 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-extrabold text-gray-700 dark:text-gray-300">
            Galería de Publicaciones
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="bg-gray-100 dark:bg-gray-700/50 rounded-2xl p-8 max-w-md mx-auto shadow-inner">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
              ¡Perfil limpio!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Este usuario aún no ha compartido contenido.
            </p>
          </div>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMorePosts}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full transition-all duration-300 shadow-lg disabled:opacity-50 font-semibold"
          >
            {loading ? "Cargando..." : "Cargar más publicaciones"}
          </button>
        </div>
      )}

      {showFollowers && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={(e) => handleBackdropClick(e, "followers")}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/60">
              <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">
                Seguidores ({userInfo.followersCount || 0})
              </h3>
              <button
                onClick={() => setShowFollowers(false)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[70vh] divide-y divide-gray-100 dark:divide-gray-700/50">
              {userInfo.followers && userInfo.followers.length > 0 ? (
                userInfo.followers.map((follower) => (
                  <div
                    key={follower._id}
                    className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <img
                      src={
                        follower.avatar
                          ? URL_SERVER + follower.avatar
                          : "/default-avatar.png"
                      }
                      alt={follower.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                    />
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate hover:underline cursor-pointer">
                        {follower.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {follower.bio || "Sin biografía"}
                      </p>
                    </div>
                    {currentUser && currentUser.id !== follower._id && (
                      <FollowButton
                        currentUserId={currentUser.id}
                        targetUserId={follower._id}
                        size="small"
                        onFollowToggle={handleFollowAction}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FiUsers
                    size={32}
                    className="mx-auto mb-2 text-gray-300 dark:text-gray-600"
                  />
                  <p>No tiene seguidores para mostrar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showFollowing && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={(e) => handleBackdropClick(e, "following")}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/60">
              <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">
                Siguiendo ({userInfo.followingCount || 0})
              </h3>
              <button
                onClick={() => setShowFollowing(false)}
                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[70vh] divide-y divide-gray-100 dark:divide-gray-700/50">
              {userInfo.following && userInfo.following.length > 0 ? (
                userInfo.following.map((followed) => (
                  <div
                    key={followed._id}
                    className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <img
                      src={
                        followed.avatar
                          ? URL_SERVER + followed.avatar
                          : "/default-avatar.png"
                      }
                      alt={followed.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                    />
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate hover:underline cursor-pointer">
                        {followed.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {followed.bio || "Sin biografía"}
                      </p>
                    </div>
                    {currentUser && currentUser.id !== followed._id && (
                      <FollowButton
                        currentUserId={currentUser.id}
                        targetUserId={followed._id}
                        size="small"
                        onFollowToggle={handleFollowAction}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FiUsers
                    size={32}
                    className="mx-auto mb-2 text-gray-300 dark:text-gray-600"
                  />
                  <p>No sigue a nadie.</p>
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
