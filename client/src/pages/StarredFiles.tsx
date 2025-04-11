import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Star, FileText, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuthHook";
import { useFiles } from "@/hooks/useFiles";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import { formatBytes, formatDate } from "@/lib/utils";

export default function StarredFiles() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { files, isLoading, deleteFile } = useFiles();
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  
  // Modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  
  // File state
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Filter only starred files
  const starredFiles = files?.filter(file => file.isStarred && !file.isDeleted) || [];

  // Sort files
  const sortedFiles = [...starredFiles].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-asc":
        return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      case "date-desc":
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      default:
        return 0;
    }
  });

  // Filter files based on search query
  const filteredFiles = () => {
    if (!searchQuery) return sortedFiles;
    const query = searchQuery.toLowerCase();
    return sortedFiles.filter(file => 
      file.name.toLowerCase().includes(query) ||
      file.type.toLowerCase().includes(query)
    );
  };

  const handleFilePreview = (file: any) => {
    setSelectedFile(file);
    setPreviewModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header
        title="Starred Files"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onToggleSidebar={() => {}}
        onUploadClick={() => setLocation("/")}
        user={user}
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
              <Star className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No starred files found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
              {searchQuery 
                ? `No results found for "${searchQuery}"`
                : "You haven't starred any files yet. Star files to see them here."}
            </p>
            <Button onClick={() => setLocation("/")}>
              Back to My Files
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles().map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium truncate">{file.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFilePreview(file)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 flex items-center justify-start text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDate(file.dateAdded)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedFile && (
        <FilePreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          file={selectedFile}
          onDelete={deleteFile}
        />
      )}
    </div>
  );
} 