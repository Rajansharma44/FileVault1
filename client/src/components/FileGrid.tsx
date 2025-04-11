import FileCard from '@/components/FileCard';
import EmptyState from '@/components/EmptyState';

interface FileGridProps {
  files: any[];
  searchQuery: string;
  onPreview: (file: any) => void;
  onShare: (file: any) => void;
  onRename: (file: any) => void;
  onDelete: (file: any) => void;
  onUploadClick: () => void;
  isLoading: boolean;
}

export default function FileGrid({
  files,
  searchQuery,
  onPreview,
  onShare,
  onRename,
  onDelete,
  onUploadClick,
  isLoading,
}: FileGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 dark:bg-gray-800 h-60 rounded-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return <EmptyState searchQuery={searchQuery} onUploadClick={onUploadClick} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onPreview={() => onPreview(file)}
          onShare={() => onShare(file)}
          onRename={() => onRename(file)}
          onDelete={() => onDelete(file)}
        />
      ))}
    </div>
  );
}