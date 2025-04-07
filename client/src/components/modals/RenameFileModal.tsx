import { useState } from 'react';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface RenameFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: any;
  onRename: (fileId: number, newName: string) => Promise<void>;
}

export default function RenameFileModal({
  isOpen,
  onClose,
  file,
  onRename,
}: RenameFileModalProps) {
  const [newName, setNewName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const { toast } = useToast();
  
  // Set the default name when the modal is opened with a file
  if (file && !newName && isOpen) {
    setNewName(file.name);
  }
  
  const handleRename = async () => {
    if (!newName.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a valid file name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsRenaming(true);
      await onRename(file.id, newName.trim());
      toast({
        title: "File renamed",
        description: "File has been successfully renamed",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Rename failed",
        description: error.message || "Failed to rename file",
        variant: "destructive",
      });
    } finally {
      setIsRenaming(false);
    }
  };
  
  const resetModal = () => {
    setNewName('');
    setIsRenaming(false);
  };
  
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetModal();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              placeholder="Enter new file name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isRenaming}
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isRenaming}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleRename}
            disabled={isRenaming || !newName.trim() || newName === file?.name}
          >
            {isRenaming ? (
              <>
                <span className="mr-2">Renaming</span>
                <span className="animate-spin">⋯</span>
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}