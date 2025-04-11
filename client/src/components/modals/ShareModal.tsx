import { useState } from 'react';
import { Share2, Copy, Mail, MessageCircle, Check, Link as LinkIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: number;
    name: string;
    size: number;
  };
  onShare: (fileId: number, expiryDays: number) => Promise<string>;
}

export default function ShareModal({ isOpen, onClose, file, onShare }: ShareModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const link = await onShare(file.id, parseInt(expiryDays));
      setShareLink(link);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Check out this file: ${file.name}\n${shareLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    if (!shareLink) {
      toast({
        title: "Error",
        description: "Please generate a share link first",
        variant: "destructive",
      });
      return;
    }

    const subject = `Shared file: ${file.name}`;
    const body = `I wanted to share this file with you: ${file.name}\n\nYou can access it here: ${shareLink}\n\nThis link will expire in ${expiryDays} ${parseInt(expiryDays) === 1 ? 'day' : 'days'}.`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Use window.open instead of window.location.href for better compatibility
    window.open(mailtoUrl, '_blank');
    
    toast({
      title: "Email client opened",
      description: "Your default email client has been opened with the share details",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share "{file.name}" via link, WhatsApp, or email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareLink ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Link expires in</Label>
                <Select
                  value={expiryDays}
                  onValueChange={setExpiryDays}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select expiry time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">24 hours</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full" 
                onClick={handleShare}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Generating link..."
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Generate Share Link
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleWhatsAppShare}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleEmailShare}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyLink}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 