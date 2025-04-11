import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";
import {
  FileIcon,
  FileTextIcon,
  ImageIcon,
  Music2Icon,
  VideoIcon,
  FileSpreadsheetIcon,
  FileTypeIcon,
  FileCodeIcon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

export function getFileIcon(fileType: string) {
  const size = { className: "h-10 w-10" };
  
  if (!fileType) return <FileIcon {...size} />;
  
  if (fileType.startsWith('image/')) {
    return <ImageIcon {...size} className="text-blue-500" />;
  } else if (fileType.startsWith('video/')) {
    return <VideoIcon {...size} className="text-red-500" />;
  } else if (fileType.startsWith('audio/')) {
    return <Music2Icon {...size} className="text-green-500" />;
  } else if (fileType.startsWith('text/')) {
    return <FileTextIcon {...size} className="text-yellow-500" />;
  } else if (fileType.includes('spreadsheet')) {
    return <FileSpreadsheetIcon {...size} className="text-green-600" />;
  } else if (fileType.includes('presentation')) {
    return <FileTypeIcon {...size} className="text-orange-500" />;
  } else if (fileType === 'application/pdf') {
    return <FileIcon {...size} className="text-red-500" />;
  } else if (fileType.includes('json') || fileType.includes('javascript') || fileType.includes('html')) {
    return <FileCodeIcon {...size} className="text-purple-500" />;
  } else {
    return <FileIcon {...size} className="text-gray-500" />;
  }
}
