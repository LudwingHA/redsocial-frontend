import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";


export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
