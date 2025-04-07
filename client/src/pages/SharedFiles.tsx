import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Share2, FileText, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuthHook";
import { useFiles } from "@/hooks/useFiles";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import ShareFileModal from "@/components/modals/ShareFileModal";
import { formatBytes, formatDate } from "@/lib/utils";

export default function SharedFiles() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { files, isLoading, createShareLink, deleteFile } = useFiles();
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  
  // Modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // File state
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Filter only shared files
  const sharedFiles = files?.filter(file => file.isShared && !file.isDeleted) || [];
  
  // Search and sorting
  const filteredFiles = () => {
    let filtered = [...sharedFiles];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
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
  
  const handleFilePreview = (file: any) => {
    setSelectedFile(file);
    setPreviewModalOpen(true);
  };
  
  const handleShareFile = (file: any) => {
    setSelectedFile(file);
    setShareModalOpen(true);
  };
  
  const handleDeleteFile = (file: any) => {
    deleteFile(file.id);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header
        title="Shared Files"
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
        ) : filteredFiles().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
              <Share2 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No shared files found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
              {searchQuery 
                ? `No results found for "${searchQuery}"`
                : "You haven't shared any files yet. Share files to see them here."}
            </p>
            <Button onClick={() => setLocation("/")}>
              Back to My Files
            </Button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Shared Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles().map((file) => (
                <Card key={file.id} className="overflow-hidden hover:border-primary transition-all">
                  <CardContent className="p-0">
                    <div 
                      className="p-4 cursor-pointer"
                      onClick={() => handleFilePreview(file)}
                    >
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
                    </div>
                    <div className="flex items-center justify-between border-t dark:border-gray-800 p-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Share2 className="h-3 w-3 mr-1" />
                        <span>Shared</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0" 
                          onClick={() => handleShareFile(file)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0" 
                          onClick={() => handleFilePreview(file)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Modals */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        file={selectedFile}
        onShare={() => {
          setPreviewModalOpen(false);
          setShareModalOpen(true);
        }}
        onDelete={(file) => {
          handleDeleteFile(file);
          setPreviewModalOpen(false);
        }}
      />
      
      <ShareFileModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        file={selectedFile}
        onCreateShareLink={createShareLink}
      />
    </div>
  );
}