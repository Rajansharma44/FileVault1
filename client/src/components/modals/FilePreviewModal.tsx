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
  
  const renderFilePreview = () => {
    if (!file?.type) return <FileIcon className="h-32 w-32 text-primary mx-auto" />;
    
    if (file.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-72 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-md">
          <img
            src={file.previewUrl || 'placeholder'}
            alt={file.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              e.currentTarget.src = 'placeholder';
            }}
          />
        </div>
      );
    }
    
    if (file.type.startsWith('text/')) {
      return (
        <div className="h-72 bg-gray-100 dark:bg-gray-800 rounded-md p-4 overflow-auto">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm">
            {file.content || 'Content preview not available'}
          </pre>
        </div>
      );
    }
    
    if (file.type.startsWith('video/')) {
      return (
        <div className="h-72 bg-black rounded-md overflow-hidden flex items-center justify-center">
          <video
            controls
            className="max-h-full max-w-full"
            src={file.url || ''}
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
            src={file.url || ''}
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
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
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
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}