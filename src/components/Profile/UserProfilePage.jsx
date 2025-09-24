import React from 'react';
import { useParams } from 'react-router-dom';
import { useProfileFeed } from '../../hooks/useProfileFeed.jsx';
import { PostCard } from '../Feed/PostCard';
import { URL_SERVER } from '../../api/url.js';

export function UserProfilePage() {
  const { userId } = useParams();
  const { userInfo, posts, loading, hasMore, loadMorePosts } = useProfileFeed(userId);
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {userInfo && (
        <div className="flex items-center space-x-4 mb-6">
          <img src={URL_SERVER+userInfo.avatar} alt={userInfo.username} className="w-16 h-16 rounded-full" />
          <div>
            <h2 className="text-xl font-bold">{userInfo.username}</h2>
            <p className="text-gray-500">{userInfo.bio || ''}</p>
          </div>
        </div>
      )}

      {posts.map(post => <PostCard key={post._id} post={post} />)}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMorePosts}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-xl shadow-lg disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}

      {posts.length === 0 && !loading && <p className="text-center text-gray-500 py-10">Este usuario no tiene publicaciones.</p>}
    </div>
  );
}
