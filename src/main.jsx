import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContext, AuthProvider } from './auth/context/AuthContext'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { ThemeProvider } from './context/ThemeContext'
import "../src/assets/styles/main.css"
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
         <RouterProvider router={router}></RouterProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
