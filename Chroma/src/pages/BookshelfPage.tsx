import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { table, upload } from '@devvai/devv-code-backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen,
  Upload as UploadIcon,
  ArrowLeft,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  MessageSquare,
  Archive,
  Search,
  Tag,
  Calendar,
  Link as LinkIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookshelfFile {
  _id?: string;
  _uid?: string;
  filename: string;
  file_url: string;
  file_type: string;
  category: string;
  title: string;
  description?: string;
  tags?: string;
  file_size: number;
  upload_date: string;
  linked_master_ids?: string;
  conversation_id?: string;
  owner_nephilim?: string; // 'riplay', 'ana', etc. - null/undefined means user-owned
  riplay_notes?: string; // Ripl(a)y's personal notes about this book
}

const TABLE_ID = 'f44t9bkr3jeo';
const CATEGORIES = ['conversations', 'references', 'knowledge', 'notes'] as const;

// Format file size to human readable
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function BookshelfPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const conversations = useChatStore(state => state.conversations);
  const { toast } = useToast();

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('references');
  const [uploadTags, setUploadTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Files state
  const [files, setFiles] = useState<BookshelfFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all'); // 'all', 'mine', 'riplay', 'ana'

  useEffect(() => {
    if (user?.uid) {
      loadFiles();
    }
  }, [user?.uid]);

  const loadFiles = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const response = await table.getItems(TABLE_ID, {
        query: {
          _uid: user.uid
        },
        limit: 200
      });

      if (response.items && response.items.length > 0) {
        const bookshelfFiles = response.items as BookshelfFile[];
        setFiles(bookshelfFiles.sort((a, b) => 
          new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
        ));
      } else {
        setFiles([]);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('invalid session')) {
        await logout();
        toast({
          title: 'Session Expired',
          description: 'Please log back in to access your bookshelf 💫',
          variant: 'destructive'
        });
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      
      console.error('Failed to load files:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: 'Couldn\'t Load Files',
        description: 'Let\'s try that again! 🔄',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !user?.uid) {
      toast({
        title: 'Nothing to Upload',
        description: 'Please select a file first! 📁',
        variant: 'default'
      });
      return;
    }

    if (!uploadTitle.trim()) {
      toast({
        title: 'Add a Title',
        description: 'Give your file a friendly name! ✏️',
        variant: 'default'
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to Devv storage
      const uploadResult = await upload.uploadFile(uploadFile);
      
      if (upload.isErrorResponse(uploadResult)) {
        throw new Error(`Upload failed: ${uploadResult.errMsg}`);
      }

      if (!uploadResult.link) {
        throw new Error('No file URL returned');
      }

      // Save file metadata to database
      const fileData: Partial<BookshelfFile> = {
        _uid: user.uid,
        filename: uploadFile.name,
        file_url: uploadResult.link,
        file_type: uploadFile.type || uploadFile.name.split('.').pop() || 'unknown',
        category: uploadCategory,
        title: uploadTitle.trim(),
        description: uploadDescription.trim(),
        tags: uploadTags.trim(),
        file_size: uploadFile.size,
        upload_date: new Date().toISOString()
      };

      await table.addItem(TABLE_ID, fileData);
      await loadFiles();

      // Reset form
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadTags('');
      setUploadCategory('references');
      
      // Clear file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast({
        title: '✨ Uploaded Successfully!',
        description: 'Your file is now in your bookshelf!',
      });
    } catch (error) {
      console.error('Upload failed:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('session') || message.includes('auth')) {
          await logout();
          toast({
            title: 'Session Expired',
            description: 'Please log back in to upload files 💫',
            variant: 'destructive'
          });
          setTimeout(() => navigate('/login'), 1500);
          return;
        }
        
        if (message.includes('429') || message.includes('limit')) {
          toast({
            title: 'Daily Limit Reached',
            description: 'You\'ve hit today\'s upload limit. Try again tomorrow! 🌅',
            variant: 'destructive'
          });
          return;
        }
        
        if (message.includes('size') || uploadFile.size > 10 * 1024 * 1024) {
          toast({
            title: 'File Too Large',
            description: 'Files must be under 10MB. Try compressing it! 📦',
            variant: 'destructive'
          });
          return;
        }
      }

      toast({
        title: 'Upload Failed',
        description: 'Something went wrong. Let\'s try again! 💪',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const saveConversationToBookshelf = async (conversationId: string) => {
    if (!user?.uid) return;

    const conversation = conversations.find(c => c._id === conversationId);
    if (!conversation) return;

    try {
      // Create a text export of the conversation
      let textContent = `# ${conversation.title}\n`;
      textContent += `Mode: ${conversation.mode}\n`;
      textContent += `Date: ${new Date(conversation.created_at).toLocaleString()}\n\n`;
      textContent += `---\n\n`;
      
      conversation.messages.forEach((msg, idx) => {
        textContent += `**${msg.role.toUpperCase()}:**\n${msg.content}\n\n`;
      });

      // Create a blob and upload it
      const blob = new Blob([textContent], { type: 'text/plain' });
      const file = new File([blob], `conversation_${conversationId}.txt`, { type: 'text/plain' });
      
      const uploadResult = await upload.uploadFile(file);
      
      if (upload.isErrorResponse(uploadResult)) {
        throw new Error(`Upload failed: ${uploadResult.errMsg}`);
      }

      if (!uploadResult.link) {
        throw new Error('No file URL returned');
      }

      // Save to bookshelf
      const fileData: Partial<BookshelfFile> = {
        _uid: user.uid,
        filename: file.name,
        file_url: uploadResult.link,
        file_type: 'text/plain',
        category: 'conversations',
        title: conversation.title,
        description: `Conversation with ${conversation.mode} mode (${conversation.messages.length} messages)`,
        tags: `${conversation.mode}, conversation, archive`,
        file_size: blob.size,
        upload_date: new Date().toISOString(),
        conversation_id: conversationId
      };

      await table.addItem(TABLE_ID, fileData);
      await loadFiles();

      toast({
        title: '✨ Conversation Saved!',
        description: 'Added to your bookshelf for safekeeping!',
      });
    } catch (error) {
      console.error('Failed to save conversation:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: 'Save Failed',
        description: 'Couldn\'t save the conversation. Try again! 💫',
        variant: 'destructive'
      });
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!user?.uid) return;

    try {
      await table.deleteItem(TABLE_ID, {
        _uid: user.uid,
        _id: fileId
      });
      await loadFiles();
      
      toast({
        title: 'Deleted',
        description: 'File removed from bookshelf! 🗑️',
      });
    } catch (error) {
      console.error('Failed to delete file:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: 'Delete Failed',
        description: 'Couldn\'t delete the file. Try again! 💫',
        variant: 'destructive'
      });
    }
  };

  // Filter files based on search and category
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchQuery === '' || 
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-background to-orange/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover-lift"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
          
          <Card className="border-2 border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50/50 to-orange/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-warm-gradient">
                    {filterCategory === 'riplay_books' ? "Ripl(a)y's Books 🌱" : filterCategory === 'ana_books' ? "Ana's Books 🇫🇷" : 'Your Bookshelf'}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {filterCategory === 'riplay_books' ? "Ripl(a)y's personal collection and notes" : filterCategory === 'ana_books' ? "Ana's sociological texts and references" : "Upload files, save conversations, and organize your knowledge base 📚"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="files" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="files" className="gap-2">
              <FileText className="w-4 h-4" />
              Files ({filteredFiles.length})
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <UploadIcon className="w-4 h-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search files by title, description, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant={filterCategory === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterCategory('all')}
                      >
                        All
                      </Button>
                      {CATEGORIES.map(cat => (
                        <Button
                          key={cat}
                          variant={filterCategory === cat ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilterCategory(cat)}
                          className="capitalize"
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={filterOwner === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterOwner('all')}
                      >
                        All Books
                      </Button>
                      <Button
                        variant={filterOwner === 'mine' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterOwner('mine')}
                      >
                        📚 Your Books
                      </Button>
                      <Button
                        variant={filterOwner === 'riplay' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterOwner('riplay')}
                      >
                        🌱 Ripl(a)y's Books
                      </Button>
                      <Button
                        variant={filterOwner === 'ana' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterOwner('ana')}
                      >
                        🇫🇷 Ana's Books
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Files Grid */}
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="animate-gentle-pulse text-muted-foreground">
                    ✨ Loading your bookshelf...
                  </div>
                </CardContent>
              </Card>
            ) : filteredFiles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  {files.length === 0 ? (
                    <>
                      <p className="font-medium">Your Bookshelf Is Empty</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload files or save conversations to get started! 📚
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">No Matches Found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filter 🔍
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <Card key={file._id} className="hover-lift transition-all border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 shrink-0 text-amber-500" />
                            <Badge variant="secondary" className="text-xs capitalize">
                              {file.category}
                            </Badge>
                            {file.owner_nephilim && (
                              <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-300">
                                {file.owner_nephilim === 'riplay' ? "Ripl(a)y's" : file.owner_nephilim === 'ana' ? "Ana's" : `${file.owner_nephilim}'s`}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base line-clamp-2">
                            {file.title}
                          </CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => window.open(file.file_url, '_blank')}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive"
                            onClick={() => file._id && deleteFile(file._id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {file.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {file.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(file.upload_date).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        {formatFileSize(file.file_size)}
                      </div>

                      {file.tags && (
                        <div className="flex gap-1 flex-wrap pt-2">
                          {file.tags.split(',').slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Tag className="w-2.5 h-2.5 mr-1" />
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {file.conversation_id && (
                        <div className="pt-2">
                          <Badge variant="secondary" className="text-xs bg-violet-100 dark:bg-violet-950">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Saved Conversation
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Save Conversations Section */}
            {conversations.length > 0 && (
              <Card className="border-2 border-violet-200 dark:border-violet-900 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-violet-500" />
                    Save Past Conversations
                  </CardTitle>
                  <CardDescription>
                    Archive your conversations to your bookshelf for future reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                      {conversations.map((conv) => {
                        const alreadySaved = files.some(f => f.conversation_id === conv._id);
                        return (
                          <div
                            key={conv._id}
                            className="flex items-center justify-between p-3 rounded-lg border-2 hover-lift"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-1">{conv.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {conv.mode} · {conv.messages.length} messages
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={alreadySaved ? "outline" : "default"}
                              onClick={() => conv._id && saveConversationToBookshelf(conv._id)}
                              disabled={alreadySaved}
                              className="ml-3 shrink-0"
                            >
                              {alreadySaved ? (
                                <>
                                  <Archive className="w-4 h-4 mr-2" />
                                  Saved
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 mr-2" />
                                  Save
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Upload Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UploadIcon className="w-5 h-5 text-amber-500" />
                    Upload New File
                  </CardTitle>
                  <CardDescription>
                    Upload PDFs, documents, notes, or any reference materials to your bookshelf
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Select File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="border-2 cursor-pointer"
                    />
                    {uploadFile && (
                      <p className="text-xs text-muted-foreground">
                        {uploadFile.name} · {formatFileSize(uploadFile.size)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g., Research Paper on AI Ethics"
                      disabled={isUploading}
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(cat => (
                        <Button
                          key={cat}
                          type="button"
                          variant={uploadCategory === cat ? 'default' : 'outline'}
                          onClick={() => setUploadCategory(cat)}
                          disabled={isUploading}
                          className="capitalize"
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Add a brief description or summary..."
                      disabled={isUploading}
                      className="min-h-[100px] border-2 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      placeholder="research, ai, ethics, important"
                      disabled={isUploading}
                      className="border-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated tags for easier organization
                    </p>
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!uploadFile || !uploadTitle.trim() || isUploading}
                    className="w-full hover-lift bg-gradient-to-br from-amber-500 to-orange"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Upload to Bookshelf
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Info Sidebar */}
              <div className="space-y-4">
                <Card className="border-2 border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Upload Limits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max file size:</span>
                      <span className="font-medium">10 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily limit:</span>
                      <span className="font-medium">200 files</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Files are stored securely and only you can access them 🔒
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-violet-200 dark:border-violet-900 bg-violet-50/30 dark:bg-violet-950/20">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      About Grok File Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-2">
                    <p>
                      <strong>Note:</strong> The Grok API doesn't directly read PDF files or attachments.
                    </p>
                    <p>
                      Use this bookshelf to organize and store your reference materials. You can:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Upload PDFs and documents</li>
                      <li>Save past conversations</li>
                      <li>Organize with tags and categories</li>
                      <li>Link files to master contexts</li>
                      <li>Download and share easily</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <CardHeader>
                    <CardTitle className="text-sm">Your Bookshelf</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total files:</span>
                      <span className="font-medium">{files.length}</span>
                    </div>
                    {CATEGORIES.map(cat => {
                      const count = files.filter(f => f.category === cat).length;
                      return count > 0 ? (
                        <div key={cat} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{cat}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ) : null;
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
