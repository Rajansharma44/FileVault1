import { FolderSearch, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  searchQuery: string;
  onUploadClick: () => void;
}

export default function EmptyState({
  searchQuery,
  onUploadClick,
}: EmptyStateProps) {
  // Different empty state for search vs. empty folder
  const isSearch = searchQuery.trim().length > 0;
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
        {isSearch ? (
          <FolderSearch className="h-8 w-8 text-gray-400" />
        ) : (
          <Upload className="h-8 w-8 text-gray-400" />
        )}
      </div>
      
      {isSearch ? (
        <div>
          <h3 className="text-lg font-medium mb-1">No files found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No files match your search "{searchQuery}". Try different keywords or
            upload a new file.
          </p>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium mb-1">No files yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Upload your first file to get started
          </p>
        </div>
      )}
      
      <Button
        onClick={onUploadClick}
        className="mt-2"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Files
      </Button>
    </div>
  );
}