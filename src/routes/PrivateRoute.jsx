import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";


export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Cargando sesión...</div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
