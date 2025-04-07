import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { auth, signInWithGoogle, handleAuthRedirect } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

interface User {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  photoURL?: string;
  isGoogleUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  password: string;
  name?: string;
  email?: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Convert a Firebase user to our app's user format
const formatFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    username: firebaseUser.email?.split('@')[0] || firebaseUser.displayName || 'user',
    name: firebaseUser.displayName || '',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    isGoogleUser: true
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Handle auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        const formattedUser = formatFirebaseUser(firebaseUser);
        setUser(formattedUser);
        
        // If this is a Google user, we might want to save this to our backend
        if (formattedUser.isGoogleUser) {
          try {
            // You can sync with your server here if needed
            await apiRequest("POST", "/api/auth/google-sync", { 
              user: formattedUser 
            });
          } catch (error) {
            console.warn("Could not sync Google user with server:", error);
          }
        }
      } else {
        // No Firebase user, check traditional authentication
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Auth check error:", error);
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Check for redirect result (in case of mobile redirect flow)
    handleAuthRedirect().then(result => {
      if (result.success && result.user) {
        // No need to set user here as onAuthStateChanged will handle it
        toast({
          title: "Signed in with Google",
          description: `Welcome ${result.user.name || 'back'}!`
        });
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [toast]);

  const login = async (username: string, password: string) => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await res.json();
      setUser(userData);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result.success && result.user) {
        toast({
          title: "Signed in with Google",
          description: `Welcome ${result.user.name || 'back'}!`
        });
        // The onAuthStateChanged listener will handle setting the user
      } else if (result.error) {
        throw new Error(result.error.message || "Google sign-in failed");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const res = await apiRequest("POST", "/api/auth/register", data);
      const userData = await res.json();
      setUser(userData);
    } catch (error: any) {
      console.error("Register error:", error);
      throw new Error(error.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      // First check if we have a Firebase user
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      // Also logout from our backend
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
