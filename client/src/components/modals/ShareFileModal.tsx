import { useState, useEffect } from 'react';
import { Share2, Copy, LinkIcon, Check, Mail, Users, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useFiles } from "@/hooks/useFiles";
import { formatBytes } from "@/lib/utils";

interface ShareFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: any;
  onCreateShareLink: (fileId: number, expiryDays: number) => Promise<string>;
}

interface SharePermission {
  value: 'view' | 'edit' | 'comment';
  label: string;
}

export default function ShareFileModal({
  isOpen,
  onClose,
  file,
  onCreateShareLink,
}: ShareFileModalProps) {
  const [activeTab, setActiveTab] = useState<string>("link");
  const [expiryDays, setExpiryDays] = useState(7);
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<SharePermission>({
    value: 'view',
    label: 'View only'
  });
  const [notifyUser, setNotifyUser] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const { downloadFile } = useFiles();
  
  // Clear state when modal opens with new file
  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen, file]);
  
  const sharePermissions: SharePermission[] = [
    { value: 'view', label: 'View only' },
    { value: 'comment', label: 'Can comment' },
    { value: 'edit', label: 'Can edit' }
  ];
  
  const generateShareLink = async () => {
    try {
      setIsGenerating(true);
      const link = await onCreateShareLink(file.id, expiryDays);
      setShareLink(link);
    } catch (error: any) {
      toast({
        title: "Failed to generate link",
        description: error.message || "Could not create share link",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Share link has been copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const resetModal = () => {
    setShareLink('');
    setIsGenerating(false);
    setCopied(false);
    setEmail('');
    setRecipients([]);
    setActiveTab("link");
  };
  
  const handleSendEmail = () => {
    if (!email.trim() || !shareLink) return;
    
    // Open email client with pre-filled information
    const subject = `Shared file: ${file?.name}`;
    const body = `I've shared a file with you: ${shareLink}${notifyUser ? '\n\nThis link expires in ' + expiryDays + (expiryDays === 1 ? ' day.' : ' days.') : ''}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    
    toast({
      title: "Email client opened",
      description: `Sharing "${file?.name}" with ${email}`,
    });
    
    // Add to recipients
    if (!recipients.includes(email)) {
      setRecipients([...recipients, email]);
    }
    
    setEmail('');
  };
  
  const handleShareWithUser = () => {
    if (!email.trim()) return;
    
    // In a real app, this would send the permission to the backend
    toast({
      title: "File shared",
      description: `"${file?.name}" has been shared with ${email} (${selectedPermission.label})`,
    });
    
    // Add to recipients list
    if (!recipients.includes(email)) {
      setRecipients([...recipients, email]);
    }
    
    setEmail('');
  };
  
  const handleDownload = async () => {
    if (!file) return;
    
    try {
      setIsDownloading(true);
      await downloadFile(file.id);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(false);
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
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share File
          </DialogTitle>
          <DialogDescription>
            Share "{file?.name}" with others
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="link" className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <span>Share Link</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>People</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Link Expiration</Label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {expiryDays} {expiryDays === 1 ? 'day' : 'days'}
                </span>
              </div>
              <Slider
                value={[expiryDays]}
                onValueChange={(value) => setExpiryDays(value[0])}
                min={1}
                max={30}
                step={1}
                disabled={!!shareLink || isGenerating}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The link will expire after {expiryDays} {expiryDays === 1 ? 'day' : 'days'}
              </p>
            </div>
            
            {!shareLink && (
              <Button
                onClick={generateShareLink}
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="mr-2">Generating</span>
                    <span className="animate-spin">⋯</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Generate Link
                  </>
                )}
              </Button>
            )}
            
            {shareLink && (
              <div className="space-y-4 animate-scaleIn">
                <div className="rounded-lg bg-secondary/30 p-4 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="share-link" className="flex items-center text-primary">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Share Link
                    </Label>
                    <Badge 
                      variant="outline" 
                      className="bg-primary/10 text-primary text-xs"
                    >
                      Expires in {expiryDays} {expiryDays === 1 ? 'day' : 'days'}
                    </Badge>
                  </div>
                  
                  <div className="flex">
                    <Input
                      id="share-link"
                      value={shareLink}
                      readOnly
                      className="rounded-r-none border-r-0 bg-white dark:bg-gray-950 font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`rounded-l-none transition-all duration-200 ${copied ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}`}
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 animate-bounceIn" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    Anyone with this link can view and download this file until it expires
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary/70" />
                    Send Link via Email
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="focus-visible:ring-primary/30"
                    />
                    <Button
                      variant="outline"
                      className={`shrink-0 transition-all duration-200 ${email.trim() ? 'hover:bg-primary hover:text-primary-foreground' : ''}`}
                      onClick={handleSendEmail}
                      disabled={!email.trim()}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 p-2 rounded-md bg-secondary/20">
                  <Switch
                    id="notify-expiry"
                    checked={notifyUser}
                    onCheckedChange={setNotifyUser}
                  />
                  <Label htmlFor="notify-expiry" className="text-sm">
                    Include expiry information in email
                  </Label>
                </div>
                
                {recipients.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-primary/70" />
                      Sent to:
                    </h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {recipients.map((email, index) => (
                        <div 
                          key={index} 
                          className="flex items-center p-2 bg-secondary/10 rounded-md text-sm animate-slideInRight"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <span className="truncate flex-1">{email}</span>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs ml-2">
                            Sent
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="people" className="space-y-4">
            <div className="rounded-lg bg-secondary/30 p-4 border border-primary/20 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary/70" />
                  Share with User
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus-visible:ring-primary/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="permission" className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2 text-primary/70" />
                  Permission Level
                </Label>
                <Tabs 
                  defaultValue={selectedPermission.value} 
                  onValueChange={(val) => {
                    const perm = sharePermissions.find(p => p.value === val);
                    if (perm) setSelectedPermission(perm);
                  }}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    {sharePermissions.map((perm) => (
                      <TabsTrigger 
                        key={perm.value} 
                        value={perm.value}
                        className={`data-[state=active]:${
                          perm.value === 'view' 
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                            : perm.value === 'comment' 
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' 
                              : 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                        }`}
                      >
                        {perm.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                
                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                  {selectedPermission.value === 'view' && (
                    <p>User can only view the file and cannot make changes.</p>
                  )}
                  {selectedPermission.value === 'comment' && (
                    <p>User can view and add comments but cannot edit the file.</p>
                  )}
                  {selectedPermission.value === 'edit' && (
                    <p>User has full access to view and edit the file.</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-2 rounded-md bg-secondary/20">
                <Switch
                  id="notify-user"
                  checked={notifyUser}
                  onCheckedChange={setNotifyUser}
                />
                <Label htmlFor="notify-user" className="text-sm">
                  Send notification email to user
                </Label>
              </div>
              
              <Button
                onClick={handleShareWithUser}
                className={`w-full transition-all duration-200 ${
                  email.trim() 
                    ? selectedPermission.value === 'view' 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : selectedPermission.value === 'comment' 
                        ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    : ''
                }`}
                disabled={!email.trim()}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share with User
              </Button>
            </div>
            
            {recipients.length > 0 && (
              <div className="space-y-2 animate-scaleIn">
                <h4 className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary/70" />
                  Shared with <span className="ml-1 bg-primary/10 text-primary text-xs rounded-full px-2">{recipients.length}</span>
                </h4>
                <div className="space-y-2 max-h-36 overflow-y-auto p-1">
                  {recipients.map((email, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 bg-secondary/20 hover:bg-secondary/30 transition-colors duration-200 rounded-md animate-slideInRight"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="text-sm truncate flex-1">{email}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ml-2 ${
                          selectedPermission.value === 'view' 
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                            : selectedPermission.value === 'comment' 
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' 
                              : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                        }`}
                      >
                        {selectedPermission.label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="border-t border-border/40 pt-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 mr-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>View</span>
              </div>
              <div className="flex items-center gap-1.5 mr-4">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>Comment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Edit</span>
              </div>
            </div>
            <div>
              <Badge 
                variant="outline" 
                className="text-xs bg-primary/5 text-primary"
              >
                {file?.size ? `${formatBytes(file.size)}` : 'Unknown size'}
              </Badge>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 w-full">
            <div>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex w-full sm:w-auto transition-all duration-200 ${!isDownloading ? 'hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400' : ''}`}
              >
                {isDownloading ? (
                  <div className="flex items-center">
                    <span className="mr-2">Downloading</span>
                    <div className="flex space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isGenerating}
                className="border-gray-200 hover:bg-background dark:border-gray-700"
              >
                Close
              </Button>
              {shareLink && activeTab === "link" && (
                <Button
                  onClick={copyToClipboard}
                  disabled={copied}
                  className={`transition-all duration-200 ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'}`}
                >
                  {copied ? (
                    <div className="flex items-center animate-bounceIn">
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </div>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}