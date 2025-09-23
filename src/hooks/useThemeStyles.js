export const useThemeStyles = () => {
  return {
    // Layout principal
    dashboard: "flex min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-primary",
    
    // Sidebar moderno
    sidebar: {
      container: "w-80 bg-background-card/80 glass border-r border-border/50 p-6 space-y-6",
      header: "flex items-center justify-between mb-8",
      title: "text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent",
      userItem: (isSelected) => 
        `flex items-center p-3 rounded-xl transition-all duration-300 group cursor-pointer ${
          isSelected 
            ? 'bg-primary-500/10 border border-primary-500/20 shadow-lg' 
            : 'hover:bg-background-secondary/50 border border-transparent hover:border-border/30'
        } hover-lift`,
      userAvatar: "w-10 h-10 rounded-full border-2 border-border group-hover:border-primary-500 transition-colors",
      userInfo: "ml-3",
      username: "font-semibold text-text-primary group-hover:text-primary-500 transition-colors",
      status: "flex items-center text-xs text-success-500",
      statusDot: "w-2 h-2 bg-current rounded-full mr-1",
      logoutButton: "w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all hover-lift shadow-lg"
    },
    
    // PostFeed moderno
    postFeed: {
      container: "flex-1 p-6 max-w-2xl mx-auto w-full",
      welcome: "text-3xl font-bold text-text-primary mb-2 bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent",
      subtitle: "text-text-muted mb-8"
    },
    
    // CreatePost moderno
    createPost: {
      container: "bg-background-card/80 glass rounded-2xl p-6 mb-6 border border-border/50 shadow-xl",
      input: "w-full p-4 text-lg bg-transparent border-none outline-none placeholder-text-muted resize-none",
      mediaPreview: "mt-4 rounded-xl overflow-hidden",
      previewImage: "w-full max-h-80 object-cover",
      actions: "flex items-center justify-between mt-4 pt-4 border-t border-border/30",
      fileButton: "flex items-center space-x-2 text-text-muted hover:text-primary-500 transition-colors cursor-pointer",
      postButton: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-full font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all hover-lift disabled:opacity-50"
    },
    
    // Post moderno
    post: {
      container: "bg-background-card/80 glass rounded-2xl p-6 mb-4 border border-border/50 shadow-lg fade-in",
      header: "flex items-center justify-between mb-4",
      userInfo: "flex items-center space-x-3",
      avatar: "w-12 h-12 rounded-full border-2 border-primary-500/30",
      userDetails: "flex-1",
      username: "font-semibold text-text-primary hover:text-primary-500 cursor-pointer",
      timestamp: "text-sm text-text-muted",
      content: "text-text-primary text-lg mb-4 leading-relaxed",
      image: "w-full rounded-xl mb-4 border border-border/30",
      actions: "flex items-center space-x-4 pt-4 border-t border-border/30",
      actionButton: "flex items-center space-x-2 text-text-muted hover:text-primary-500 transition-colors cursor-pointer",
      likeButton: (isLiked) => 
        `flex items-center space-x-2 transition-colors cursor-pointer ${
          isLiked ? 'text-red-500' : 'text-text-muted hover:text-red-500'
        }`,
      commentsSection: "mt-4 pt-4 border-t border-border/30",
      commentInput: "w-full p-3 bg-background-secondary rounded-xl border border-border/30 focus:border-primary-500 transition-colors outline-none"
    },
    
    // Chat moderno
    chat: {
      container: "w-96 bg-background-card/80 glass rounded-2xl ml-6 border border-border/50 shadow-xl flex flex-col",
      header: "p-4 border-b border-border/30",
      chatTitle: "text-lg font-semibold text-text-primary",
      chatSubtitle: "text-sm text-text-muted",
      messages: {
        container: "flex-1 p-4 space-y-3 overflow-y-auto",
        message: (isOwn) => `flex ${isOwn ? 'justify-end' : 'justify-start'}`,
        bubble: (isOwn) => 
          `max-w-xs p-3 rounded-2xl transition-all duration-300 ${
            isOwn 
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-none' 
              : 'bg-background-secondary text-text-primary rounded-bl-none border border-border/30'
          } hover-lift`,
        time: "text-xs opacity-60 mt-1"
      },
      inputContainer: "p-4 border-t border-border/30",
      inputGroup: "flex space-x-2",
      input: "flex-1 p-3 bg-background-secondary rounded-xl border border-border/30 focus:border-primary-500 transition-colors outline-none",
      sendButton: "bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-3 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all hover-lift"
    },
    
    // Componentes reutilizables
    iconButton: "p-2 rounded-full hover:bg-background-secondary transition-colors",
    badge: "px-2 py-1 rounded-full text-xs font-medium",
    card: "bg-background-card rounded-2xl border border-border/50 shadow-lg"
  };
};