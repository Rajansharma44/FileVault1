import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Folder, AlertCircle, FileIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileData: any) => void;
  storageQuota: number;
  storageUsed: number;
  currentFolder: string;
}

export default function UploadFileModal({
  isOpen,
  onClose,
  onUpload,
  storageQuota,
  storageUsed,
  currentFolder,
}: UploadFileModalProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Calculate total file size
  const totalFileSize = files 
    ? Array.from(files).reduce((total, file) => total + file.size, 0) 
    : 0;
  
  // Check if upload would exceed quota
  const wouldExceedQuota = (storageUsed + totalFileSize) > storageQuota;
  const usedPercentage = Math.min(100, Math.round((storageUsed / storageQuota) * 100));
  const projectedPercentage = Math.min(
    100, 
    Math.round(((storageUsed + totalFileSize) / storageQuota) * 100)
  );
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };
  
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(e.dataTransfer.files);
    }
  };
  
  // Helper function to read file content
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };
  
  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (wouldExceedQuota) {
      toast({
        title: "Storage quota exceeded",
        description: "You don't have enough storage space. Please free up some space or upgrade your plan.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Setup upload progress
      const totalDuration = 2000; // 2 seconds for upload
      const interval = 50; // Update every 50ms
      let progress = 0;
      
      const timer = setInterval(() => {
        progress += (interval / totalDuration) * 100;
        setUploadProgress(Math.min(95, progress)); // Stop at 95% until complete
        
        if (progress >= 95) {
          clearInterval(timer);
        }
      }, interval);
      
      // Process and upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Read file content
        const fileContent = await readFileAsDataURL(file);
        
        // Upload file via the hook
        await onUpload({
          name: file.name,
          type: file.type,
          size: file.size,
          content: fileContent,
          folder: currentFolder || '',
        });
        
        // Update progress for each file
        setUploadProgress(95 + ((i + 1) / files.length) * 5);
      }
      
      // Complete the upload
      setUploadProgress(100);
      clearInterval(timer);
      
      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${files.length} ${files.length === 1 ? 'file' : 'files'}`,
      });
      
      onClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const resetModal = () => {
    setFiles(null);
    setIsDragging(false);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files to {currentFolder || 'My Files'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Upload area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
                : "border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              disabled={isUploading}
            />
            
            {/* Background animated elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={`absolute -right-8 -top-8 w-16 h-16 rounded-full bg-primary/5 transition-all duration-500 ${isDragging ? 'scale-[3]' : 'scale-0'}`}></div>
              <div className={`absolute -left-8 -bottom-8 w-16 h-16 rounded-full bg-primary/5 transition-all duration-500 ${isDragging ? 'scale-[3]' : 'scale-0'}`}></div>
              {isDragging && (
                <>
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-ping"></div>
                  <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-primary/20 rounded-full animate-ping animation-delay-300"></div>
                  <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-primary/20 rounded-full animate-ping animation-delay-700"></div>
                </>
              )}
            </div>
            
            <div className="relative flex flex-col items-center justify-center space-y-4 py-4">
              <div className={`rounded-full bg-primary/10 p-5 transition-all duration-300 ${isDragging ? 'scale-125' : ''}`}>
                <Upload className={`h-8 w-8 text-primary transition-transform duration-300 ${isDragging ? 'translate-y-1' : ''}`} />
              </div>
              
              <div className="space-y-2">
                <div className="text-base font-medium">
                  {isDragging ? (
                    <div className="text-primary font-bold text-lg animate-pulse">Drop to upload files!</div>
                  ) : (
                    <div><span className="text-primary hover:underline">Click to upload</span> or drag and drop</div>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload documents, images, videos and more
                </p>
              </div>
              
              <div className="mt-2 flex items-center justify-center flex-wrap gap-2 max-w-xs mx-auto">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Images</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Documents</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">Videos</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Audio</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Archives</span>
              </div>
            </div>
          </div>
          
          {/* Selected files */}
          {files && files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <span>Selected Files</span>
                <span className="ml-2 inline-flex items-center justify-center bg-primary/10 text-primary text-xs font-semibold rounded-full w-5 h-5">{files.length}</span>
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {Array.from(files).map((file, index) => {
                  const fileType = file.type || '';
                  let iconColor = "text-gray-500";
                  let bgColor = "bg-gray-100 dark:bg-gray-800";
                  
                  if (fileType.includes('image')) {
                    iconColor = "text-blue-500";
                    bgColor = "bg-blue-50 dark:bg-blue-900/20";
                  } else if (fileType.includes('pdf')) {
                    iconColor = "text-red-500";
                    bgColor = "bg-red-50 dark:bg-red-900/20";
                  } else if (fileType.includes('video')) {
                    iconColor = "text-purple-500";
                    bgColor = "bg-purple-50 dark:bg-purple-900/20";
                  } else if (fileType.includes('audio')) {
                    iconColor = "text-green-500";
                    bgColor = "bg-green-50 dark:bg-green-900/20";
                  } else if (fileType.includes('zip') || fileType.includes('archive')) {
                    iconColor = "text-amber-500";
                    bgColor = "bg-amber-50 dark:bg-amber-900/20";
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center p-2 ${bgColor} rounded-md text-sm border border-transparent hover:border-primary/20 transition-all duration-200 animate-slideIn`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="rounded-full bg-white dark:bg-gray-700 p-1 mr-2">
                        <FileIcon className={`h-4 w-4 ${iconColor} flex-shrink-0`} />
                      </div>
                      <span className="truncate flex-1 font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 bg-white/50 dark:bg-gray-800/50 px-2 py-0.5 rounded-full">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Storage quota indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Storage used</span>
              <span>
                {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
              </span>
            </div>
            <Progress value={usedPercentage} className="h-2" />
            
            {files && files.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                <Folder className="h-3 w-3 mr-1" />
                After upload: {formatBytes(storageUsed + totalFileSize)} (
                {projectedPercentage}%)
                
                {wouldExceedQuota && (
                  <span className="flex items-center ml-2 text-red-500">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Exceeds storage quota
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              isUploading ||
              !files ||
              files.length === 0 ||
              wouldExceedQuota
            }
            onClick={handleUpload}
            className={`relative overflow-hidden transition-all ${files && files.length > 0 && !wouldExceedQuota ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md' : ''}`}
          >
            {isUploading ? (
              <div className="flex items-center">
                <span className="relative z-10 mr-2">Uploading</span>
                <div className="relative z-10 flex space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                {/* Progress overlay */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-green-500/20 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            ) : (
              <>
                <Upload className={`mr-2 h-4 w-4 transition-transform group-hover:scale-110 ${files && files.length > 0 ? 'animate-bounceIn' : ''}`} />
                <span>Upload{files && files.length > 0 ? ` ${files.length} ${files.length === 1 ? 'File' : 'Files'}` : ''}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}