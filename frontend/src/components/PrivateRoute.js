import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    // 🚫 Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // 🚫 Logged in but wrong role → redirect to home
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized → show the page
  return children;
};

export default PrivateRoute;
