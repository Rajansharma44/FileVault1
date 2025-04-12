import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string | null; username?: string | null; photoURL?: string | null }) => Promise<void>;
}

interface RegisterData {
  username?: string;
  password: string;
  name?: string;
  email: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // If we have a stored user, set it immediately for a faster UI response
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error("Error parsing stored user:", e);
            localStorage.removeItem("user");
          }
        }

        // Verify the token with the server
        try {
          const response = await apiRequest<User>("/api/user/profile");
          setUser(response);
          
          // Update the stored user data
          localStorage.setItem("user", JSON.stringify(response));
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest<{ token: string; user: User }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      // Store the token in localStorage
      localStorage.setItem("token", response.token);
      
      // Store the user data in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(response.user));
      
      // Update the user state
      setUser(response.user);
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error) {
      console.error("Login failed:", error);
      
      // Provide a more user-friendly error message
      const errorMessage = error instanceof Error 
        ? (error.message === "Invalid credentials" 
            ? "Invalid email or password. Please check your credentials and try again." 
            : error.message)
        : "Login failed. Please try again.";
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear all auth data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // Ensure all required fields are present and properly formatted
      const userData = {
        email: data.email,
        password: data.password,
        username: data.username || undefined,
        name: data.name || undefined,
        isVerified: false
      };

      const response = await apiRequest<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: userData,
      });

      toast({
        title: "Success",
        description: "Account created successfully. Please log in.",
      });
      
      // Return the user data without setting it in state
      return response.user;
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (data: { name?: string | null; username?: string | null; photoURL?: string | null }) => {
    try {
      const response = await apiRequest<User>("/api/user/profile", {
        method: "PATCH",
        body: {
          name: data.name || null,
          username: data.username || null,
          photoURL: data.photoURL || null
        }
      });

      // Update local storage with new user data
      const updatedUser = { ...user, ...response };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      return response;
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}