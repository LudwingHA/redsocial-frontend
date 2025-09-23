export default function PostList({ posts }) {
  return (
    <div>
      {posts.map((post) => (
        <div key={post._id} className="p-4 border rounded mb-4 bg-white">
          <div className="flex items-center mb-2">
            <img
              src={post.user.avatar || "/default-avatar.png"}
              alt={post.user.username}
              className="w-10 h-10 rounded-full mr-2"
            />
            <span className="font-bold">{post.user.username}</span>
          </div>
          <p className="mb-2">{post.content}</p>
          {post.image && (
            <img
              src={`http://localhost:5000${post.image}`}
              alt="post"
              className="max-h-60 object-cover rounded mb-2"
            />
          )}
          <div className="text-sm text-gray-600">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
