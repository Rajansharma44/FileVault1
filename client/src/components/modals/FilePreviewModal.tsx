import { useState } from 'react';
import { Share2, Download, Trash2, X, File as FileIcon, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatBytes, formatDate } from '@/lib/utils';
import { useFiles } from '@/hooks/useFiles';
import { useToast } from '@/hooks/use-toast';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: any;
  onShare: () => void;
  onDelete: (file: any) => void;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  file,
  onShare,
  onDelete,
}: FilePreviewModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { downloadFile } = useFiles();
  const { toast } = useToast();
  
  if (!file) return null;
  
  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(file);
      onClose();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };
  
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Client-side download implementation
      if (file.content) {
        // Create a blob from the file content
        let blob;
        let filename = file.name;
        
        if (file.content.startsWith('data:')) {
          // Handle data URLs
          const base64Data = file.content.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
            
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          
          blob = new Blob(byteArrays, { type: file.type });
        } else {
          // Handle plain text content
          blob = new Blob([file.content], { type: file.type });
        }
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        
        toast({
          title: "Download started",
          description: `${file.name} is being downloaded`,
        });
      } else {
        throw new Error("File content not available");
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const renderFilePreview = () => {
    console.log('Rendering preview for file:', {
      name: file.name,
      type: file.type,
      contentPreview: file.content ? file.content.substring(0, 50) + '...' : 'No content'
    });

    if (!file?.type) return <FileIcon className="h-32 w-32 text-primary mx-auto" />;
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-72 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-md">
          <img
            src={file.content}
            alt={file.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              console.error('Image failed to load:', {
                name: file.name,
                contentLength: file.content?.length || 0
              });
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div className="fallback hidden absolute inset-0 flex-col items-center justify-center">
            <FileIcon className="h-16 w-16 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Failed to load image</p>
          </div>
        </div>
      );
    }
    
    if (file.type.startsWith('text/')) {
      try {
        // Check if content is a valid base64 data URL
        if (file.content && file.content.includes('base64,')) {
          const base64Content = file.content.split('base64,')[1];
          // Validate base64 string
          if (/^[A-Za-z0-9+/]*={0,2}$/.test(base64Content)) {
            return (
              <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-md p-4 overflow-auto">
                <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                  {atob(base64Content)}
                </pre>
              </div>
            );
          }
        }
        // If content is not base64, try to display it directly
        return (
          <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-md p-4 overflow-auto">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm">
              {file.content || 'Content preview not available'}
            </pre>
          </div>
        );
      } catch (error) {
        console.error('Error previewing text file:', error);
        return (
          <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-md p-4 overflow-auto">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm text-red-500">
              Error previewing file content
            </pre>
          </div>
        );
      }
    }
    
    if (file.type.startsWith('video/')) {
      return (
        <div className="h-72 bg-black rounded-md overflow-hidden flex items-center justify-center">
          <video
            controls
            className="max-h-full max-w-full"
            src={file.content}
            onError={(e) => {
              e.currentTarget.poster = 'placeholder';
            }}
          >
            Your browser doesn't support video playback.
          </video>
        </div>
      );
    }
    
    if (file.type.startsWith('audio/')) {
      return (
        <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-md p-8 flex flex-col items-center justify-center">
          <FileIcon className="h-24 w-24 text-primary mb-4" />
          <audio
            controls
            className="w-full"
            src={file.content}
          >
            Your browser doesn't support audio playback.
          </audio>
        </div>
      );
    }
    
    // Default file icon for other types
    return (
      <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
        <FileIcon className="h-32 w-32 text-primary" />
      </div>
    );
  };
  
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setConfirmDelete(false);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="text-xl truncate">
            {file.name}
          </DialogTitle>
        </DialogHeader>
        
        {renderFilePreview()}
        
        <div className="grid grid-cols-2 gap-4 py-2 text-sm text-gray-500 dark:text-gray-400">
          <div>
            <p><strong>Type:</strong> {file.type || 'Unknown'}</p>
            <p><strong>Size:</strong> {formatBytes(file.size)}</p>
          </div>
          <div>
            <p><strong>Added:</strong> {formatDate(file.dateAdded)}</p>
            <p><strong>Location:</strong> {file.folder || 'My Files'}</p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between space-x-2">
          <div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="mr-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </Button>
            {confirmDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            )}
          </div>
          
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="mr-2"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button 
              size="sm" 
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}