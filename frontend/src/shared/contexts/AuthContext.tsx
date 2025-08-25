import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";

import { type LoginUserResponse } from "../models/login";

interface AuthContextType {
  user: LoginUserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: LoginUserResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LoginUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing user data on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser) as LoginUserResponse;
          setUser(userData);
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Handle login
  const login = (userData: LoginUserResponse) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    
    // If user was trying to access a protected route, redirect them there
    // Otherwise redirect to dashboard
    const from = location.state?.from?.pathname || "/dashboard";
    navigate(from, { replace: true });
  };

  // Handle logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
