import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import SharedFiles from "@/pages/SharedFiles";
import Categories from "@/pages/Categories";
import Folders from "@/pages/Folders";
import StarredFiles from "@/pages/StarredFiles";
import Profile from "@/pages/Profile";
import Help from "@/pages/Help";
import GoogleAuth from "@/pages/GoogleAuth";
import Notifications from "@/pages/Notifications";
import Preferences from "@/pages/Preferences";
import Security from "@/pages/Security";
import { AuthProvider, useAuth } from "@/hooks/useAuthHook";
import { useEffect } from "react";
import useDarkMode from "@/hooks/useDarkMode";
import { Loader2 } from "lucide-react";
import { LanguageProvider } from "@/hooks/useLanguage";
import { NotificationProvider } from '@/contexts/NotificationContext';

// Protected Route Component
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType, path?: string }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

// Public Route that redirects to dashboard if already logged in
function PublicRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={() => <PublicRoute component={AuthPage} path="/auth" />} />
      <Route path="/login" component={() => <PublicRoute component={AuthPage} path="/login" />} />
      <Route path="/register" component={() => <PublicRoute component={AuthPage} path="/register" />} />
      <Route path="/google-auth" component={GoogleAuth} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/folders" component={() => <ProtectedRoute component={Folders} />} />
      <Route path="/categories" component={() => <ProtectedRoute component={Categories} />} /> 
      <Route path="/recent" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/shared" component={() => <ProtectedRoute component={SharedFiles} />} />
      <Route path="/starred" component={() => <ProtectedRoute component={StarredFiles} />} />
      <Route path="/trash" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} />} />
      <Route path="/preferences" component={() => <ProtectedRoute component={Preferences} />} />
      <Route path="/security" component={() => <ProtectedRoute component={Security} />} />
      <Route path="/help/guide" component={() => <ProtectedRoute component={Help} />} />
      <Route path="/help/faq" component={() => <ProtectedRoute component={Help} />} />
      <Route path="/help/contact" component={() => <ProtectedRoute component={Help} />} />
      <Route path="/help/report" component={() => <ProtectedRoute component={Help} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <Router />
          </NotificationProvider>
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
