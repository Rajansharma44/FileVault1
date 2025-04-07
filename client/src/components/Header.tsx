import { useState, ChangeEvent } from 'react';
import { 
  Menu, 
  Search, 
  Upload, 
  SortAsc, 
  SortDesc, 
  Clock, 
  ArrowDownUp, 
  File,
  User,
  Bell,
  HelpCircle,
  Languages,
  Globe,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  onToggleSidebar: () => void;
  onUploadClick: () => void;
  user?: any;
}

export default function Header({
  title,
  searchQuery,
  onSearchChange,
  onSortChange,
  onToggleSidebar,
  onUploadClick,
  user,
}: HeaderProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };
  
  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };
  
  return (
    <header className="border-b dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section - Title and mobile hamburger */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-medium">{title}</h1>
          </div>
        </div>
        
        {/* Middle section - Search */}
        <div className={`${
          isMobileSearchOpen ? 'absolute inset-x-0 top-0 bg-white dark:bg-gray-950 h-16 px-4 flex items-center' : 'hidden md:block'
        } flex-1 max-w-xl mx-4`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search files..."
              className="w-full pl-10 pr-4"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {isMobileSearchOpen && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={toggleMobileSearch}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
        
        {/* Right section - Actions */}
        <div className="flex items-center space-x-2">
          {!isMobileSearchOpen && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleMobileSearch}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ArrowDownUp className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSortChange("name_asc")}>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortChange("name_desc")}>
                    <SortDesc className="h-4 w-4 mr-2" />
                    Name (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortChange("date_desc")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Newest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortChange("date_asc")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Oldest first
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortChange("size_desc")}>
                    <File className="h-4 w-4 mr-2" />
                    Size (large to small)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortChange("size_asc")}>
                    <File className="h-4 w-4 mr-2" />
                    Size (small to large)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                onClick={onUploadClick}
                className="hidden md:flex"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              
              <Button 
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onUploadClick}
              >
                <Upload className="h-5 w-5" />
              </Button>
              
              {/* TeraBox styled UI elements */}
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" size="icon" title="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="Help">
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">User Guide</span>
                        <span className="text-xs text-muted-foreground">Learn how to use the storage system</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">FAQ</span>
                        <span className="text-xs text-muted-foreground">Commonly asked questions</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">Contact Support</span>
                        <span className="text-xs text-muted-foreground">Get help from our team</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col">
                        <span className="font-medium">Report a Problem</span>
                        <span className="text-xs text-muted-foreground">Let us know if something's not working</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="Language">
                      <Globe className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Language</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Spanish
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      French
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      German
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Chinese
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0" title="User Profile">
                        <Avatar className="h-8 w-8">
                          {user.photoURL ? (
                            <AvatarImage src={user.photoURL} alt={user.name || user.username || 'User'} />
                          ) : (
                            <AvatarFallback>
                              {user.name ? user.name.charAt(0).toUpperCase() : 
                               user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="flex items-center gap-2 p-2">
                        <Avatar className="h-10 w-10">
                          {user.photoURL ? (
                            <AvatarImage src={user.photoURL} alt={user.name || user.username || 'User'} />
                          ) : (
                            <AvatarFallback>
                              {user.name ? user.name.charAt(0).toUpperCase() : 
                               user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name || user.username || 'User'}</span>
                          {user.email && <span className="text-xs text-muted-foreground truncate">{user.email}</span>}
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        <div className="flex flex-col">
                          <span>Profile</span>
                          <span className="text-xs text-muted-foreground">View and edit your profile</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        <div className="flex flex-col">
                          <span>Settings</span>
                          <span className="text-xs text-muted-foreground">Configure your preferences</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500 focus:text-red-500">
                        <div className="flex justify-between w-full">
                          <span>Sign Out</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}