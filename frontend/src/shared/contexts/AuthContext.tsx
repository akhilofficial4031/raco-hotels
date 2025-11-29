/* eslint-disable no-unused-vars */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";

import { fetcher } from "@utils/swrFetcher";

import { type LoginUserResponse } from "../../features/authentication/types/login";

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

  // Handle logout
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [navigate]);

  // Check for existing user data on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser) as LoginUserResponse;
          setUser(userData);

          // Verify session with backend
          try {
            const response = await fetcher<{
              data: { user: LoginUserResponse };
            }>("/auth/verify");
            if (response?.data?.user) {
              setUser(response.data.user);
              localStorage.setItem("user", JSON.stringify(response.data.user));
            }
          } catch (error) {
            console.error("Session verification failed:", error);
            // Note: swrFetcher handles 401 by dispatching auth:unauthorized event
            // which is caught by the listener below
          }
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Listen for unauthorized events (401) from API calls
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  // Handle login
  const login = (userData: LoginUserResponse) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // If user was trying to access a protected route, redirect them there
    // Otherwise redirect to dashboard
    const from = location.state?.from?.pathname || "/dashboard";
    navigate(from, { replace: true });
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
