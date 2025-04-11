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
  Settings,
  Share2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchBar from '@/components/SearchBar';
import UserMenu from '@/components/UserMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { useLanguage, Language } from '@/hooks/useLanguage';

interface HeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  onToggleSidebar: () => void;
  onUploadClick: () => void;
  user: any;
  notificationDropdown?: React.ReactNode;
  hideUploadButton?: boolean;
}

export default function Header({
  title,
  searchQuery,
  onSearchChange,
  onSortChange,
  onToggleSidebar,
  onUploadClick,
  user,
  notificationDropdown,
  hideUploadButton = false
}: HeaderProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };
  
  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex-1 px-4">
        <div className="hidden md:block">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onSortChange={onSortChange}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Mobile search toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
        >
          <Search className="h-5 w-5" />
        </Button>
        
        {/* Upload button */}
        {!hideUploadButton && (
          <Button onClick={onUploadClick} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </Button>
        )}

        {/* Notifications */}
        {notificationDropdown}
        
        {/* User menu */}
        <UserMenu user={user} />
      </div>
      
      {/* Mobile search bar */}
      {isMobileSearchOpen && (
        <div className="absolute left-0 top-16 w-full border-b bg-background p-4 md:hidden">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onSortChange={onSortChange}
          />
        </div>
      )}
    </header>
  );
}