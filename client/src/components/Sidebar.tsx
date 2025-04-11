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
  User,
  Home,
  Tag,
  X,
  BookOpen,
  MessageCircle,
  AlertCircle,
  Bell
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatBytes, formatTimeAgo } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuthHook';
import { useLanguage } from '@/hooks/useLanguage';
import { useFiles } from '@/hooks/useFiles';
import FilePreviewModal from '@/components/modals/FilePreviewModal';

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
  onUploadClick: () => void;
  onToggle: () => void;
  recentFiles?: any[];
  onShare?: (file: any) => void;
  onDelete?: (file: any) => void;
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
  onUploadClick,
  onToggle,
  recentFiles = [],
  onShare,
  onDelete
}: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const { t } = useLanguage();
  const { logout } = useAuth();
  const { files } = useFiles();
  
  // Get count of deleted files
  const deletedFilesCount = files?.filter(file => file.isDeleted)?.length || 0;
  
  const handleLogout = async () => {
    try {
      await logout();
      // Force a page reload to clear all state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const toggleCategories = () => {
    setCategoriesOpen(!categoriesOpen);
  };
  
  const handleNavigation = (path: string) => {
    setLocation(path);
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const handleFileClick = (file: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedFile(file);
    setPreviewModalOpen(true);
  };
  
  if (!open) return null;
  
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className="w-64 h-screen bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col">
        {/* User profile */}
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
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
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Upload button */}
        <div className="px-3 mb-2">
          <Button className="w-full justify-start" onClick={onUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
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
                  {recentFiles && recentFiles.length > 0 ? (
                    recentFiles.slice(0, 3).map((file) => (
                      <Button
                        key={file.id}
                        variant="ghost"
                        className="w-full justify-start py-1 px-3 h-auto"
                        onClick={(e) => handleFileClick(file, e)}
                      >
                        <div className="flex items-center w-full">
                          <div className={`${
                            file.type?.startsWith('image/') ? 'bg-purple-100 dark:bg-purple-900' :
                            file.type?.startsWith('video/') ? 'bg-red-100 dark:bg-red-900' :
                            file.type?.startsWith('audio/') ? 'bg-yellow-100 dark:bg-yellow-900' :
                            'bg-blue-100 dark:bg-blue-900'
                          } p-1 rounded mr-2`}>
                            {file.type?.startsWith('image/') ? (
                              <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            ) : file.type?.startsWith('video/') ? (
                              <Film className="h-4 w-4 text-red-600 dark:text-red-400" />
                            ) : file.type?.startsWith('audio/') ? (
                              <Music className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="flex flex-col items-start overflow-hidden">
                            <span className="text-sm truncate w-full">{file.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(new Date(file.lastAccessed || file.dateAdded))}
                            </span>
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                      No recently accessed files
                    </div>
                  )}
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
                  className="w-full justify-start relative"
                  onClick={() => handleNavigation("/trash")}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Trash</span>
                  {deletedFilesCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-auto px-1 min-w-[20px] h-5 flex items-center justify-center"
                    >
                      {deletedFilesCount}
                    </Badge>
                  )}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="flex-1">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/preferences')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/security')}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleDarkMode}>
                  {isDarkMode ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="flex-1">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('help.title')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('/help/guide')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  {t('help.userGuide')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/help/faq')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {t('help.faq')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/help/contact')}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t('help.contact')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/help/report')}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {t('help.report')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        file={selectedFile}
        onShare={() => {
          setPreviewModalOpen(false);
          onShare?.(selectedFile);
        }}
        onDelete={(file) => {
          setPreviewModalOpen(false);
          onDelete?.(file);
        }}
      />
    </>
  );
}