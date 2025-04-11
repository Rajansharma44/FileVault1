import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuthHook";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import useDarkMode from "@/hooks/useDarkMode";
import { Sun, Moon, Camera, Pencil, Save, X } from "lucide-react";
import { useFiles } from '@/hooks/useFiles';

export default function Profile() {
  const [location] = useLocation();
  const { user, updateProfile } = useAuth();
  const { toggleDarkMode, isDarkMode } = useDarkMode();
  const { toast } = useToast();
  const { files } = useFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  
  // Form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  
  // Storage calculations
  const storageQuota = 1024 * 1024 * 1024; // 1GB
  const storageUsed = files?.reduce((total, file) => total + file.size, 0) || 0;
  const storagePercentage = Math.round((storageUsed / storageQuota) * 100);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_IMAGE_DIMENSION = 800; // Maximum width/height in pixels
  
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_IMAGE_DIMENSION) {
              height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
              width = MAX_IMAGE_DIMENSION;
            }
          } else {
            if (height > MAX_IMAGE_DIMENSION) {
              width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
              height = MAX_IMAGE_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress as JPEG with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Error",
          description: "Profile photo must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      try {
        const compressedImage = await compressImage(file);
        setPhotoURL(compressedImage);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process the image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: name || null,
        username: username || null,
        photoURL: photoURL || null
      });
      
      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        currentView="profile"
        currentFolder=""
        storageUsed={storageUsed}
        storageQuota={storageQuota}
        storagePercentage={storagePercentage}
        user={user}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={() => {}}
        onUploadClick={() => {}}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header
          title="My Profile"
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    View and edit your profile information
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "ghost" : "default"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <X className="h-4 w-4 mr-2" />
                  ) : (
                    <Pencil className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={photoURL} alt={name || username} />
                      <AvatarFallback className="text-lg">
                        {name ? name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute -bottom-2 -right-2 rounded-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
              {isEditing && (
                <CardFooter className="flex justify-end space-x-2">
                  <Button
                    variant="default"
                    onClick={handleSaveProfile}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 