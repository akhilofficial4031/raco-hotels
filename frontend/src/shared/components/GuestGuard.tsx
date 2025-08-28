import React from "react";
import { Navigate } from "react-router";

import { useAuth } from "../contexts/AuthContext";
import FullScreenSpinner from "./FullScreenSpinner";

interface GuestGuardProps {
  children: React.ReactNode;
}

const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return <FullScreenSpinner />;
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // User is not authenticated, render the guest content (login page)
  return <>{children}</>;
};

export default GuestGuard;
