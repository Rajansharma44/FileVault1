import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuthHook";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Mail, Share2, Trash2 } from "lucide-react";

export default function Notifications() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [shareNotifications, setShareNotifications] = useState(true);
  const [deleteNotifications, setDeleteNotifications] = useState(true);
  const [securityNotifications, setSecurityNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  const handleSave = () => {
    // In a real app, you would send these preferences to the server
    toast({
      title: "Success",
      description: "Notification preferences saved successfully",
    });
  };
  
  const handleBack = () => {
    setLocation("/");
  };
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Notification Settings</h1>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            <CardDescription>Manage your email notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-notifications">Share Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when someone shares files with you
                </p>
              </div>
              <Switch
                id="share-notifications"
                checked={shareNotifications}
                onCheckedChange={setShareNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="delete-notifications">Delete Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified when your files are deleted
                </p>
              </div>
              <Switch
                id="delete-notifications"
                checked={deleteNotifications}
                onCheckedChange={setDeleteNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="security-notifications">Security Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified about security-related events
                </p>
              </div>
              <Switch
                id="security-notifications"
                checked={securityNotifications}
                onCheckedChange={setSecurityNotifications}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Marketing Communications</CardTitle>
            </div>
            <CardDescription>Manage your marketing email preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Marketing Emails</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive updates about new features and promotions
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </div>
    </div>
  );
} 