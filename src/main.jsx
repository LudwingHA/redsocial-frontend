import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import "../src/assets/styles/main.css";
import "../src/assets/styles/theme.css"
import { AuthProvider } from "./auth/context/AuthContext";
import { SocketProvider } from "./auth/context/SocketContext";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
     <SocketProvider>
       <>
        <RouterProvider router={router}></RouterProvider>
      </>
     </SocketProvider>
    </AuthProvider>
  </StrictMode>
);
