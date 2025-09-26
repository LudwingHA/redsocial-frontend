import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { Navigation } from "./Navigation";
import ThemeToggle from "../ThemeToggle";

export function AppLayout() {
  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 transition-all duration-500">
    <AppHeader />
    <div className="flex flex-col lg:flex-row">
      <Navigation />
      <main className="flex-1 min-h-[calc(100vh-80px)] p-4 lg:p-8 transition-all duration-500">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);
}
export default AppLayout;
