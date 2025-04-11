import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GoogleAuth() {
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // This page is only used for the popup window
    // The actual authentication is handled by the server
    // and the result is sent back to the parent window
    const handleMessage = (event: MessageEvent) => {
      // Make sure the message is from our server
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        // Send the result back to the parent window
        window.opener.postMessage(event.data, window.location.origin);
        window.close();
      } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
        // Send the error back to the parent window
        window.opener.postMessage(event.data, window.location.origin);
        window.close();
      }
    };
    
    window.addEventListener("message", handleMessage);
    
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h1 className="text-xl font-semibold">Authenticating with Google</h1>
            <p className="text-center text-gray-500">
              Please wait while we complete the authentication process...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 