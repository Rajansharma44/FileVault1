import {
  Eye,
  Share2,
  Pencil,
  Trash2,
  MoreVertical,
  File as FileIcon,
  Image as ImageIcon,
  FileText,
  FileAudio,
  FileVideo,
  FileCode,
  File,
  Archive,
} from 'lucide-react';
import { formatBytes, formatDate, getFileIcon } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface FileCardProps {
  file: any;
  onPreview: () => void;
  onShare: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function FileCard({
  file,
  onPreview,
  onShare,
  onRename,
  onDelete,
}: FileCardProps) {
  const { name, type, size, dateAdded, isShared } = file;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border-transparent hover:border-primary/20 group/card">
      {/* File Preview Area */}
      <div 
        onClick={onPreview}
        className="h-32 bg-gray-100 dark:bg-gray-700 p-4 flex items-center justify-center cursor-pointer border-b dark:border-gray-600"
      >
        {type?.startsWith('image/') ? (
          <div className="h-full w-full flex items-center justify-center">
            <img 
              src={file.previewUrl || 'placeholder'} 
              alt={name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'placeholder';
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center relative group">
            {type?.includes('pdf') ? (
              <div className="bg-red-100 dark:bg-red-900/40 p-5 rounded-lg transform transition-transform group-hover:scale-110 group-hover:shadow-md">
                <FileText className="h-16 w-16 text-red-500 dark:text-red-400" />
              </div>
            ) : type?.includes('audio') ? (
              <div className="bg-green-100 dark:bg-green-900/40 p-5 rounded-lg transform transition-transform group-hover:scale-110 group-hover:shadow-md">
                <FileAudio className="h-16 w-16 text-green-500 dark:text-green-400" />
              </div>
            ) : type?.includes('video') ? (
              <div className="bg-purple-100 dark:bg-purple-900/40 p-5 rounded-lg transform transition-transform group-hover:scale-110 group-hover:shadow-md">
                <FileVideo className="h-16 w-16 text-purple-500 dark:text-purple-400" />
              </div>
            ) : type?.includes('zip') || type?.includes('archive') ? (
              <div className="bg-amber-100 dark:bg-amber-900/40 p-5 rounded-lg transform transition-transform group-hover:scale-110 group-hover:shadow-md">
                <Archive className="h-16 w-16 text-amber-500 dark:text-amber-400" />
              </div>
            ) : type?.includes('html') || type?.includes('js') || type?.includes('css') || type?.includes('php') ? (
              <div className="bg-blue-100 dark:bg-blue-900/40 p-5 rounded-lg transform transition-transform group-hover:scale-110 group-hover:shadow-md">
                <FileCode className="h-16 w-16 text-blue-500 dark:text-blue-400" />
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800/60 p-5 rounded-lg transform transition-transform group-hover:scale-110 group-hover:shadow-md">
                <File className="h-16 w-16 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded">
              <Eye className="h-8 w-8" />
              <span className="ml-2 text-sm font-medium">Quick View</span>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="truncate pr-2">
            <h3 className="font-medium truncate" title={name}>
              {name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatBytes(size)} • {formatDate(dateAdded)}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRename}>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}