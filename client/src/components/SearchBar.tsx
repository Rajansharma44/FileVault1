import React from 'react';
import { Search, ArrowDownUp, SortAsc, SortDesc, Clock, File } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSortChange: (sort: string) => void;
}

export default function SearchBar({ value, onChange, onSortChange }: SearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className="flex w-full max-w-xl items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('common.search') || 'Search files...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{t('common.sort') || 'Sort by'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSortChange("name-asc")}>
            <SortAsc className="mr-2 h-4 w-4" />
            {t('common.nameAsc') || 'Name (A to Z)'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("name-desc")}>
            <SortDesc className="mr-2 h-4 w-4" />
            {t('common.nameDesc') || 'Name (Z to A)'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("date-desc")}>
            <Clock className="mr-2 h-4 w-4" />
            {t('common.newest') || 'Newest first'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("date-asc")}>
            <Clock className="mr-2 h-4 w-4" />
            {t('common.oldest') || 'Oldest first'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("size-desc")}>
            <File className="mr-2 h-4 w-4" />
            {t('common.sizeDesc') || 'Size (largest first)'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("size-asc")}>
            <File className="mr-2 h-4 w-4" />
            {t('common.sizeAsc') || 'Size (smallest first)'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 