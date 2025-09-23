import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

// Pages
import Register from "../auth/pages/Register";
import Login from "../auth/pages/Login";

import { Home } from "../pages/Home/Home";
import { ChatPage, FeedPage, ProfileEditPage } from "../pages/minired-frontend-pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <FeedPage></FeedPage>
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <ProfileEditPage></ProfileEditPage>
      </PrivateRoute>
    ),
  },
  {path: "/chat",
    element: (<PrivateRoute>
      <ChatPage></ChatPage>
    </PrivateRoute>)
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
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    ),
  },
]);
