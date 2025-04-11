import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Folder, Plus, ChevronRight, FileText, Grid3X3, Search, Info, Share2, MoreVertical, Home, List, ArrowLeft, X } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/useAuthHook";
import { useFiles } from "@/hooks/useFiles";
import { formatBytes, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Folders() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { files, isLoading, updateFile, createFolder, deleteFile } = useFiles();
  const { toast } = useToast();
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  
  // Preview state
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Get all files that are not deleted
  const activeFiles = files?.filter(file => !file.isDeleted) || [];
  
  // Effect to extract folders from files
  useEffect(() => {
    if (activeFiles.length > 0) {
      const folderSet = new Set<string>();
      
      activeFiles.forEach(file => {
        if (file.folder && typeof file.folder === 'string' && file.folder.trim() !== '') {
          // Extract all folder paths (including parent folders)
          const folderPath = file.folder.split('/').filter((f: string) => f.trim() !== '');
          let path = '';
          
          folderPath.forEach((folder: string) => {
            path = path ? `${path}/${folder}` : folder;
            folderSet.add(path);
          });
        }
      });
      
      const newFolders = Array.from(folderSet);
      if (JSON.stringify(newFolders) !== JSON.stringify(folders)) {
        setFolders(newFolders);
      }
    }
  }, [activeFiles]);
  
  // Get current folder path as a string
  const currentFolder = currentPath.join('/');
  
  // Get folders at the current path level
  const getFoldersAtCurrentLevel = () => {
    if (currentPath.length === 0) {
      // Root level - get top-level folders
      const topLevelFolders = new Set<string>();
      
      folders.forEach(folder => {
        const parts = folder.split('/');
        if (parts.length > 0) {
          topLevelFolders.add(parts[0]);
        }
      });
      
      return Array.from(topLevelFolders);
    } else {
      // Get subfolders of current path
      const subfolders = new Set<string>();
      const currentPathStr = currentPath.join('/');
      
      folders
        .filter(folder => folder.startsWith(currentPathStr + '/'))
        .forEach(folder => {
          const remainingPath = folder.slice(currentPathStr.length + 1);
          const parts = remainingPath.split('/');
          if (parts.length > 0 && parts[0]) {
            subfolders.add(parts[0]);
          }
        });
        
      return Array.from(subfolders);
    }
  };
  
  // Get files in the current folder
  const getFilesInCurrentFolder = () => {
    return activeFiles.filter(file => {
      if (!currentFolder) {
        // Root folder - show files with no folder or empty folder
        return !file.folder || file.folder.trim() === '';
      } else {
        // Show files in the current folder
        return file.folder === currentFolder;
      }
    });
  };
  
  // Current subfolder list
  const currentSubfolders = getFoldersAtCurrentLevel();
  
  // Current files list
  const currentFiles = getFilesInCurrentFolder();
  
  // Navigate to a subfolder
  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };
  
  // Navigate up one level
  const navigateUp = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };
  
  // Navigate to a specific path level
  const navigateToPathLevel = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };
  
  // Create a new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }
    
    // Sanitize folder name (remove slashes and special characters)
    const sanitizedName = newFolderName.trim().replace(/[/\\?%*:|"<>]/g, '-');
    
    try {
      // Create the folder using the useFiles hook
      await createFolder(sanitizedName, currentPath);
      
      // Reset dialog state
      setNewFolderName("");
      setNewFolderDialogOpen(false);
      
      toast({
        title: "Folder created",
        description: `${sanitizedName} folder has been created`,
      });
    } catch (error) {
      toast({
        title: "Error creating folder",
        description: error instanceof Error ? error.message : "Could not create folder",
        variant: "destructive",
      });
    }
  };
  
  // Move a file to a folder
  const moveFileToFolder = async (fileId: number, folderPath: string | null) => {
    try {
      await updateFile(fileId, { folder: folderPath });
      toast({
        title: "File moved",
        description: folderPath 
          ? `File moved to ${folderPath}` 
          : "File moved to root folder",
      });
    } catch (error) {
      toast({
        title: "Error moving file",
        description: "Could not move the file",
        variant: "destructive",
      });
    }
  };
  
  // Apply search filter to current files
  const filteredFiles = searchQuery
    ? currentFiles.filter(
        file => file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (file.type && file.type.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : currentFiles;
  
  // Apply sorting to current files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
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
  
  // Filter subfolders by search query
  const filteredSubfolders = searchQuery
    ? currentSubfolders.filter(folder => 
        folder.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentSubfolders;
  
  // Function to handle file preview
  const handleFilePreview = (file: File) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  // Function to get file preview content
  const getPreviewContent = (file: File) => {
    const isImage = file.type?.startsWith('image/');
    const isText = file.type?.startsWith('text/') || file.type === 'application/json';
    const isPDF = file.type === 'application/pdf';

    if (isImage) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <img 
            src={file.content} 
            alt={file.name}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>
      );
    }

    if (isText) {
      return (
        <div className="w-full h-full max-h-[70vh] overflow-auto">
          <pre className="p-4 text-sm whitespace-pre-wrap bg-muted rounded-lg">
            {file.content}
          </pre>
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="w-full h-[70vh]">
          <iframe
            src={file.content}
            className="w-full h-full"
            title={file.name}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Preview not available</h3>
        <p className="text-sm text-muted-foreground">
          This file type cannot be previewed directly.
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentPath.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateUp()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="mr-2"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => setCurrentPath([])}>
                  Files
                </BreadcrumbLink>
              </BreadcrumbItem>
              {currentPath.map((folder, index) => (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem key={index}>
                    <BreadcrumbLink onClick={() => navigateToPathLevel(index)}>
                      {folder}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid3X3 className="h-4 w-4" />
            )}
          </Button>
          <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new folder</DialogTitle>
                <DialogDescription>
                  Add a new folder to organize your files
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="folderName">Folder name</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentPath.length > 0 ? (
                    <p>Creating folder in: {currentPath.join('/')}</p>
                  ) : (
                    <p>Creating folder at root level</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setNewFolderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort By
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
              Name (Z-A)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("date-desc")}>
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("date-asc")}>
              Oldest First
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className={cn(
          "grid gap-4",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {/* Folders */}
          {currentSubfolders.map((folder) => (
            <Card
              key={folder}
              className={cn(
                "group hover:shadow-md transition-shadow cursor-pointer",
                viewMode === "list" && "flex items-center justify-between"
              )}
              onClick={() => navigateToFolder(folder)}
            >
              <CardContent className={cn(
                "p-4",
                viewMode === "list" ? "flex items-center gap-4" : "text-center"
              )}>
                <div className={cn(
                  "mb-2",
                  viewMode === "list" && "mb-0 flex items-center gap-4"
                )}>
                  <Folder className={cn(
                    "h-12 w-12 mx-auto text-blue-500",
                    viewMode === "list" && "h-8 w-8"
                  )} />
                  <div className="flex flex-col">
                    <h3 className="font-semibold truncate">{folder}</h3>
                    {viewMode === "list" && (
                      <p className="text-sm text-muted-foreground">
                        {getFilesInFolder(folder).length} items
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Files */}
          {sortedFiles.map((file) => (
            <Card
              key={file.id}
              className={cn(
                "group hover:shadow-md transition-shadow",
                viewMode === "list" && "flex items-center justify-between"
              )}
            >
              <CardContent 
                className={cn(
                  "p-4 cursor-pointer",
                  viewMode === "list" ? "flex items-center gap-4 flex-1" : "text-center"
                )}
                onClick={() => handleFilePreview(file)}
              >
                <div className={cn(
                  "mb-2",
                  viewMode === "list" && "mb-0 flex items-center gap-4 flex-1"
                )}>
                  <FileText className={cn(
                    "h-12 w-12 mx-auto text-gray-500",
                    viewMode === "list" && "h-8 w-8"
                  )} />
                  <div className="flex flex-col flex-1">
                    <h3 className="font-semibold truncate">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatBytes(file.size)} • {formatDate(file.dateAdded)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className={cn(
                "p-4 pt-0 flex justify-end gap-2",
                viewMode === "list" && "pt-4 border-t"
              )}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleFilePreview(file)}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => deleteFile(file.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* File Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-[90vw]" hideCloseButton>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                <DialogTitle className="text-xl">
                  {previewFile?.name}
                </DialogTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              {previewFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatBytes(previewFile.size)}</span>
                  <span>•</span>
                  <span>Last modified: {formatDate(previewFile.dateAdded)}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {previewFile && getPreviewContent(previewFile)}
          </div>

          <DialogFooter className="mt-4">
            <div className="flex justify-end gap-2">
              {previewFile && (
                <Button onClick={() => window.open(previewFile.content, '_blank')}>
                  Open in New Tab
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to get files in a specific folder
function getFilesInFolder(folderPath: string) {
  return files.filter(file => file.folder === folderPath && !file.isDeleted);
}