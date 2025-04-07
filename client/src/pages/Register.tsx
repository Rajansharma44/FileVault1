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

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({ name, email, username, password });
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      // The redirect will happen automatically after successful auth
    } catch (error) {
      // Error is already handled in the loginWithGoogle function
      console.error("Google sign up failed in component:", error);
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
            Join thousands of users storing and sharing files securely.
          </p>
          <ul className="space-y-2 mt-4">
            <li className="flex items-center">
              <span className="bg-primary/10 text-primary p-1 rounded-full mr-2">✓</span>
              Free storage up to 2GB
            </li>
            <li className="flex items-center">
              <span className="bg-primary/10 text-primary p-1 rounded-full mr-2">✓</span>
              Private & encrypted storage
            </li>
            <li className="flex items-center">
              <span className="bg-primary/10 text-primary p-1 rounded-full mr-2">✓</span>
              Share files with time-limited links
            </li>
          </ul>
        </div>
        
        {/* Registration form */}
        <Card className="w-full shadow-lg">
          <CardHeader className="flex flex-row border-b pb-2">
            <Link href="/login">
              <div className="w-1/2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 text-center font-medium rounded-tl-md cursor-pointer">
                Login
              </div>
            </Link>
            <div className="w-1/2 bg-primary text-white py-3 text-center font-medium rounded-tr-md">
              Register
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
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
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or sign up with</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FaGoogle className="h-4 w-4 text-red-500" />
              )}
              {isGoogleLoading ? "Connecting..." : "Sign up with Google"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
