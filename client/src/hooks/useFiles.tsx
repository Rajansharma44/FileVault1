import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UploadFileData {
  name: string;
  type: string;
  size: number;
  content: string;
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
  const [files, setFiles] = useState<any[]>(sampleFiles);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simulated API calls
  const uploadFile = async (fileData: UploadFileData) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newFile = {
        id: files.length + 1,
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        dateAdded: new Date().toISOString(),
        folder: fileData.folder || '',
        isShared: false,
        isDeleted: false,
        userId: 1,
      };
      
      setFiles(prevFiles => [...prevFiles, newFile]);
      return newFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const renameFile = async (fileId: number, newName: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === fileId ? { ...file, name: newName } : file
        )
      );
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mark as deleted rather than actually removing
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === fileId ? { ...file, isDeleted: true } : file
        )
      );
      
      toast({
        title: 'File deleted',
        description: 'File has been moved to trash',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createShareLink = async (fileId: number, expiryDays: number) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mark file as shared
      setFiles(prevFiles =>
        prevFiles.map(file =>
          file.id === fileId ? { ...file, isShared: true } : file
        )
      );
      
      // Generate a dummy share link
      const file = files.find(f => f.id === fileId);
      const token = Math.random().toString(36).substring(2, 15);
      const link = `${window.location.origin}/share/${token}`;
      
      return link;
    } catch (error) {
      console.error('Error creating share link:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateFile = async (fileId: number, updates: Partial<any>) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === fileId ? { ...file, ...updates } : file
        )
      );
      
      const updatedFile = files.find(f => f.id === fileId);
      return { ...updatedFile, ...updates };
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (fileId: number) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const file = files.find(f => f.id === fileId);
      if (!file) {
        throw new Error("File not found");
      }
      
      // In a real app, this would fetch the file content from the server
      // For simulation, we'll just create a dummy blob
      const randomContent = Array(100).fill(0).map(() => Math.random().toString(36).substring(2, 15)).join(' ');
      const blob = new Blob([randomContent], { type: file.type });
      
      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast({
        title: 'File download started',
        description: `${file.name} is being downloaded`,
      });
      
      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download failed',
        description: 'There was an error downloading the file',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    files: files.filter(f => !f.isDeleted),
    isLoading,
    uploadFile,
    renameFile,
    deleteFile,
    createShareLink,
    updateFile,
    downloadFile,
  };
}