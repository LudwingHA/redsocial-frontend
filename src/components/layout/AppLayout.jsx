import React from 'react';
import { AppHeader } from './AppHeader';
import { Navigation } from './Navigation';

export function AppLayout({ children, activePage, onPageChange }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="flex">
        <Navigation activePage={activePage} onPageChange={onPageChange} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}