import { useState } from 'react';
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
  Star,
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
import { useFiles } from '@/hooks/useFiles';
import ShareModal from '@/components/modals/ShareModal';

interface FileCardProps {
  file: any;
  onPreview: () => void;
  onShare?: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function FileCard({
  file,
  onPreview,
  onRename,
  onDelete,
}: FileCardProps) {
  const { starFile, unstarFile, createShareLink } = useFiles();
  const [isStarred, setIsStarred] = useState(file.isStarred);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleStarClick = async () => {
    try {
      if (isStarred) {
        await unstarFile(file.id);
        setIsStarred(false);
      } else {
        await starFile(file.id);
        setIsStarred(true);
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const getFilePreview = () => {
    console.log('Rendering thumbnail for file:', {
      name: file.name,
      type: file.type,
      contentPreview: file.content ? file.content.substring(0, 50) + '...' : 'No content'
    });

    if (!file.type) return <FileIcon className="h-16 w-16 text-primary" />;

    if (file.type.startsWith('image/')) {
      return (
        <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
          <img
            src={file.content}
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Thumbnail failed to load:', {
                name: file.name,
                contentLength: file.content?.length || 0
              });
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="fallback hidden absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-primary" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center">
        {getFileIcon(file.type)}
      </div>
    );
  };

  return (
    <>
      <Card className="group relative overflow-hidden hover:border-primary transition-all">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`${
              file.type?.startsWith('image/') ? 'bg-purple-100 dark:bg-purple-900' :
              file.type?.startsWith('video/') ? 'bg-red-100 dark:bg-red-900' :
              file.type?.startsWith('audio/') ? 'bg-yellow-100 dark:bg-yellow-900' :
              'bg-blue-100 dark:bg-blue-900'
            } p-2 rounded`}>
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{file.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span>{formatBytes(file.size)}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(file.dateAdded)}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative z-20"
                onClick={handleStarClick}
              >
                <Star className={`h-4 w-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative z-20"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onPreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRename}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        file={file}
        onShare={createShareLink}
      />
    </>
  );
}