import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UploadFileData {
  name: string;
  type: string;
  size: number;
  content: string;
  folder?: string;
}

interface ShareResponse {
  link: string;
}

interface DownloadResponse {
  url: string;
  filename: string;
}

interface FileData {
  id: number;
  name: string;
  type: string;
  size: number;
  dateAdded: string;
  lastAccessed?: string;
  isDeleted: boolean;
  isShared: boolean;
  isStarred: boolean;
  folder?: string;
}

// Sample data
const sampleFiles = [
  {
    id: 1,
    name: 'Document1.pdf',
    type: 'application/pdf',
    size: 1024 * 1024 * 2.5, // 2.5MB
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    folder: '',
    isShared: false,
    isDeleted: false,
    userId: 1,
  },
  {
    id: 2,
    name: 'image.jpg',
    type: 'image/jpeg',
    size: 1024 * 1024 * 1.2, // 1.2MB
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    folder: 'images',
    isShared: true,
    isDeleted: false,
    userId: 1,
  },
  {
    id: 3,
    name: 'spreadsheet.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024 * 512, // 512KB
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    folder: 'documents',
    isShared: false,
    isDeleted: false,
    userId: 1,
  },
  {
    id: 4,
    name: 'presentation.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 1024 * 1024 * 3.7, // 3.7MB
    dateAdded: new Date().toISOString(), // Today
    folder: 'documents',
    isShared: false,
    isDeleted: false,
    userId: 1,
  },
];

