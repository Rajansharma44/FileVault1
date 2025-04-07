import { useState } from 'react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  EyeIcon, 
  Share2, 
  Pencil, 
  Trash2, 
  Download, 
  ChevronUp, 
  ChevronDown, 
  File, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileArchive, 
  MoreHorizontal 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatBytes, getFileIcon } from '@/lib/utils';
import { useFiles } from '@/hooks/useFiles';

interface FileTableProps {
  files: any[];
  selectedFiles: Set<number>;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onPreview: (file: any) => void;
  onShare: (file: any) => void;
  onRename: (file: any) => void;
  onDelete: (file: any) => void;
  onSelect: (fileId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  allSelected: boolean;
}

export default function FileTable({
  files,
  selectedFiles,
  sortBy,
  onSortChange,
  onPreview,
  onShare,
  onRename,
  onDelete,
  onSelect,
  onSelectAll,
  allSelected,
}: FileTableProps) {
  // Get the files hooks functionality
  const { downloadFile } = useFiles();
  
  // Parse the sort order
  const [sortDirection, sortField] = sortBy.split('_');
  
  // Handle sort click
  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(`${newDirection}_${field}`);
  };
  
  // Get sort indicator
  const getSortIndicator = (field: string) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="inline h-4 w-4" /> : 
      <ChevronDown className="inline h-4 w-4" />;
  };
  
  // File type icons
  const getIconForFile = (file: any) => {
    const fileType = file.type || '';
    
    if (fileType.includes('image')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('video')) {
      return <FileVideo className="h-5 w-5 text-purple-500" />;
    } else if (fileType.includes('audio')) {
      return <FileAudio className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('zip') || fileType.includes('archive')) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Select all files"
              />
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
              Name {getSortIndicator('name')}
            </TableHead>
            <TableHead className="cursor-pointer w-[200px]" onClick={() => handleSort('date')}>
              Date Added {getSortIndicator('date')}
            </TableHead>
            <TableHead className="cursor-pointer w-[120px]" onClick={() => handleSort('size')}>
              Size {getSortIndicator('size')}
            </TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow 
              key={file.id} 
              className={selectedFiles.has(file.id) ? 'bg-primary/5' : undefined}
              onClick={() => onSelect(file.id, !selectedFiles.has(file.id))}
            >
              <TableCell className="p-2">
                <Checkbox 
                  checked={selectedFiles.has(file.id)}
                  onCheckedChange={(checked) => onSelect(file.id, !!checked)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${file.name}`}
                />
              </TableCell>
              <TableCell className="p-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {getIconForFile(file)}
                <span 
                  className="cursor-pointer hover:text-primary hover:underline"
                  onClick={() => onPreview(file)}
                >
                  {file.name}
                </span>
              </TableCell>
              <TableCell className="p-2" onClick={(e) => e.stopPropagation()}>
                {format(new Date(file.dateAdded), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="p-2" onClick={(e) => e.stopPropagation()}>
                {formatBytes(file.size)}
              </TableCell>
              <TableCell className="p-2 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    title="Preview" 
                    onClick={() => onPreview(file)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        title="More actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onShare(file)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onRename(file)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadFile(file.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-500 focus:text-red-500"
                        onClick={() => onDelete(file)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}