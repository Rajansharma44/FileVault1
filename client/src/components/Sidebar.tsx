import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Folder,
  Star,
  Share2,
  Trash2,
  Upload,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Users,
  Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { formatBytes } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  currentView: string;
  currentFolder: string;
  storageUsed: number;
  storageQuota: number;
  storagePercentage: number;
  user: any;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  open,
  currentView,
  currentFolder,
  storageUsed,
  storageQuota,
  storagePercentage,
  user,
  isDarkMode,
  onToggleDarkMode,
  onLogout,
}: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  
  const toggleCategories = () => {
    setCategoriesOpen(!categoriesOpen);
  };
  
  if (!open) return null;
  
  return (
    <div className="w-64 h-screen bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col">
      {/* User profile */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.photoURL} alt={user?.name || user?.username} />
            <AvatarFallback>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {user?.name || user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
      </div>
      
      {/* Upload button */}
      <div className="px-3 mb-2">
        <Button className="w-full justify-start" asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Link>
        </Button>
      </div>
      
      <Separator className="my-2" />
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-2">
          <ul className="space-y-1">
            {/* Recently Accessed with Smart Recommendations */}
            <li className="mb-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-3">
                Recently Accessed
              </div>
              <div className="space-y-1 mb-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start py-1 px-3 h-auto"
                  asChild
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded mr-2">
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-sm truncate w-full">Document1.pdf</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</span>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start py-1 px-3 h-auto"
                  asChild
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 dark:bg-purple-900 p-1 rounded mr-2">
                      <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-sm truncate w-full">image.jpg</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</span>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start py-1 px-3 h-auto"
                  asChild
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 dark:bg-green-900 p-1 rounded mr-2">
                      <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-sm truncate w-full">presentation.pptx</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Yesterday</span>
                    </div>
                  </div>
                </Button>
              </div>
            </li>
            
            <Separator className="my-2" />
            
            {/* Main views */}
            <li>
              <Button
                variant={currentView === "all" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/">
                  <FileText className="mr-2 h-4 w-4" />
                  All Files
                </Link>
              </Button>
            </li>
            <li>
              <Button
                variant={currentView === "recent" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/recent">
                  <Clock className="mr-2 h-4 w-4" />
                  Recent
                </Link>
              </Button>
            </li>
            <li>
              <Button
                variant={currentView === "starred" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/starred">
                  <Star className="mr-2 h-4 w-4" />
                  Starred
                </Link>
              </Button>
            </li>
            <li>
              <Button
                variant={currentView === "shared" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/shared">
                  <Share2 className="mr-2 h-4 w-4" />
                  Shared
                </Link>
              </Button>
            </li>
            <li>
              <Button
                variant={currentView === "trash" ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href="/trash">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Trash
                </Link>
              </Button>
            </li>
            
            {/* File categories */}
            <li className="pt-2">
              <Button
                variant={currentView === "categories" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium"
                asChild
              >
                <Link href="/categories">
                  {categoriesOpen ? (
                    <ChevronDown className="mr-2 h-4 w-4" />
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4" />
                  )}
                  Categories
                </Link>
              </Button>
              
              {categoriesOpen && (
                <ul className="pl-4 pt-1 space-y-1">
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/categories">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Images
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/categories">
                        <FileText className="mr-2 h-4 w-4" />
                        Documents
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/categories">
                        <Film className="mr-2 h-4 w-4" />
                        Videos
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/categories">
                        <Music className="mr-2 h-4 w-4" />
                        Audio
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/categories">
                        <Archive className="mr-2 h-4 w-4" />
                        Archives
                      </Link>
                    </Button>
                  </li>
                </ul>
              )}
            </li>
            
            {/* Folders */}
            <li className="pt-2">
              <Button
                variant={currentView === "folders" ? "secondary" : "ghost"}
                className="w-full justify-start font-medium"
                asChild
              >
                <Link href="/folders">
                  <Folder className="mr-2 h-4 w-4" />
                  Folders
                </Link>
              </Button>
              
              <ul className="pl-4 pt-1 space-y-1">
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/folders">
                      <Folder className="mr-2 h-4 w-4" />
                      Personal
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/folders">
                      <Folder className="mr-2 h-4 w-4" />
                      Work
                    </Link>
                  </Button>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Storage usage */}
      <div className="p-4 border-t dark:border-gray-800">
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Storage</span>
            <span>
              {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
            </span>
          </div>
          <Progress value={storagePercentage} className="h-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {storagePercentage}% of your storage used
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t dark:border-gray-800 space-y-2">
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" className="flex-1">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="flex-1">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="flex-1 relative"
            onClick={onToggleDarkMode}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Sun className={`h-4 w-4 absolute transition-opacity duration-300 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`} />
            <Moon className={`h-4 w-4 transition-opacity duration-300 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="flex-1"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}