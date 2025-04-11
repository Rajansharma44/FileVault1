import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Trash2, FileText, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuthHook";
import { useFiles } from "@/hooks/useFiles";
import { useToast } from "@/hooks/use-toast";
import { formatBytes, formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FilePreviewModal from "@/components/modals/FilePreviewModal";

export default function Trash() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { files, isLoading, permanentlyDeleteFile, fetchFiles } = useFiles();
  const { toast } = useToast();
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch files including deleted ones when component mounts
  useEffect(() => {
    fetchFiles(true); // true to include deleted files
  }, [fetchFiles]);
  
  // Get only deleted files
  const deletedFiles = files?.filter(file => file.isDeleted) || [];
  
  // Filter and sort files
  const filteredFiles = () => {
    let filtered = [...deletedFiles];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        file =>
          file.name.toLowerCase().includes(query) ||
          (file.type && file.type.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date-asc":
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        case "date-desc":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case "size-asc":
          return a.size - b.size;
        case "size-desc":
          return b.size - a.size;
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });
    
    return filtered;
  };
  
  // Handle permanent delete
  const handlePermanentDelete = async () => {
    if (!selectedFile) return;
    
    try {
      await permanentlyDeleteFile(selectedFile.id);
      setShowDeleteDialog(false);
      toast({
        title: "File deleted",
        description: `${selectedFile.name} has been permanently deleted`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };
  
  // Handle empty trash
  const handleEmptyTrash = async () => {
    try {
      // Delete all files in trash
      await Promise.all(deletedFiles.map(file => permanentlyDeleteFile(file.id)));
      setShowEmptyTrashDialog(false);
      toast({
        title: "Trash emptied",
        description: "All files have been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to empty trash",
        variant: "destructive",
      });
    }
  };

  // Handle file preview
  const handlePreview = (file: any) => {
    setSelectedFile(file);
    setShowPreviewModal(true);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        title="Trash"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onToggleSidebar={() => {}}
        onUploadClick={() => {}}
        user={user}
        hideUploadButton={true}
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredFiles().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
              <Trash2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
              {searchQuery 
                ? `No results found for "${searchQuery}"`
                : "No files in trash"}
            </p>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Back to My Files
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Trash</h2>
                <Badge variant="outline" className="text-muted-foreground">
                  {filteredFiles().length} {filteredFiles().length === 1 ? "file" : "files"}
                </Badge>
              </div>
              <Button 
                variant="destructive"
                onClick={() => setShowEmptyTrashDialog(true)}
                disabled={filteredFiles().length === 0}
              >
                Empty Trash
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles().map((file) => (
                <Card key={file.id} className="overflow-hidden hover:border-primary transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 rounded-md p-2">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{file.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span>{formatBytes(file.size)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(file.dateAdded)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreview(file)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          setSelectedFile(file);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Permanently
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* File Preview Modal */}
      {showPreviewModal && selectedFile && (
        <FilePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          file={selectedFile}
          onDelete={(file) => {
            setShowPreviewModal(false);
            setSelectedFile(file);
            setShowDeleteDialog(true);
          }}
          onShare={() => {}}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete File?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-medium">{selectedFile?.name}</span> from your storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handlePermanentDelete}
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty Trash Confirmation Dialog */}
      <AlertDialog open={showEmptyTrashDialog} onOpenChange={setShowEmptyTrashDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all {filteredFiles().length} files in your trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleEmptyTrash}
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 