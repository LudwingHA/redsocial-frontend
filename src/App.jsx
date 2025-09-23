import React, { useState } from 'react';
import { useAuth } from './auth/context/AuthContext';

import { ChatPage } from './components/Chat/ChatPage';
import { FeedPage } from './components/Feed/FeedPage';
import { ProfileEditPage } from './components/Profile/ProfileEditPage';
import { NotificationsPage } from './components/Notification/NotificationsPage';
import { AppLayout } from './components/layout/AppLayout';


function App() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('feed');
  const renderPage = () => {
    switch (activePage) {
      case 'feed':
        return <FeedPage />;
      case 'chat':
        return <ChatPage />;
      case 'profile':
        return <ProfileEditPage />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <FeedPage />;
    }
  };
  return (
    <AppLayout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </AppLayout>
  );
}

export default App;