// router.jsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

// Pages
import Register from "../auth/pages/Register";
import Login from "../auth/pages/Login";

import { AppLayout } from "../components/layout/AppLayout";
import { FeedPage } from "../components/Feed/FeedPage";
import { ChatPage } from "../components/Chat/ChatPage";
import { ProfileEditPage } from "../components/Profile/ProfileEditPage";
import { UserProfilePage } from "../components/Profile/UserProfilePage";
import NotFound from "../components/Errors/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <FeedPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "profile/:userId", element: <UserProfilePage /> },
      { path: "settings", element: <ProfileEditPage></ProfileEditPage> },
    ],
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
    path: "*",
    element: <NotFound />,
  },
]);
