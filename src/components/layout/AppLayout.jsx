import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { Navigation } from "./Navigation";
import ThemeToggle from "../ThemeToggle";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:bg-gray-800 transition-colors duration-500">
      <AppHeader />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-8
  bg-gradient-to-br
  dark:from-slate-800
  dark:via-slate-700
  dark:to-slate-800
  transition-colors duration-500">
          <div className="max-w-6xl mx-auto">
            <Outlet />{" "}
            {/* Aquí se renderizan las páginas (Feed, Chat, Perfil, etc.) */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
