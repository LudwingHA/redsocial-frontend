import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import "../src/assets/styles/main.css";
import { AuthProvider } from "./auth/context/AuthContext";
import { AppHeader } from "./pages/minired-frontend-pages";
import { SocketProvider } from "./auth/context/SocketContext";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
     <SocketProvider>
       <>
        <AppHeader></AppHeader>
        <RouterProvider router={router}></RouterProvider>
      </>
     </SocketProvider>
    </AuthProvider>
  </StrictMode>
);
