import React from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { Navigation } from "./Navigation";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 transition-all duration-500">
      <AppHeader />
      
      {/* Contenedor principal de Nav y Main */}
      <div className="flex flex-col lg:flex-row relative">
        <Navigation />
        
        {/* Contenido Principal */}
        <main className="flex-1 w-full p-4 lg:p-6 transition-all duration-500 z-0">
          {/* Ajuste importante: Padding inferior extra en móvil para la Nav Inferior */}
          <div className="max-w-7xl mx-auto w-full pb-16 lg:pb-0"> 
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Nota: En un layout real, podrías usar grid para gestionar la altura sin calc(100vh - X) */}
    </div>
  );
}

export default AppLayout; 