import { useState } from "react";
import { Link, useLocation } from "wouter";
import { FaGoogle } from "react-icons/fa";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuthHook";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // The redirect will happen automatically after successful auth
    } catch (error) {
      // Error is already handled in the loginWithGoogle function
      console.error("Google sign in failed in component:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Hero section */}
        <div className="hidden md:flex flex-col space-y-4 p-6">
          <h1 className="text-4xl font-bold text-primary">FileVault</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Store, manage, and share your files securely from anywhere.
          </p>
          <ul className="space-y-2 mt-4">
            <li className="flex items-center">
              <span className="bg-primary/10 text-primary p-1 rounded-full mr-2">✓</span>
              Secure file storage
            </li>
            <li className="flex items-center">
              <span className="bg-primary/10 text-primary p-1 rounded-full mr-2">✓</span>
              Easy sharing options
            </li>
            <li className="flex items-center">
              <span className="bg-primary/10 text-primary p-1 rounded-full mr-2">✓</span>
              Access from any device
            </li>
          </ul>
        </div>
        
        {/* Login form */}
        <Card className="w-full shadow-lg">
          <CardHeader className="flex flex-row border-b pb-2">
            <div className="w-1/2 bg-primary text-white py-3 text-center font-medium rounded-tl-md">
              Login
            </div>
            <Link href="/register">
              <div className="w-1/2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 text-center font-medium rounded-tr-md cursor-pointer">
                Register
              </div>
            </Link>
          </CardHeader>
          
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FaGoogle className="h-4 w-4 text-red-500" />
              )}
              {isGoogleLoading ? "Connecting..." : "Sign in with Google"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
