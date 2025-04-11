import React from 'react';
import { Bell, Upload, Share2, Star, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatTimeAgo } from '@/lib/utils';

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    clearAllNotifications
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'star':
        return <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationBackground = (type: string) => {
    switch (type) {
      case 'upload':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'share':
        return 'bg-green-100 dark:bg-green-900';
      case 'star':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'delete':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={clearAllNotifications}
            >
              Clear all
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start py-3 cursor-pointer ${
                  !notification.read ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`${getNotificationBackground(notification.type)} p-1 rounded`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 