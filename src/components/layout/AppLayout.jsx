import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { Navigation } from './Navigation';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <AppHeader />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet /> {/* Aquí se renderizan las páginas (Feed, Chat, Perfil, etc.) */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