export function useFiles() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get auth token from localStorage
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Get user ID from localStorage
  const getUserId = useCallback((): number => {
    const userStr = localStorage.getItem('user');
    if (!userStr) throw new Error('User not found');
    const user = JSON.parse(userStr);
    return user.id;
  }, []);

  // Function to fetch files from the server
  const fetchFiles = useCallback(async (includeDeleted: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<FileData[]>(`/api/files?includeDeleted=${includeDeleted}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      setFiles(response);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, toast]);

  const fetchDeletedFiles = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest<FileData[]>("/api/files", {
        method: "GET",
        headers: getAuthHeaders(),
      });
      
      if (Array.isArray(response)) {
        setFiles(response);
      }
    } catch (error) {
      console.error("Error fetching deleted files:", error);
      toast({
        title: "Error",
        description: "Failed to fetch deleted files",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch recently accessed files
  const fetchRecentFiles = useCallback(async () => {
    try {
      const response = await apiRequest<FileData[]>("/api/files/recent", {
        method: "GET",
        headers: getAuthHeaders(),
      });
      setRecentFiles(response);
    } catch (error) {
      console.error('Error fetching recent files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recent files",
        variant: "destructive",
      });
    }
  }, [getAuthHeaders, toast]);

  // Initial fetch of files
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Upload file to the server
  const uploadFile = useCallback(async (fileData: UploadFileData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<FileData>("/api/files", {
        method: "POST",
        body: fileData,
        headers: getAuthHeaders(),
      });
      
      setFiles(prevFiles => {
        const exists = prevFiles.some(f => f.id === response.id);
        if (exists) {
          return prevFiles.map(f => f.id === response.id ? response : f);
        }
        return [...prevFiles, response];
      });
      
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  const renameFile = async (fileId: number, newName: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<FileData>(`/api/files/${fileId}`, {
        method: "PATCH",
        body: { name: newName },
        headers: getAuthHeaders(),
      });
      
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === fileId ? response : file
        )
      );
      
      return response;
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFile = async (fileId: number) => {
    setIsLoading(true);
    try {
      // Send delete request to move file to trash
      await apiRequest<FileData>(`/api/files/${fileId}`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: { isDeleted: true }
      });
      
      // Update local state to mark file as deleted
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === fileId ? { ...file, isDeleted: true } : file
        )
      );
      
      // Fetch updated files to ensure we have the latest state
      await fetchFiles(true);
      
      toast({
        title: "File deleted",
        description: "File has been moved to trash",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to move file to trash",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const permanentlyDeleteFile = async (fileId: number) => {
    setIsLoading(true);
    try {
      await apiRequest(`/api/files/${fileId}/permanent`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await fetchDeletedFiles();
      toast({
        title: "File permanently deleted",
        description: "The file has been permanently removed from your storage",
      });
    } catch (error) {
      console.error('Error permanently deleting file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const restoreFile = async (fileId: number) => {
    setIsLoading(true);
    try {
      await apiRequest(`/api/files/${fileId}/restore`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      await fetchDeletedFiles();
      toast({
        title: "File restored",
        description: "The file has been restored from trash",
      });
    } catch (error) {
      console.error('Error restoring file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createShareLink = async (fileId: number, expiryDays: number) => {
    setIsLoading(true);
    try {
      // For demo purposes, generate a mock share link
      // In a real app, this would be an API call
      const mockShareLink = `${window.location.origin}/shared/${fileId}?token=${Math.random().toString(36).substring(2)}`;
      
      // Mark file as shared
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === fileId ? { ...file, isShared: true } : file
        )
      );
      
      return mockShareLink;
    } catch (error) {
      console.error('Error creating share link:', error);
      throw new Error('Failed to generate share link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateFile = async (fileId: number, updates: Partial<FileData>) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<FileData>(`/api/files/${fileId}`, {
        method: "PATCH",
        body: updates,
        headers: getAuthHeaders(),
      });
      
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === fileId ? response : file
        )
      );
      
      return response;
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update access time
  const updateFileAccess = async (fileId: number) => {
    try {
      await apiRequest(`/api/files/${fileId}/access`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      // Refresh recent files after updating access time
      await fetchRecentFiles();
    } catch (error) {
      console.error('Error updating file access:', error);
    }
  };

  // Modify existing functions to track file access
  const downloadFile = async (fileId: number) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<DownloadResponse>(`/api/files/${fileId}/download`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      
      // Update access time when downloading
      await updateFileAccess(fileId);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = response.url;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const starFile = async (fileId: number) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<FileData>(`/api/files/${fileId}/star`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      
      // Update the file in the state
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === fileId ? { ...file, isStarred: true } : file
        )
      );

      // Show success toast
      toast({
        title: "File starred",
        description: "File has been added to your starred items",
      });
      
      // Refresh the file list to ensure we have the latest data
      await fetchFiles();
      
      return response;
    } catch (error) {
      console.error('Error starring file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to star file",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unstarFile = async (fileId: number) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<FileData>(`/api/files/${fileId}/unstar`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      
      // Update the file in the state
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === fileId ? { ...file, isStarred: false } : file
        )
      );

      // Show success toast
      toast({
        title: "File unstarred",
        description: "File has been removed from your starred items",
      });
      
      // Refresh the file list to ensure we have the latest data
      await fetchFiles();
      
      return response;
    } catch (error) {
      console.error('Error unstarring file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unstar file",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async (folderName: string, parentPath: string[] = []) => {
    setIsLoading(true);
    try {
      // Sanitize folder name
      const sanitizedName = folderName.trim().replace(/[/\\?%*:|"<>]/g, '-');
      
      // Construct the full path
      const folderPath = parentPath.length > 0 
        ? parentPath.join('/') 
        : '';
      
      const response = await apiRequest<FileData>("/api/folders", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: { 
          name: sanitizedName,
          path: folderPath,
          isFolder: true,
          type: 'folder',
          size: 0,
          content: '',
          userId: getUserId()
        },
      });
      
      // Update the files state with the new folder
      setFiles(prevFiles => [...prevFiles, response]);
      
      // Show success toast
      toast({
        title: "Folder created",
        description: `Folder "${sanitizedName}" has been created successfully`,
      });
      
      // Fetch updated file list to ensure we have the latest data
      await fetchFiles();
      
      return response;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getFolderContents = async (folderPath: string = '') => {
    setIsLoading(true);
    try {
      const response = await apiRequest<FileData[]>(`/api/folders/${encodeURIComponent(folderPath)}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFolder = async (folderPath: string) => {
    setIsLoading(true);
    try {
      await apiRequest(`/api/folders/${encodeURIComponent(folderPath)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      // Update local state to mark files as deleted
      setFiles(prevFiles => 
        prevFiles.map(file => {
          if (file.folder === folderPath || file.folder?.startsWith(folderPath + '/')) {
            return { ...file, isDeleted: true };
          }
          return file;
        })
      );
      
      // Fetch updated file list
      await fetchFiles();
      
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    files,
    recentFiles,
    activeFiles: files.filter(f => !f.isDeleted),
    isLoading,
    fetchFiles,
    fetchRecentFiles,
    fetchDeletedFiles,
    uploadFile,
    renameFile,
    deleteFile,
    permanentlyDeleteFile,
    restoreFile,
    createShareLink,
    updateFile,
    downloadFile,
    updateFileAccess,
    starFile,
    unstarFile,
    createFolder,
    getFolderContents,
    deleteFolder,
  };
}