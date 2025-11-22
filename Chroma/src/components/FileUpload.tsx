import { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { upload } from '@devvai/devv-code-backend';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import type { FileAttachment } from '@/store/chat-store';

interface FileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesUploaded, disabled }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('text/') || type.includes('document')) return FileText;
    return File;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check authentication
    if (!isAuthenticated) {
      toast({
        title: 'Quick Login Needed',
        description: 'Just sign in and we\'ll get those files uploaded! 🔐',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    const newFiles: FileAttachment[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1}/${totalFiles}: ${file.name}`);

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File\'s A Bit Too Big',
          description: `${file.name} is over our 10MB limit. Try compressing it and we'll get it uploaded! 📦`,
          variant: 'destructive'
        });
        continue;
      }

      // Warn for files over 5MB (might be slow)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Hang Tight!',
          description: `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB. This might take a moment... ⏳`,
        });
      }

      try {
        // Add timeout wrapper
        const uploadWithTimeout = Promise.race([
          upload.uploadFile(file),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout after 60 seconds')), 60000)
          )
        ]);

        const result = await uploadWithTimeout;

        if (upload.isErrorResponse(result)) {
          // Handle specific error codes
          if (result.errCode === 429) {
            toast({
              title: 'You\'ve Hit Today\'s Limit',
              description: 'You can upload 200 files per day. Take a breather and try again tomorrow! 🌅',
              variant: 'destructive'
            });
          } else if (result.errCode === 401) {
            toast({
              title: 'Session Timed Out',
              description: 'Quick login and we\'ll get that file uploaded! 🔐',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Upload Hiccup',
              description: `${file.name}: ${result.errMsg}. Let's try that again! 💪`,
              variant: 'destructive'
            });
          }
          continue;
        }

        if (result.link) {
          newFiles.push({
            filename: file.name,
            url: result.link,
            type: file.type,
            size: file.size
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Specific handling for timeout and network errors
        if (errorMessage.includes('timeout') || errorMessage.includes('Load failed')) {
          toast({
            title: 'Upload Took Too Long',
            description: `${file.name} timed out. Check your connection or try a smaller file! 🌐`,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Oops, Upload Failed',
            description: `Couldn't upload ${file.name}: ${errorMessage}. Let's give it another try! 🔄`,
            variant: 'destructive'
          });
        }
      }
    }

    const allFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(allFiles);
    onFilesUploaded(allFiles);
    setIsUploading(false);
    setUploadProgress('');

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  return (
    <div className="space-y-2">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
          accept="*/*"
          aria-label="File upload input"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadProgress || 'Uploading...'}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Add Files ✨
            </>
          )}
        </Button>
        {!isAuthenticated && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            Sign in to share files with me! 📎
          </p>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((file, index) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm"
              >
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate max-w-[150px]">{file.filename}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-1 p-1 hover:bg-background rounded transition-colors"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
