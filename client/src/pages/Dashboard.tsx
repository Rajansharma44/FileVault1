import { useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FileGrid from "@/components/FileGrid";
import FileTable from "@/components/FileTable";
import EmptyState from "@/components/EmptyState";
import UploadFileModal from "@/components/modals/UploadFileModal";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import ShareFileModal from "@/components/modals/ShareFileModal";
import RenameFileModal from "@/components/modals/RenameFileModal";
import { useFiles } from "@/hooks/useFiles";
import { useAuth } from "@/hooks/useAuthHook";
import { useToast } from "@/hooks/use-toast";
import useDarkMode from "@/hooks/useDarkMode";
import { Button } from "@/components/ui/button";
import { Grid, LayoutGrid, List } from "lucide-react";

export default function Dashboard() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toggleDarkMode, isDarkMode } = useDarkMode();
  const { toast } = useToast();
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  
  // Modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  
  // File state
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "table">("table"); // Set default to table view
  
  const {
    files,
    isLoading,
    uploadFile,
    renameFile,
    deleteFile,
    createShareLink,
  } = useFiles();

  // Get current view from the URL path
  const getCurrentView = () => {
    if (location.startsWith("/folders/")) {
      return "folder";
    }
    if (location === "/recent") {
      return "recent";
    }
    if (location === "/shared") {
      return "shared";
    }
    if (location === "/trash") {
      return "trash";
    }
    return "my-files";
  };

  const view = getCurrentView();
  const folder = view === "folder" ? location.split("/folders/")[1] : "";

  // Get view title
  const getViewTitle = () => {
    switch (view) {
      case "recent":
        return "Recent Files";
      case "shared":
        return "Shared Files";
      case "trash":
        return "Trash";
      case "folder":
        return folder;
      default:
        return "My Files";
    }
  };

  // Filter files based on view and search query
  const filterFiles = () => {
    if (!files) return [];

    let filtered = [...files];

    // Apply view filter
    if (view === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(
        (file) => new Date(file.dateAdded) > sevenDaysAgo && !file.isDeleted
      );
    } else if (view === "shared") {
      filtered = filtered.filter(
        (file) => file.isShared && !file.isDeleted
      );
    } else if (view === "trash") {
      filtered = filtered.filter((file) => file.isDeleted);
    } else if (view === "folder") {
      filtered = filtered.filter(
        (file) => file.folder === folder && !file.isDeleted
      );
    } else {
      // My Files view - show files not in trash
      filtered = filtered.filter((file) => !file.isDeleted);
    }

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

  const filteredFiles = filterFiles();

  // Storage calculations
  const storageQuota = 1024 * 1024 * 1024; // 1GB
  const storageUsed = files?.reduce((total, file) => total + file.size, 0) || 0;
  const storagePercentage = Math.min(100, Math.round((storageUsed / storageQuota) * 100));

  // Handle file actions
  const handleFileUpload = async (fileData: any) => {
    try {
      await uploadFile(fileData);
      toast({
        title: "Success",
        description: `${fileData.name} uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleFilePreview = (file: any) => {
    setSelectedFile(file);
    setPreviewModalOpen(true);
  };

  const handleShareFile = (file: any) => {
    setSelectedFile(file);
    setShareModalOpen(true);
  };

  const handleRenameFile = (file: any) => {
    setSelectedFile(file);
    setRenameModalOpen(true);
  };

  const handleDeleteFile = (file: any) => {
    deleteFile(file.id);
    // Remove from selected files if it was selected
    if (selectedFiles.has(file.id)) {
      const newSelected = new Set(selectedFiles);
      newSelected.delete(file.id);
      setSelectedFiles(newSelected);
    }
  };
  
  // File selection handlers
  const handleSelectFile = (fileId: number, selected: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (selected) {
      newSelected.add(fileId);
    } else {
      newSelected.delete(fileId);
    }
    setSelectedFiles(newSelected);
  };
  
  const handleSelectAllFiles = (selected: boolean) => {
    if (selected) {
      // Select all files
      const allIds = new Set(filteredFiles.map(file => file.id));
      setSelectedFiles(allIds);
    } else {
      // Deselect all
      setSelectedFiles(new Set());
    }
  };
  
  // Save view mode preference to localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'table') {
      setViewMode(savedViewMode);
    }
  }, []);
  
  // Update localStorage when view mode changes
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        currentView={view}
        currentFolder={folder}
        storageUsed={storageUsed}
        storageQuota={storageQuota}
        storagePercentage={storagePercentage}
        user={user}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={logout}
      />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <Header
          title={getViewTitle()}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onUploadClick={() => setUploadModalOpen(true)}
          user={user}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Actions bar */}
          <div className="flex justify-between items-center mb-4">
            <div>
              {selectedFiles.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{selectedFiles.size} selected</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedFiles(new Set())}
                  >
                    Clear Selection
                  </Button>
                  {selectedFiles.size === 1 && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const fileId = Array.from(selectedFiles)[0];
                          const file = filteredFiles.find(f => f.id === fileId);
                          if (file) handleRenameFile(file);
                        }}
                      >
                        Rename
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const fileId = Array.from(selectedFiles)[0];
                          const file = filteredFiles.find(f => f.id === fileId);
                          if (file) handleShareFile(file);
                        }}
                      >
                        Share
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      selectedFiles.forEach(fileId => {
                        const file = filteredFiles.find(f => f.id === fileId);
                        if (file) handleDeleteFile(file);
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <EmptyState
              searchQuery={searchQuery}
              onUploadClick={() => setUploadModalOpen(true)}
            />
          ) : viewMode === 'grid' ? (
            <FileGrid
              files={filteredFiles}
              searchQuery={searchQuery}
              onPreview={handleFilePreview}
              onShare={handleShareFile}
              onRename={handleRenameFile}
              onDelete={handleDeleteFile}
              onUploadClick={() => setUploadModalOpen(true)}
              isLoading={isLoading}
            />
          ) : (
            <FileTable
              files={filteredFiles}
              selectedFiles={selectedFiles}
              sortBy={sortBy.replace('-', '_')}
              onSortChange={(sort) => setSortBy(sort.replace('_', '-'))}
              onPreview={handleFilePreview}
              onShare={handleShareFile}
              onRename={handleRenameFile}
              onDelete={handleDeleteFile}
              onSelect={handleSelectFile}
              onSelectAll={handleSelectAllFiles}
              allSelected={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadFileModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleFileUpload}
        storageQuota={storageQuota}
        storageUsed={storageUsed}
        currentFolder={folder}
      />

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

      <RenameFileModal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        file={selectedFile}
        onRename={renameFile}
      />
    </div>
  );
}
