import React from "react";
import { Navigate, useLocation } from "react-router";

import { useAuth } from "../contexts/AuthContext";
import FullScreenSpinner from "./FullScreenSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return <FullScreenSpinner />;
  }

  // If user is not authenticated, redirect to login with the current location
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default AuthGuard;
