import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuthHook";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  useEffect(() => {
    // Show registration success message if coming from registration
    if (location.state?.message) {
      toast({
        title: "Success",
        description: location.state.message,
      });
    }
  }, [location.state, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
