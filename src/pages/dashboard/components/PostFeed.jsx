import CreatePost from "./CreatePost";
import Post from "./Post";



export default function PostFeed({ user, posts, newPost, newImage, setNewPost, setNewImage, onCreatePost, onLike, onComment }) {
  return (
    <div className="flex-1 bg-background-primary min-h-screen">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            Hola, <span className="text-primary-500">{user.username}</span>! 👋
          </h2>
          <p className="text-text-secondary mt-1">¿Qué quieres compartir hoy?</p>
        </div>
        
        <CreatePost
          newPost={newPost}
          newImage={newImage}
          setNewPost={setNewPost}
          setNewImage={setNewImage}
          onCreatePost={onCreatePost}
        />

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <div className="text-4xl mb-3">📝</div>
              <p>No hay publicaciones aún</p>
              <p className="text-sm">Sé el primero en compartir algo</p>
            </div>
          ) : (
            posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                onLike={onLike}
                onComment={onComment}
                currentUserId={user._id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}