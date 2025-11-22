import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore, type AIMode, type FileAttachment } from '@/store/chat-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FileUpload } from '@/components/FileUpload';
import { MicrophoneInput } from '@/components/MicrophoneInput';
import { ChromaPortal } from '@/components/ChromaPortal';
import { useToast } from '@/hooks/use-toast';
import { 
  Code2, 
  Palette, 
  Zap, 
  Drama,
  BookOpen,
  Brain,
  BookMarked,
  Plus,
  Send,
  Trash2,
  LogOut,
  Sparkles,
  Menu,
  X,
  Users,
  File,
  ExternalLink,
  Download,
  Search,
  Globe,
  Filter,
  XCircle,
  MessageCircle,
  Heart,
  Settings,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const modeConfig = {
  coding: {
    icon: Code2,
    label: 'Coding',
    description: 'Let\'s build something amazing together ✨',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  hobby: {
    icon: Palette,
    label: 'Hobby',
    description: 'Discover what makes your heart sing 🎨',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10'
  },
  task: {
    icon: Zap,
    label: 'Tasks',
    description: 'I\'m here to lighten your load ⚡',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  },
  roleplay: {
    icon: Drama,
    label: 'Roleplay',
    description: 'Where stories come alive and anything is possible 🎭',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  diary: {
    icon: BookOpen,
    label: 'Ripley (Diary)',
    description: 'I\'ll reflect on our chats and write you thoughtful notes 💭',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  riplay: {
    icon: Brain,
    label: 'ripl(a)y',
    description: 'Your safe space for deep processing and discovery 🌱',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10'
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const switchToRealAuth = useAuthStore(state => state.switchToRealAuth);
  const isDevMode = useAuthStore(state => state.isDevMode);
  const { toast } = useToast();
  const {
    conversations,
    currentConversation,
    isStreaming,
    streamingContent,
    isLoading,
    webSearchEnabled,
    loadConversations,
    createConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    clearCurrentConversation,
    toggleWebSearch
  } = useChatStore();

  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<AIMode | 'all'>('all');
  
  // Ref for chat scroll area
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Handle initial message from location state (e.g., from EmotionsPage)
  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage) {
      setMessage(state.initialMessage);
      // Clear the state to prevent re-setting on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Filter conversations based on search query and mode
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery.trim() === '' || 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMode = filterMode === 'all' || conv.mode === filterMode;
    
    return matchesSearch && matchesMode;
  });

  useEffect(() => {
    if (user?.uid) {
      loadConversations(user.uid).catch(error => {
        // Handle session expiration when loading
        if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
          logout();
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive'
          });
          setTimeout(() => navigate('/login'), 1500);
        }
      });
    }
  }, [user?.uid, loadConversations]);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSidebarOpen(true);
        // Focus search input after sidebar opens
        setTimeout(() => {
          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Search conversations..."]');
          searchInput?.focus();
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateConversation = async (mode: AIMode) => {
    if (!user?.uid) return;
    try {
      await createConversation(mode, user.uid);
      setIsSidebarOpen(false);
    } catch (error) {
      // Handle session expiration
      if (error instanceof Error && error.message.includes('SESSION_EXPIRED')) {
        await logout();
        toast({
          title: 'Session Timed Out',
          description: 'No worries! Just log back in and we\'ll pick up where we left off 💫',
          variant: 'destructive'
        });
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';
      toast({
        title: 'Oops, That Didn\'t Work',
        description: `${errorMessage}. Let's give it another shot! 🌟`,
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && attachedFiles.length === 0) || !user?.uid || isStreaming) return;

    // Check if user is trying to send files in diary/riplay mode (Grok doesn't support files)
    if (attachedFiles.length > 0 && currentConversation && 
        (currentConversation.mode === 'diary' || currentConversation.mode === 'riplay')) {
      toast({
        title: 'Heads Up! 💭',
        description: 'Ripley and ripl(a)y don\'t support file attachments yet. Your files will be described in text, but DevvAI modes (Coding, Hobby, Task, Roleplay) can analyze them directly!',
        variant: 'default'
      });
    }

    const content = message || 'Analyzing attached files...';
    setMessage('');
    const files = attachedFiles.length > 0 ? attachedFiles : undefined;
    setAttachedFiles([]);
    
    try {
      await sendMessage(content, user.uid, files);
    } catch (error) {
      // Handle session expiration
      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        // Clear auth state
        await logout();
        
        // Show session expired message
        toast({
          title: 'Session Timed Out',
          description: 'No worries! Just log back in and we\'ll pick up where we left off 💫',
          variant: 'destructive'
        });
        
        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast({
        title: 'Oops, Something Went Wrong',
        description: `${errorMessage}. Let's try that again! 💪`,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;
    await deleteConversation(conversationId, user.uid);
  };

  const handleContinueReflection = () => {
    // Smooth scroll to bottom of chat and focus input
    if (chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current?.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
    
    // Focus input field
    const inputField = document.querySelector('input[placeholder*="Share your thoughts"]') as HTMLInputElement;
    if (inputField) {
      setTimeout(() => {
        inputField.focus();
      }, 300);
    }

    // Show encouraging toast
    toast({
      title: 'Let\'s Keep Going! 💭',
      description: currentConversation?.mode === 'diary' 
        ? 'Share what\'s on your mind, and I\'ll reflect with you...'
        : 'I\'m here. What would you like to explore? 🌱',
      variant: 'default'
    });
  };

  const handleExportConversation = (format: 'json' | 'markdown') => {
    if (!currentConversation) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${currentConversation.title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}`;
    
    let content: string;
    let mimeType: string;
    let extension: string;
    
    if (format === 'json') {
      // Export as JSON
      content = JSON.stringify(currentConversation, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else {
      // Export as Markdown
      const modeLabel = currentConversation.mode === 'custom' 
        ? currentConversation.personality_name || 'Custom'
        : modeConfig[currentConversation.mode as keyof typeof modeConfig]?.label || currentConversation.mode;
      
      content = `# ${currentConversation.title}\n\n`;
      content += `**Mode:** ${modeLabel}\n`;
      content += `**Created:** ${new Date(currentConversation.created_at).toLocaleString()}\n`;
      content += `**Updated:** ${new Date(currentConversation.updated_at).toLocaleString()}\n`;
      content += `**Messages:** ${currentConversation.messages.length}\n\n`;
      content += `---\n\n`;
      
      currentConversation.messages.forEach((msg, idx) => {
        if (msg.role === 'system') return; // Skip system messages
        
        const role = msg.role === 'user' ? '👤 You' : '🤖 AI';
        const time = new Date(msg.timestamp).toLocaleString();
        
        content += `### ${role} · ${time}\n\n`;
        content += `${msg.content}\n\n`;
        
        // Add file attachments if any
        if (msg.attachments && msg.attachments.length > 0) {
          content += `**Attachments:**\n`;
          msg.attachments.forEach(file => {
            content += `- [${file.filename}](${file.url}) (${(file.size / 1024).toFixed(2)} KB)\n`;
          });
          content += `\n`;
        }
        
        content += `---\n\n`;
      });
      
      mimeType = 'text/markdown';
      extension = 'md';
    }
    
    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: '✨ Export Complete!',
      description: `Your conversation is ready as ${extension.toUpperCase()}. Keep those memories safe!`
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSwitchToRealAuth = async () => {
    console.log('[handleSwitchToRealAuth] User clicked switch button');
    
    // Show toast before clearing auth state
    toast({
      title: '🔐 Switching to Real Authentication',
      description: 'Enter your email to enable full SDK features (database, AI, Chroma)',
    });
    
    // Navigate immediately (while still authenticated)
    console.log('[handleSwitchToRealAuth] Navigating to /login');
    navigate('/login');
    
    // Clear auth state after navigation starts (small delay to ensure navigation completes)
    setTimeout(async () => {
      console.log('[handleSwitchToRealAuth] Calling switchToRealAuth after delay');
      await switchToRealAuth();
      console.log('[handleSwitchToRealAuth] Switch complete');
    }, 100);
  };

  const currentMode = currentConversation?.mode;
  const ModeIcon = currentMode ? modeConfig[currentMode].icon : Sparkles;

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-card border-r transform transition-transform duration-200 lg:relative lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {(['coding', 'hobby', 'task', 'roleplay'] as AIMode[]).map((mode) => {
                  const config = modeConfig[mode];
                  const Icon = config.icon;
                  return (
                    <Button
                      key={mode}
                      variant="outline"
                      className={cn(
                        'h-auto flex-col items-start p-3 gap-1',
                        currentConversation?.mode === mode && 'border-primary'
                      )}
                      onClick={() => handleCreateConversation(mode)}
                    >
                      <Icon className={cn('w-4 h-4', config.color)} />
                      <span className="text-xs font-medium">{config.label}</span>
                    </Button>
                  );
                })}
              </div>
              {/* Diary mode */}
              <Button
                variant="outline"
                className={cn(
                  'w-full h-auto flex items-center justify-start p-3 gap-3',
                  currentConversation?.mode === 'diary' && 'border-primary'
                )}
                onClick={() => handleCreateConversation('diary')}
              >
                <BookOpen className={cn('w-5 h-5', modeConfig.diary.color)} />
                <div className="text-left">
                  <div className="text-sm font-medium">{modeConfig.diary.label}</div>
                  <div className="text-xs text-muted-foreground">{modeConfig.diary.description}</div>
                </div>
              </Button>
              
              {/* Ripl(a)y Master Files Link */}
              <Button
                variant="outline"
                className="w-full h-auto flex items-center justify-start p-3 gap-3 border-2 border-violet-200 dark:border-violet-900 hover:border-violet-400 dark:hover:border-violet-700 bg-gradient-to-br from-violet-50/30 to-transparent"
                onClick={() => window.location.href = '/riplay-master'}
              >
                <Brain className="w-5 h-5 text-violet-500" />
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">Ripl(a)y Master Files</div>
                  <div className="text-xs text-muted-foreground">Manage master files, instructions & Grok integration 🌱</div>
                </div>
              </Button>
              
              {/* Bookshelf Link */}
              <Button
                variant="outline"
                className="w-full h-auto flex items-center justify-start p-3 gap-3"
                onClick={() => window.location.href = '/bookshelf'}
              >
                <BookMarked className="w-5 h-5 text-amber-500" />
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">Bookshelf</div>
                  <div className="text-xs text-muted-foreground">Files, PDFs & Nephilim books 📚</div>
                </div>
              </Button>

              {/* API Settings Link */}
              <Button
                variant="outline"
                className="w-full h-auto flex items-center justify-start p-3 gap-3"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-5 h-5 text-purple-500" />
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">API Settings</div>
                  <div className="text-xs text-muted-foreground">Configure ElevenLabs & Replicate ⚙️</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b space-y-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-sm transition-colors"
                >
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {/* Mode Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full h-9 justify-start gap-2 text-sm">
                  <Filter className="w-4 h-4" />
                  <span>
                    {filterMode === 'all' ? 'All Modes' : modeConfig[filterMode as keyof typeof modeConfig]?.label || 'Custom'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => setFilterMode('all')}>
                  <Sparkles className="w-4 h-4 mr-2 text-muted-foreground" />
                  All Modes
                </DropdownMenuItem>
                {Object.entries(modeConfig).map(([mode, config]) => {
                  const Icon = config.icon;
                  return (
                    <DropdownMenuItem key={mode} onClick={() => setFilterMode(mode as AIMode)}>
                      <Icon className={cn('w-4 h-4 mr-2', config.color)} />
                      {config.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem onClick={() => setFilterMode('custom')}>
                  <Users className="w-4 h-4 mr-2 text-teal-500" />
                  Custom Personalities
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Results count */}
            {(searchQuery || filterMode !== 'all') && (
              <div className="text-xs text-muted-foreground text-center">
                {filteredConversations.length} of {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Suggested Next Steps */}
          {currentConversation && currentConversation.messages.length > 0 && (
            <div className="p-4 border-b space-y-2 flex-shrink-0 bg-violet-50/30 dark:bg-violet-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Suggested Next Steps</span>
              </div>
              <div className="space-y-1">
                {currentMode === 'diary' || currentMode === 'riplay' ? (
                  <>
                    <button
                      onClick={() => {
                        const lastMessage = currentConversation.messages[currentConversation.messages.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                          setMessage("Let's explore that deeper...");
                          setTimeout(() => document.querySelector('textarea')?.focus(), 100);
                        }
                      }}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      💭 Continue this reflection
                    </button>
                    <button
                      onClick={() => window.location.href = '/riplay-master'}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      📚 Update master files
                    </button>
                  </>
                ) : currentMode === 'coding' ? (
                  <>
                    <button
                      onClick={() => {
                        setMessage("Can you explain how this works?");
                        setTimeout(() => document.querySelector('textarea')?.focus(), 100);
                      }}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      🔍 Ask for explanation
                    </button>
                    <button
                      onClick={() => {
                        setMessage("Can you help me debug this?");
                        setTimeout(() => document.querySelector('textarea')?.focus(), 100);
                      }}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      🐛 Debug together
                    </button>
                  </>
                ) : currentMode === 'hobby' ? (
                  <>
                    <button
                      onClick={() => {
                        setMessage("Tell me more about this topic");
                        setTimeout(() => document.querySelector('textarea')?.focus(), 100);
                      }}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      🎨 Explore deeper
                    </button>
                    <button
                      onClick={() => {
                        setMessage("What should I try next?");
                        setTimeout(() => document.querySelector('textarea')?.focus(), 100);
                      }}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      ✨ Get suggestions
                    </button>
                  </>
                ) : currentMode === 'task' ? (
                  <>
                    <button
                      onClick={() => {
                        setMessage("Break this down into steps");
                        setTimeout(() => document.querySelector('textarea')?.focus(), 100);
                      }}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      📝 Create action plan
                    </button>
                    <button
                      onClick={() => {
                        setMessage("What's the priority here?");
                        setTimeout(() => document.querySelector('textarea')?.focus(), 100);
                      }}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      ⚡ Prioritize tasks
                    </button>
                  </>
                ) : currentMode === 'roleplay' ? (
                  <>
                    <button
                      onClick={() => {
                        setMessage("Let's continue the story");
                        setTimeout(() => document.querySelector('textarea')?.focus(), 100);
                      }}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      🎭 Continue story
                    </button>
                    <button
                      onClick={() => {
                        setMessage("What happens next?");
                        setTimeout(() => document.querySelector('textarea')?.focus(), 100);
                      }}
                      className="w-full text-left p-2 text-xs rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-700 dark:text-violet-300"
                    >
                      🌟 Explore possibilities
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Conversations List */}
          <ScrollArea className="flex-1 p-2 min-h-0">
            <div className="space-y-1">
              {isLoading ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <div className="animate-gentle-pulse">✨ Loading your conversations...</div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-4xl mb-3">💫</div>
                  <p className="text-sm font-medium text-foreground mb-1">Your journey begins here</p>
                  <p className="text-xs text-muted-foreground">Choose a mode above and let's create something amazing together</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground mb-1">Nothing here... yet!</p>
                  <p className="text-xs text-muted-foreground">Try adjusting your search or exploring a different mode</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isCustom = conv.mode === 'custom';
                  const config = isCustom ? { 
                    icon: Users, 
                    color: 'text-teal-500', 
                    bg: 'bg-teal-500/10' 
                  } : ((modeConfig as any)[conv.mode] || modeConfig.coding);
                  const Icon = config.icon;
                  return (
                    <button
                      key={conv._id}
                      onClick={() => {
                        selectConversation(conv._id!);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full text-left p-3 rounded-lg hover:bg-accent transition-colors group',
                        currentConversation?._id === conv._id && 'bg-accent'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn('mt-0.5 p-1.5 rounded-md', config.bg)}>
                          <Icon className={cn('w-3.5 h-3.5', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">{conv.title}</p>
                            {/* Show continuation badge for diary modes with multiple exchanges */}
                            {(conv.mode === 'diary' || conv.mode === 'riplay') && conv.messages.length > 3 && (
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0 animate-in fade-in">
                                ↔
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {conv.messages.length} messages
                            {(conv.mode === 'diary' || conv.mode === 'riplay') && conv.messages.length > 3 && (
                              <span className="text-primary ml-1">· continued</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectConversation(conv._id!);
                                }}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                selectConversation(conv._id!);
                                setTimeout(() => handleExportConversation('markdown'), 100);
                              }}>
                                <File className="w-3.5 h-3.5 mr-2" />
                                Export as MD
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                selectConversation(conv._id!);
                                setTimeout(() => handleExportConversation('json'), 100);
                              }}>
                                <File className="w-3.5 h-3.5 mr-2" />
                                Export as JSON
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleDeleteConversation(conv._id!, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* User Footer */}
          <div className="p-4 border-t space-y-2 flex-shrink-0">
            {isDevMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-orange-500 text-orange-500 hover:bg-orange-500/10"
                  onClick={handleSwitchToRealAuth}
                >
                  🔐 Switch to Real Auth
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-red-500 text-red-500 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  🚪 Exit Dev & Test as Player
                </Button>
              </>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium truncate max-w-[150px]">{user?.name || user?.email}</p>
                  {isDevMode && (
                    <span className="text-[10px] font-mono text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                      🔓 DEV
                    </span>
                  )}
                </div>
              </div>
              
              {/* Log Off Menu (not in dev mode) */}
              {!isDevMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Off
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-14 border-b px-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          {currentConversation && (
            <>
              <div className={cn('p-2 rounded-lg', modeConfig[currentMode!].bg)}>
                <ModeIcon className={cn('w-4 h-4', modeConfig[currentMode!].color)} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold truncate">{currentConversation.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {modeConfig[currentMode!].description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Download className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExportConversation('markdown')}>
                    <File className="w-4 h-4 mr-2" />
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportConversation('json')}>
                    <File className="w-4 h-4 mr-2" />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Chat Area */}
        <ScrollArea ref={chatScrollRef} className="flex-1 p-4">
          {!currentConversation ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-12">
              {/* Chroma Portal */}
              <ChromaPortal />
              
              {/* Divider */}
              <div className="w-full max-w-md">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground font-mono">
                      OR START A CONVERSATION
                    </span>
                  </div>
                </div>
              </div>
              
              {/* AI Mode Selection */}
              <div className="w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-2 text-warm-gradient">Create Something Amazing</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Pick a mode below and let's get started. I'm here to help, support, and celebrate with you! 💫
                </p>
                <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['coding', 'hobby', 'task', 'roleplay'] as AIMode[]).map((mode) => {
                    const config = modeConfig[mode];
                    const Icon = config.icon;
                    return (
                      <Card
                        key={mode}
                        className="p-4 cursor-pointer hover-lift warm-glow transition-all border-2 hover:border-primary/30"
                        onClick={() => handleCreateConversation(mode)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('p-2 rounded-lg', config.bg)}>
                            <Icon className={cn('w-5 h-5', config.color)} />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold mb-1">{config.label}</h3>
                            <p className="text-sm text-muted-foreground">{config.description}</p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                {/* Featured Modes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card
                    className="p-4 cursor-pointer hover-lift warm-glow transition-all border-2 border-emerald-200 dark:border-emerald-900 hover:border-emerald-400 dark:hover:border-emerald-700"
                    onClick={() => handleCreateConversation('diary')}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('p-2.5 rounded-lg', modeConfig.diary.bg)}>
                        <BookOpen className={cn('w-5 h-5', modeConfig.diary.color)} />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold mb-1">{modeConfig.diary.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          {modeConfig.diary.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card
                    className="p-4 cursor-pointer hover-lift warm-glow transition-all border-2 border-violet-200 dark:border-violet-900 hover:border-violet-400 dark:hover:border-violet-700 bg-gradient-to-br from-violet-50/30 to-transparent"
                    onClick={() => window.location.href = '/riplay-master'}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-violet-500/10">
                        <Brain className="w-5 h-5 text-violet-500" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold mb-1">Ripl(a)y Master Files</h3>
                        <p className="text-xs text-muted-foreground">
                          Manage master files, instructions & Grok integration 🌱
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {currentConversation.messages.map((msg, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar className="w-8 h-8 shrink-0 border-2 border-primary/10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-empathy text-primary-foreground">
                          <Sparkles className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 max-w-[80%] transition-all',
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-md'
                          : 'bg-muted/70 hover:bg-muted transition-colors'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      
                      {/* File Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((file, fileIdx) => (
                            <a
                              key={fileIdx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-2 text-xs p-2 rounded-lg transition-colors",
                                msg.role === 'user' 
                                  ? "bg-white/10 hover:bg-white/20" 
                                  : "bg-primary/10 hover:bg-primary/20"
                              )}
                            >
                              <File className="w-3 h-3" />
                              <span className="flex-1 truncate">{file.filename}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {user?.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  
                  {/* Web Search Results */}
                  {msg.searchResults && msg.searchResults.length > 0 && (
                    <div className={cn(
                      'ml-11 mr-11 space-y-2',
                      msg.role === 'user' ? 'mr-0' : 'ml-0'
                    )}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Search className="w-3 h-3" />
                        <span>Web search results used</span>
                      </div>
                      <div className="space-y-1">
                        {msg.searchResults.map((result, resultIdx) => (
                          <a
                            key={resultIdx}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-start gap-2">
                              <Globe className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-xs line-clamp-1">{result.title}</div>
                                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                  {result.description}
                                </div>
                              </div>
                              <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming Message */}
              {isStreaming && streamingContent && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Avatar className="w-8 h-8 shrink-0 border-2 border-primary/10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-empathy text-primary-foreground">
                      <Sparkles className="w-4 h-4 animate-gentle-pulse" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl px-4 py-3 bg-muted/70 max-w-[80%]">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {streamingContent}
                      <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse">▋</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        {currentConversation && (
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto space-y-3">
              {/* Web Search Toggle */}
              <div className="flex items-center justify-between px-1">
                <Button
                  type="button"
                  variant={webSearchEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleWebSearch}
                  className={cn(
                    "gap-2 transition-all",
                    webSearchEnabled && "shadow-md bg-gradient-to-br from-secondary to-secondary/90"
                  )}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs">Web Search</span>
                  {webSearchEnabled && (
                    <span className="text-xs font-semibold bg-white/20 px-1.5 py-0.5 rounded animate-in fade-in">✓</span>
                  )}
                </Button>
                {webSearchEnabled && (
                  <p className="text-xs text-muted-foreground animate-in fade-in slide-in-from-left-2">
                    I'll search the web for fresh info! 🌍
                  </p>
                )}
              </div>
              
              {/* File Upload */}
              <FileUpload
                onFilesUploaded={setAttachedFiles}
                disabled={isStreaming}
              />
              
              {/* Message Input */}
              <div className="flex gap-2">
                <MicrophoneInput
                  onTranscript={(text) => setMessage(prev => prev ? `${prev} ${text}` : text)}
                  disabled={isStreaming}
                />
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your thoughts... I'm listening 💭"
                  disabled={isStreaming}
                  className="flex-1 border-2 focus-visible:ring-primary/50 transition-all"
                />
                <Button 
                  type="submit" 
                  disabled={isStreaming || (!message.trim() && attachedFiles.length === 0)}
                  className="hover-lift bg-gradient-to-br from-primary to-primary/90 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
