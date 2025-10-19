// AppLayout.jsx - Diseño Mejorado

import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { NotificationToast } from "../Notification/NotificationToast";

export function AppLayout() {
  return (
    // Contenedor principal: Se usa un fondo plano o un degradado muy sutil para modernidad.
    // Se elimina el degradado complejo del fondo para un estilo más limpio, similar a Instagram.
    // Se usa un color de fondo más neutral.
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500">
      
      {/* Contenedor flexible que ajusta el layout. 
        En desktop, el sidebar fijo a la izquierda y el contenido a la derecha. 
      */}
      <div className="flex relative"> 
        
        {/* Navigation: Sidebar (Desktop) y Navbar (Móvil) */}
        <Navigation />
        
        {/*
          MAIN: Área de Contenido Principal
          - En móvil, w-full.
          - En Desktop (lg), ocupa el espacio restante (flex-1) y se usa un margen para el sidebar.
          - max-w-6xl es un poco más ancho que 4xl para dar más espacio a los detalles del feed.
        */}
        <main className="flex-1 w-full p-0 lg:p-0 z-10 lg:ml-64"> 
          {/* Contenedor central del contenido: Ancho óptimo y padding para respirar */}
          <div className="max-w-4xl xl:max-w-6xl mx-auto w-full pt-4 pb-20 lg:pt-6 lg:pb-6">
            <Outlet />
          </div>
        </main>

        {/* ASIDE de Sugerencias (Opcional, se implementará en otra carpeta) 
          - Se reserva el espacio a la derecha en pantallas muy grandes.
        */}
        {/* <aside className="hidden xl:block w-72 pt-6 sticky top-0 h-screen overflow-y-auto">
          <div className="p-4"> 
            <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-300">Sugerencias</h3>
          </div>
        </aside> */}
      </div>
      
      {/* Toast de Notificaciones (se mantiene su funcionalidad) */}
      <NotificationToast />
    </div>
  );
}