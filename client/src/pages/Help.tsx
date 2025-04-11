import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuthHook";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import useDarkMode from "@/hooks/useDarkMode";
import { ArrowLeft, Book, HelpCircle, Mail, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function Help() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  
  // Storage calculations (placeholder values)
  const storageQuota = 1024 * 1024 * 1024; // 1GB
  const storageUsed = 256 * 1024 * 1024; // 256MB
  const storagePercentage = Math.round((storageUsed / storageQuota) * 100);
  
  // Determine which help section to show based on the URL
  const helpSection = location.split('/').pop() || 'guide';
  
  const renderHelpContent = () => {
    switch (helpSection) {
      case 'guide':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">User Guide</h2>
            <p className="text-muted-foreground">
              Learn how to use the FileVault storage system effectively.
            </p>
            <Separator />
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="mr-2 h-5 w-5" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Create an account or sign in</li>
                    <li>Upload your first files</li>
                    <li>Organize files into folders</li>
                    <li>Share files with others</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Book className="mr-2 h-5 w-5" />
                    Advanced Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Create shareable links</li>
                    <li>Set file permissions</li>
                    <li>Use categories for organization</li>
                    <li>Star important files</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'faq':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find answers to common questions about FileVault.
            </p>
            <Separator />
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>How much storage do I get?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Free accounts come with 1GB of storage. Premium accounts offer up to 100GB.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>How do I share files with others?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Select a file, click the share button, and choose to share via link or email.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>What file types are supported?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We support all common file types including documents, images, videos, and audio files.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Contact Support</h2>
            <p className="text-muted-foreground">
              Get in touch with our support team for assistance.
            </p>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>
                  Send us an email and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>support@filevault.com</span>
                  </div>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'report':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Report a Problem</h2>
            <p className="text-muted-foreground">
              Let us know if you've encountered an issue with FileVault.
            </p>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle>Submit a Bug Report</CardTitle>
                <CardDescription>
                  Provide details about the issue you're experiencing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium">Issue Type</label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>Bug</option>
                        <option>Feature Request</option>
                        <option>Performance Issue</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea className="w-full mt-1 p-2 border rounded-md h-32"></textarea>
                    </div>
                  </div>
                  <Button>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Submit Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Help & Support</h2>
            <p className="text-muted-foreground">
              Select a help topic from the menu above.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        currentView="help"
        currentFolder=""
        storageUsed={storageUsed}
        storageQuota={storageQuota}
        storagePercentage={storagePercentage}
        user={user}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => {}}
        onLogout={() => {}}
        onUploadClick={() => {}}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header
          title="Help & Support"
          searchQuery=""
          onSearchChange={() => {}}
          onSortChange={() => {}}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onUploadClick={() => {}}
          user={user}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            
            {renderHelpContent()}
          </div>
        </main>
      </div>
    </div>
  );
} 