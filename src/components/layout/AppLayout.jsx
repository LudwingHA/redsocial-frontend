import React from 'react';
import { AppHeader } from './AppHeader';
import { Navigation } from './Navigation';

export function AppLayout({ children, activePage, onPageChange }) {
  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
    <AppHeader />
    <div className="flex">
      <Navigation activePage={activePage} onPageChange={onPageChange} />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  </div>
);
}