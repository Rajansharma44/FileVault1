import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Folder, Plus, ChevronRight, FileText, Grid3X3, Search, Info, Share2, MoreVertical } from "lucide-react";
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

export default function Folders() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { files, isLoading, updateFile } = useFiles();
  const { toast } = useToast();
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  
  // Folder navigation state
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  
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
      
      setFolders(Array.from(folderSet));
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
  const handleCreateFolder = () => {
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
    
    // Check if folder already exists at this level
    if (currentSubfolders.includes(sanitizedName)) {
      toast({
        title: "Folder already exists",
        description: "A folder with this name already exists in the current location",
        variant: "destructive",
      });
      return;
    }
    
    // Create the new folder path
    const newFolderPath = currentPath.length > 0 
      ? `${currentPath.join('/')}/${sanitizedName}`
      : sanitizedName;
    
    // Add to folders list
    setFolders([...folders, newFolderPath]);
    
    // Reset dialog
    setNewFolderName("");
    setNewFolderDialogOpen(false);
    
    toast({
      title: "Folder created",
      description: `${sanitizedName} folder has been created`,
    });
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
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header
        title="Folders"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onToggleSidebar={() => {}}
        onUploadClick={() => setLocation("/")}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folder Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Breadcrumb className="overflow-hidden">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        onClick={() => setCurrentPath([])}
                        className="flex items-center"
                      >
                        <Folder className="h-4 w-4 mr-1" />
                        <span>Home</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    
                    {currentPath.map((pathPart, index) => (
                      <BreadcrumbItem key={index}>
                        <BreadcrumbSeparator>
                          <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                        <BreadcrumbLink 
                          onClick={() => navigateToPathLevel(index)}
                        >
                          {pathPart}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              
              <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>New Folder</span>
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
            
            {/* Folders Section */}
            {filteredSubfolders.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Folders</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredSubfolders.map((folder) => (
                    <Card 
                      key={folder}
                      className="cursor-pointer hover:border-primary transition-all"
                      onClick={() => navigateToFolder(folder)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-blue-500/10 dark:bg-blue-500/20 p-2 rounded-md">
                          <Folder className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{folder}</h3>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Files Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Files</h3>
                <Badge variant="outline" className="text-muted-foreground">
                  {sortedFiles.length} {sortedFiles.length === 1 ? "file" : "files"}
                </Badge>
              </div>
              
              {sortedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No files found</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    {searchQuery 
                      ? `No results found for "${searchQuery}"`
                      : currentPath.length > 0
                        ? `This folder is empty`
                        : "You don't have any files at the root level"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedFiles.map((file) => (
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
                      </CardContent>
                      <CardFooter className="flex items-center justify-between border-t p-2 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Folder className="h-3 w-3 mr-1" />
                          <span>{currentPath.length > 0 ? currentPath[currentPath.length - 1] : "Root"}</span>
                        </div>
                        <div className="flex space-x-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => moveFileToFolder(file.id, null)}>
                                Move to Root
                              </DropdownMenuItem>
                              {folders.length > 0 && (
                                <>
                                  <DropdownMenuItem className="font-semibold" disabled>
                                    Move to folder:
                                  </DropdownMenuItem>
                                  {folders.slice(0, 5).map(folder => (
                                    <DropdownMenuItem 
                                      key={folder}
                                      onClick={() => moveFileToFolder(file.id, folder)}
                                    >
                                      {folder}
                                    </DropdownMenuItem>
                                  ))}
                                  {folders.length > 5 && (
                                    <DropdownMenuItem disabled>
                                      + {folders.length - 5} more folders
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Info className="h-4 w-4" />
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}