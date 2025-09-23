import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import "../src/assets/styles/main.css"
import { AuthProvider } from './auth/context/AuthContext'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
         <RouterProvider router={router}></RouterProvider>
    </AuthProvider>
  </StrictMode>,
)
