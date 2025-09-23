import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

// Pages
import Register from "../auth/pages/Register";
import Login from "../auth/pages/Login";

import App from "../App";


export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <App></App>
      </PrivateRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
]);
