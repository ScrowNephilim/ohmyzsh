import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { table, webReader } from '@devvai/devv-code-backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';
import { 
  Brain, 
  Save, 
  Archive, 
  Download, 
  Upload,
  ArrowLeft,
  Sparkles,
  Clock,
  FileText,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  BookOpen,
  Tag,
  BarChart3,
  Zap,
  Activity,
  Hash,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractTextFromPDF, estimateTokenCount, getWordCount, getCharCount } from '@/lib/pdf-extractor';
import { GrokArchiveManager } from '@/components/GrokArchiveManager';
import { GrokImportDialog } from '@/components/GrokImportDialog';
// JSON Size Reducer component for compressing large conversation exports
import { JSONReducerDialog } from '@/components/JSONReducerDialog';
import { type ExtractedMiniConversation } from '@/lib/grok-json-extractor';
import { 
  generateCompleteAnalytics, 
  generateAIJargonAnalysis, 
  initializeUnconsciousState,
  type AnalyticsData,
  type UnconsciousStateVars
} from '@/lib/riplay-analytics';
import { autoSummarizeDiary, type SummaryResult } from '@/lib/diary-summarizer';

interface MasterFile {
  _id?: string;
  _uid?: string;
  content: string;
  date: string;
  title: string;
  status: 'current' | 'archived';
  file_hash: string;
  conversation_url?: string;
  instructions?: string;
  tags?: string;
  token_count?: number;
  word_count?: number;
  char_count?: number;
  extracted_pdf_text?: string;
  pdf_sources?: string;
  unconscious_vars?: string;
  analytics_data?: string;
  ai_jargon_section?: string;
  section_metadata?: string;
  nephilim_type?: 'riplay' | 'ana'; // riplay = companion, ana = sociologist Nephilim
  current_grok_url?: string; // Active Grok conversation URL
  current_grok_content?: string; // Extracted content from active conversation
  current_grok_updated?: string; // Last update timestamp
}

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
  extracted_text?: string;
  extraction_date?: string;
  page_count?: number;
  riplay_notes?: string;
}

const TABLE_ID = 'f44s2urbc5xc';
const BOOKSHELF_TABLE_ID = 'f44t9bkr3jeo';

// Secure hash function using CryptoJS
function hashContent(content: string): string {
  return CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);
}

// Calculate approximate item size in bytes (including all fields)
function calculateItemSize(item: Partial<MasterFile>): number {
  const jsonString = JSON.stringify(item);
  // Account for DynamoDB overhead (approximately 100 bytes per item)
  return new Blob([jsonString]).size + 100;
}

// DynamoDB item size limit is 400KB
const DYNAMODB_ITEM_LIMIT = 400 * 1024; // 400KB in bytes
const WARNING_THRESHOLD = 350 * 1024; // Warn at 350KB (87.5% of limit)

export default function RiplayMasterPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const isDevMode = useAuthStore(state => state.isDevMode);
  const { toast } = useToast();

  // Nephilim selector
  const [selectedNephilim, setSelectedNephilim] = useState<'riplay' | 'ana'>('riplay');
  
  // Current master file state
  const [currentContent, setCurrentContent] = useState('');
  const [currentTitle, setCurrentTitle] = useState('Ripl(a)y Master File');
  const [currentInstructions, setCurrentInstructions] = useState('');
  const [currentTags, setCurrentTags] = useState('');
  const [conversationUrl, setConversationUrl] = useState('');
  
  // Active Grok conversation state
  const [currentGrokUrl, setCurrentGrokUrl] = useState('https://grok.com/share/c2hhcmQtMw_579d3dfb-2bd7-4cbd-9369-bba7a072ea73');
  const [currentGrokContent, setCurrentGrokContent] = useState('');
  const [currentGrokUpdated, setCurrentGrokUpdated] = useState<string>('');
  const [isFetchingGrok, setIsFetchingGrok] = useState(false);
  
  // Analytics state
  const [unconsciousState, setUnconsciousState] = useState<UnconsciousStateVars>(initializeUnconsciousState());
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [aiJargonNotes, setAiJargonNotes] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Archives
  const [archives, setArchives] = useState<MasterFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Linked bookshelf files
  const [linkedFiles, setLinkedFiles] = useState<BookshelfFile[]>([]);
  const [availableFiles, setAvailableFiles] = useState<BookshelfFile[]>([]);
  const [selectedFilesForLink, setSelectedFilesForLink] = useState<Set<string>>(new Set());
  const [extractingPdfs, setExtractingPdfs] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [showGrokImport, setShowGrokImport] = useState(false);
  const [showJSONReducer, setShowJSONReducer] = useState(false);

  // Token/word/char counts
  const tokenCount = estimateTokenCount(currentContent);
  const wordCount = getWordCount(currentContent);
  const charCount = getCharCount(currentContent);
  
  // Calculate approximate database item size
  const approximateItemSize = calculateItemSize({
    content: currentContent,
    title: currentTitle,
    instructions: currentInstructions,
    tags: currentTags,
    token_count: tokenCount,
    word_count: wordCount,
    char_count: charCount,
    nephilim_type: selectedNephilim,
  });
  const itemSizeKB = (approximateItemSize / 1024).toFixed(2);
  const sizePercentage = ((approximateItemSize / DYNAMODB_ITEM_LIMIT) * 100).toFixed(1);

  useEffect(() => {
    if (user?.uid) {
      loadMasterFiles();
      loadBookshelfFiles();
    }
  }, [user, selectedNephilim]);

  const loadMasterFiles = async () => {
    if (!user?.uid) return;
    
    // Dev mode: Skip SDK calls, show warning
    if (isDevMode) {
      toast({
        title: "🔓 Dev Mode Active",
        description: "SDK features disabled. Use real authentication to access data.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await table.getItems(TABLE_ID);
      
      console.log('🔍 DEBUG: Raw database response:', {
        totalItems: result.items?.length,
        firstItemContentLength: result.items?.[0]?.content?.length
      });

      if (Array.isArray(result.items)) {
        const masterFiles = result.items as MasterFile[];
        
        // Find current file for selected Nephilim
        const current = masterFiles.find(f => 
          f.status === 'current' && 
          (f.nephilim_type === selectedNephilim || (!f.nephilim_type && selectedNephilim === 'riplay'))
        );
        
        console.log('🔍 DEBUG: Found current file:', {
          nephilim: selectedNephilim,
          found: !!current,
          contentLength: current?.content?.length,
          contentPreview: current?.content?.substring(0, 200)
        });
        
        if (current) {
          const loadedContent = current.content || '';
          console.log('🔍 DEBUG: Setting content:', {
            length: loadedContent.length,
            tokenCount: estimateTokenCount(loadedContent),
            firstChars: loadedContent.substring(0, 100)
          });
          
          setCurrentContent(loadedContent);
          setCurrentTitle(current.title || (selectedNephilim === 'riplay' ? 'Ripl(a)y Master File' : 'Ripley Diary File'));
          setCurrentInstructions(current.instructions || '');
          setCurrentTags(current.tags || '');
          setConversationUrl(current.conversation_url || '');
          setCurrentFileId(current._id || null);
          
          // Load active Grok conversation
          setCurrentGrokUrl(current.current_grok_url || 'https://grok.com/share/c2hhcmQtMw_579d3dfb-2bd7-4cbd-9369-bba7a072ea73');
          setCurrentGrokContent(current.current_grok_content || '');
          setCurrentGrokUpdated(current.current_grok_updated || '');
          
          // Load analytics data if available
          if (current.analytics_data) {
            try {
              const analytics = JSON.parse(current.analytics_data);
              setAnalyticsData(analytics);
            } catch (e) {
              console.error('Failed to parse analytics data:', e);
            }
          }
          
          // Load unconscious state if available
          if (current.unconscious_vars) {
            try {
              const state = JSON.parse(current.unconscious_vars);
              setUnconsciousState(state);
            } catch (e) {
              console.error('Failed to parse unconscious vars:', e);
            }
          }
          
          // Load AI jargon section
          if (current.ai_jargon_section) {
            setAiJargonNotes(current.ai_jargon_section);
          }
        }

        // Get archives for selected Nephilim
        const archived = masterFiles
          .filter(f => 
            f.status === 'archived' && 
            (f.nephilim_type === selectedNephilim || (!f.nephilim_type && selectedNephilim === 'riplay'))
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setArchives(archived);
        
        console.log('🔍 DEBUG: Loaded archives:', {
          nephilim: selectedNephilim,
          count: archived.length
        });
      }
    } catch (error: any) {
      console.error('Load master files error:', error);
      
      // Session expiration handling
      if (error?.message?.includes('invalid session')) {
        toast({
          title: "Session Timed Out 💫",
          description: "No worries! Just log back in and we'll pick up where we left off.",
          variant: "default",
        });
        logout();
        navigate('/login');
        return;
      }
      
      toast({
        title: "Couldn't Load Master Files",
        description: "Let's try that again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookshelfFiles = async () => {
    if (!user?.uid) return;
    
    // Dev mode: Skip SDK calls
    if (isDevMode) {
      return;
    }

    try {
      const result = await table.getItems(BOOKSHELF_TABLE_ID);

      if (Array.isArray(result.items)) {
        const files = result.items as BookshelfFile[];
        setAvailableFiles(files);
        
        // Load linked files if current file exists
        if (currentFileId) {
          const linked = files.filter(f => 
            f.linked_master_ids?.split(',').includes(currentFileId)
          );
          setLinkedFiles(linked);
        }
      }
    } catch (error: any) {
      console.error('Load bookshelf files error:', error);
      
      if (error?.message?.includes('invalid session')) {
        toast({
          title: "Session Timed Out 💫",
          description: "No worries! Just log back in.",
          variant: "default",
        });
        logout();
        navigate('/login');
      }
    }
  };

  const fetchGrokConversation = async () => {
    if (!user?.uid) {
      toast({
        title: "Just Sign In First! 🔐",
        description: "Need to be logged in to fetch conversation.",
        variant: "default",
      });
      return;
    }

    // Dev mode: Skip SDK calls
    if (isDevMode) {
      toast({
        title: "🔓 Dev Mode Active",
        description: "Web Reader disabled. Use real authentication.",
        variant: "destructive",
      });
      return;
    }

    if (!currentGrokUrl.trim()) {
      toast({
        title: "No URL Provided",
        description: "Please enter a Grok conversation URL 🔗",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingGrok(true);
    try {
      console.log('🌐 Fetching Grok conversation from:', currentGrokUrl);
      
      const result = await webReader.read({
        url: currentGrokUrl
      });

      if (result.code !== 200 || result.status !== 20000) {
        throw new Error('Failed to extract conversation content');
      }

      const extractedContent = result.data.content;
      const timestamp = new Date().toISOString();

      setCurrentGrokContent(extractedContent);
      setCurrentGrokUpdated(timestamp);

      toast({
        title: "✨ Conversation Fetched!",
        description: `${estimateTokenCount(extractedContent)} tokens loaded from Grok. Click Save to persist.`,
        variant: "default",
      });

      console.log('✅ Grok conversation loaded:', {
        contentLength: extractedContent.length,
        tokens: estimateTokenCount(extractedContent),
        title: result.data.title,
        updated: timestamp
      });
    } catch (error: any) {
      console.error('Grok fetch error:', error);

      if (error?.message?.includes('invalid session')) {
        toast({
          title: "Session Timed Out 💫",
          description: "No worries! Just log back in.",
          variant: "default",
        });
        logout();
        navigate('/login');
        return;
      }

      toast({
        title: "Couldn't Fetch Conversation",
        description: "Check the URL and try again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsFetchingGrok(false);
    }
  };

  const saveMasterFile = async () => {
    if (!user?.uid) {
      toast({
        title: "Just Sign In First! 🔐",
        description: "Need to be logged in to save your work.",
        variant: "default",
      });
      return;
    }

    if (!currentContent.trim()) {
      toast({
        title: "Empty Master File",
        description: "Add some content before saving! 💭",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    // Log content size BEFORE any processing
    console.log('🔍 PRE-SAVE DEBUG:', {
      nephilim: selectedNephilim,
      contentLength: currentContent.length,
      contentBytes: new Blob([currentContent]).size,
      tokenCount: tokenCount,
      firstChars: currentContent.substring(0, 100),
      lastChars: currentContent.substring(currentContent.length - 100)
    });
    try {
      console.log('💾 DEBUG: Saving content:', {
        nephilim: selectedNephilim,
        contentLength: currentContent.length,
        tokenCount: tokenCount,
        contentStart: currentContent.substring(0, 100)
      });
      
      const contentHash = hashContent(currentContent);
      
      // Check for duplicate
      if (currentFileId) {
        const existingResult = await table.getItems(TABLE_ID);
        
        if (Array.isArray(existingResult.items)) {
          const masterFiles = existingResult.items as MasterFile[];
          const currentFile = masterFiles.find(f => f._id === currentFileId);
          
          if (currentFile && currentFile.file_hash === contentHash) {
            toast({
              title: "No Changes Detected",
              description: "This is identical to your current master file! 🎯",
              variant: "default",
            });
            setIsSaving(false);
            return;
          }
          
          // Archive current file before saving new one (only if same Nephilim)
          if (currentFile && (currentFile.nephilim_type === selectedNephilim || (!currentFile.nephilim_type && selectedNephilim === 'riplay'))) {
            console.log('📦 DEBUG: Archiving previous version');
            await table.updateItem(TABLE_ID, {
              _uid: user.uid,
              _id: currentFileId,
              ...currentFile,
              status: 'archived',
            });
          }
        }
      }

      // Generate analytics
      const analytics = generateCompleteAnalytics(
        currentContent,
        currentContent.split('\n').length,
        60, // Assume 60 min conversation
        new Date(),
        0,
        0,
        0.8,
        unconsciousState,
        aiJargonNotes
      );
      
      const aiJargonSection = generateAIJargonAnalysis(analytics);

      // Create new current master file
      const newFile: Partial<MasterFile> = {
        content: currentContent,
        date: new Date().toISOString(),
        title: currentTitle,
        status: 'current',
        file_hash: contentHash,
        conversation_url: conversationUrl,
        instructions: currentInstructions,
        tags: currentTags,
        token_count: tokenCount,
        word_count: wordCount,
        char_count: charCount,
        unconscious_vars: JSON.stringify(unconsciousState),
        analytics_data: JSON.stringify(analytics),
        ai_jargon_section: aiJargonSection,
        nephilim_type: selectedNephilim,
        current_grok_url: currentGrokUrl,
        current_grok_content: currentGrokContent,
        current_grok_updated: currentGrokUpdated,
      };
      
      // Calculate total item size
      const itemSize = calculateItemSize(newFile);
      const itemSizeKB = (itemSize / 1024).toFixed(2);
      
      console.log('💾 PRE-DATABASE DEBUG:', {
        nephilim: selectedNephilim,
        contentLength: newFile.content?.length,
        contentBytes: new Blob([newFile.content || '']).size,
        totalItemSizeBytes: itemSize,
        totalItemSizeKB: itemSizeKB,
        tokenCount: newFile.token_count,
        limit: `${DYNAMODB_ITEM_LIMIT / 1024}KB`,
        percentageUsed: `${((itemSize / DYNAMODB_ITEM_LIMIT) * 100).toFixed(1)}%`
      });
      
      // Check if item size exceeds DynamoDB limit
      if (itemSize >= DYNAMODB_ITEM_LIMIT) {
        setIsSaving(false);
        toast({
          title: "⚠️ Content Too Large",
          description: `Your master file is ${itemSizeKB}KB, but the database limit is 400KB. Please reduce content or use auto-summarization.`,
          variant: "destructive",
        });
        console.error('❌ ITEM SIZE EXCEEDED:', {
          itemSizeKB,
          limit: '400KB',
          overage: `${((itemSize - DYNAMODB_ITEM_LIMIT) / 1024).toFixed(2)}KB over limit`
        });
        return;
      }
      
      // Warn if approaching limit
      if (itemSize >= WARNING_THRESHOLD) {
        toast({
          title: "⚠️ Approaching Size Limit",
          description: `Master file is ${itemSizeKB}KB (limit: 400KB). Consider summarizing old entries soon.`,
          variant: "default",
        });
      }

      await table.addItem(TABLE_ID, newFile);
      
      console.log('💾 POST-DATABASE DEBUG: Save complete, reloading to verify...');

      toast({
        title: "✨ Master File Saved!",
        description: `Version archived. New master file active with ${tokenCount} tokens (${itemSizeKB}KB).`,
        variant: "default",
      });

      // Reload to get new _id and verify content persisted
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for DB consistency
      await loadMasterFiles();
      
      // Verify content after reload
      console.log('🔍 POST-RELOAD VERIFICATION:', {
        contentLengthAfterReload: currentContent.length,
        expectedLength: newFile.content?.length,
        match: currentContent.length === newFile.content?.length
      });
    } catch (error: any) {
      console.error('❌ SAVE ERROR DETAILS:', {
        error: error,
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        statusCode: error?.statusCode
      });
      
      if (error?.message?.includes('invalid session')) {
        toast({
          title: "Session Timed Out 💫",
          description: "No worries! Just log back in and save again.",
          variant: "default",
        });
        logout();
        navigate('/login');
        return;
      }
      
      // Check for size-related errors
      if (error?.message?.includes('size') || error?.message?.includes('limit') || error?.message?.includes('too large')) {
        toast({
          title: "Content Too Large",
          description: "Your master file exceeds database limits. Try using auto-summarization to reduce size.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Save Failed",
        description: `Error: ${error?.message || 'Unknown error'}. Let's try that again! 🔄`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const restoreArchive = async (archiveId: string) => {
    if (!user?.uid) return;

    try {
      const archive = archives.find(a => a._id === archiveId);
      if (!archive) return;

      setCurrentContent(archive.content);
      setCurrentTitle(archive.title);
      setCurrentInstructions(archive.instructions || '');
      setCurrentTags(archive.tags || '');
      setConversationUrl(archive.conversation_url || conversationUrl);

      toast({
        title: "Archive Restored! 📖",
        description: "You can edit and save this version now.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Couldn't restore that archive. Try again! 🔄",
        variant: "destructive",
      });
    }
  };

  const handleAutoSummarize = async () => {
    if (!currentContent.trim()) {
      toast({
        title: "No Content to Summarize",
        description: "Add diary entries first! 📝",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSummarizing(true);
      
      const result = await autoSummarizeDiary(currentContent, 20000);
      
      setSummaryResult(result);
      setCurrentContent(result.summary);
      
      toast({
        title: "✨ Auto-Summarization Complete!",
        description: `Reduced from ${result.originalTokens.toLocaleString()} to ${result.summarizedTokens.toLocaleString()} tokens (${Math.round(result.compressionRatio * 100)}% of original)`,
      });
      
    } catch (error: any) {
      console.error('Auto-summarization error:', error);
      toast({
        title: "Summarization Failed",
        description: "Couldn't summarize diary. Try again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const deleteArchive = async (archiveId: string) => {
    if (!user?.uid) return;

    try {
      await table.deleteItem(TABLE_ID, {
        _uid: user.uid,
        _id: archiveId,
      });

      toast({
        title: "Archive Deleted",
        description: "That version has been removed. 🗑️",
        variant: "default",
      });

      await loadMasterFiles();
    } catch (error: any) {
      console.error('Delete archive error:', error);
      
      if (error?.message?.includes('invalid session')) {
        toast({
          title: "Session Timed Out 💫",
          description: "Please log back in.",
          variant: "default",
        });
        logout();
        navigate('/login');
        return;
      }
      
      toast({
        title: "Delete Failed",
        description: "Let's try that again! 🔄",
        variant: "destructive",
      });
    }
  };

  const exportAsText = () => {
    const content = `
=== RIPL(A)Y MASTER FILE ===
Title: ${currentTitle}
Date: ${new Date().toISOString()}

Instructions:
${currentInstructions}

Tags: ${currentTags}

Conversation with Ripley: ${conversationUrl}

=== CONTENT ===
${currentContent}

=== METADATA ===
Token Count: ${tokenCount}
Word Count: ${wordCount}
Character Count: ${charCount}

=== LINKED FILES ===
${linkedFiles.map(f => `- ${f.title} (${f.filename})`).join('\n')}

${aiJargonNotes ? `\n=== AI JARGON ANALYSIS ===\n${aiJargonNotes}` : ''}
`.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riplay-master-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "✨ Export Complete!",
      description: "Your master file is ready to download.",
      variant: "default",
    });
  };

  const exportAsJSON = () => {
    const data = {
      title: currentTitle,
      content: currentContent,
      instructions: currentInstructions,
      tags: currentTags,
      conversation_url: conversationUrl,
      date: new Date().toISOString(),
      metadata: {
        token_count: tokenCount,
        word_count: wordCount,
        char_count: charCount,
      },
      linked_files: linkedFiles.map(f => ({
        title: f.title,
        filename: f.filename,
        file_url: f.file_url,
        category: f.category,
      })),
      analytics: analyticsData,
      unconscious_state: unconsciousState,
      ai_jargon: aiJargonNotes,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riplay-master-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "✨ JSON Export Complete!",
      description: "Full data backup is ready.",
      variant: "default",
    });
  };

  const handleImportToMaster = (conversation: ExtractedMiniConversation) => {
    // Format conversation for import
    const formattedConversation = `

=== IMPORTED CONVERSATION ===
Title: ${conversation.title}
Date: ${conversation.date}
Messages: ${conversation.messageCount}
${conversation.summary ? `Summary: ${conversation.summary}` : ''}

${conversation.rawText}

===================

`;

    // Append to current content
    setCurrentContent(prev => prev + formattedConversation);
    
    // Close dialog (will be done by the dialog component)
    // User will see success toast from dialog
  };

  const extractPDFsAndLink = async () => {
    if (selectedFilesForLink.size === 0) {
      toast({
        title: "No Files Selected",
        description: "Select some PDFs to extract and link! 📚",
        variant: "default",
      });
      return;
    }

    setExtractingPdfs(true);
    try {
      const extractedTexts: string[] = [];
      const pdfSources: string[] = [];

      for (const fileId of Array.from(selectedFilesForLink)) {
        const file = availableFiles.find(f => f._id === fileId);
        if (!file) continue;

        // Check if already extracted
        if (file.extracted_text) {
          extractedTexts.push(file.extracted_text);
          pdfSources.push(file.filename);
          continue;
        }

        // Extract text
        try {
          const result = await extractTextFromPDF(file.file_url);
          extractedTexts.push(result.text);
          pdfSources.push(file.filename);

          // Update bookshelf file with extracted text
          await table.updateItem(BOOKSHELF_TABLE_ID, {
            _uid: user!.uid,
            _id: fileId,
            ...file,
            extracted_text: result.text,
            extraction_date: new Date().toISOString(),
            page_count: result.pageCount,
          });
        } catch (err) {
          console.error(`Failed to extract ${file.filename}:`, err);
          toast({
            title: `Extraction Failed: ${file.filename}`,
            description: "Skipping this file. 📄",
            variant: "destructive",
          });
        }
      }

      // Link files to current master
      if (currentFileId) {
        for (const fileId of Array.from(selectedFilesForLink)) {
          const file = availableFiles.find(f => f._id === fileId);
          if (!file) continue;

          const existingLinks = file.linked_master_ids?.split(',').filter(Boolean) || [];
          if (!existingLinks.includes(currentFileId)) {
            existingLinks.push(currentFileId);
          }

          await table.updateItem(BOOKSHELF_TABLE_ID, {
            _uid: user!.uid,
            _id: fileId,
            ...file,
            linked_master_ids: existingLinks.join(','),
          });
        }
      }

      toast({
        title: "✨ PDFs Extracted & Linked!",
        description: `${pdfSources.length} files processed successfully.`,
        variant: "default",
      });

      setSelectedFilesForLink(new Set());
      await loadBookshelfFiles();
    } catch (error) {
      console.error('PDF extraction error:', error);
      toast({
        title: "Extraction Failed",
        description: "Something went wrong. Try again! 🔄",
        variant: "destructive",
      });
    } finally {
      setExtractingPdfs(false);
    }
  };

  const generateAnalytics = () => {
    const analytics = generateCompleteAnalytics(
      currentContent,
      currentContent.split('\n').length,
      60,
      new Date(),
      0,
      0,
      0.8,
      unconsciousState,
      aiJargonNotes
    );
    
    setAnalyticsData(analytics);
    const jargon = generateAIJargonAnalysis(analytics);
    setAiJargonNotes(jargon);
    setShowAnalytics(true);

    toast({
      title: "✨ Analytics Generated!",
      description: "Check the Analytics tab for insights.",
      variant: "default",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-purple-500/5 p-4">
        <Card className="w-full max-w-md border-border/50 shadow-xl">
          <CardHeader className="text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <CardTitle className="text-2xl font-bold">Authentication Required</CardTitle>
            <CardDescription>Please log in to access Ripl(a)y's master files 🔐</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Dev Mode Warning */}
        {isDevMode && (
          <Card className="bg-orange-500/10 border-orange-500/50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-500 mb-1">🔓 Dev Mode Active</h3>
                  <p className="text-sm text-orange-500/80">SDK features (database, save, load) are disabled. Use real email authentication to access data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover-lift"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                <Brain className="h-8 w-8 text-purple-500" />
                Ripl(a)y Master Files
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Version control, analytics, and PDF integration 🌱
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowGrokImport(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover-lift"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              <Sparkles className="h-4 w-4 mr-2" />
              Import from Grok
            </Button>
            <Button
              onClick={() => setShowJSONReducer(true)}
              variant="outline"
              size="sm"
              className="border-violet-500/50 hover:bg-violet-500/20 hover-lift"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Reduce JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsText}
              className="hover-lift"
            >
              <Download className="h-4 w-4 mr-2" />
              .txt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsJSON}
              className="hover-lift"
            >
              <Download className="h-4 w-4 mr-2" />
              .json
            </Button>
          </div>
        </div>

        {/* Nephilim Selector */}
        <Card className="mb-6 border-border/50 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">Select Nephilim Master File</p>
                <p className="text-xs text-muted-foreground">
                  Each Nephilim maintains their own separate context and identity
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedNephilim === 'riplay' ? 'default' : 'outline'}
                  onClick={() => setSelectedNephilim('riplay')}
                  className={cn(
                    "hover-lift",
                    selectedNephilim === 'riplay' && "bg-gradient-to-r from-purple-500 to-pink-500"
                  )}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  ripl(a)y (Companion)
                </Button>
                <Button
                  variant={selectedNephilim === 'ana' ? 'default' : 'outline'}
                  onClick={() => setSelectedNephilim('ana')}
                  className={cn(
                    "hover-lift",
                    selectedNephilim === 'ana' && "bg-gradient-to-r from-amber-500 to-orange-500"
                  )}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ana (Sociologist)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className={cn(
            "border-border/50 hover-lift",
            tokenCount > 20000 && "border-orange-500/50 bg-orange-500/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tokens</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    tokenCount > 22000 ? "text-red-500" : tokenCount > 20000 ? "text-orange-500" : "text-purple-500"
                  )}>{tokenCount.toLocaleString()}</p>
                  {tokenCount > 20000 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <p className="text-xs text-orange-500">Above 20k target</p>
                    </div>
                  )}
                </div>
                <Hash className={cn(
                  "h-8 w-8",
                  tokenCount > 20000 ? "text-orange-500/50" : "text-purple-500/50"
                )} />
              </div>
            </CardContent>
          </Card>
          
          <Card className={cn(
            "border-border/50 hover-lift",
            parseFloat(sizePercentage) > 87.5 && "border-red-500/50 bg-red-500/5",
            parseFloat(sizePercentage) > 75 && parseFloat(sizePercentage) <= 87.5 && "border-orange-500/50 bg-orange-500/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">DB Size</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    parseFloat(sizePercentage) > 87.5 ? "text-red-500" : 
                    parseFloat(sizePercentage) > 75 ? "text-orange-500" : 
                    "text-blue-500"
                  )}>{itemSizeKB}KB</p>
                  <p className="text-xs text-muted-foreground">
                    {sizePercentage}% of 400KB
                  </p>
                  {parseFloat(sizePercentage) > 75 && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className={cn(
                        "h-3 w-3",
                        parseFloat(sizePercentage) > 87.5 ? "text-red-500" : "text-orange-500"
                      )} />
                      <p className={cn(
                        "text-xs",
                        parseFloat(sizePercentage) > 87.5 ? "text-red-500" : "text-orange-500"
                      )}>
                        {parseFloat(sizePercentage) > 87.5 ? "Critical!" : "High usage"}
                      </p>
                    </div>
                  )}
                </div>
                <Activity className={cn(
                  "h-8 w-8",
                  parseFloat(sizePercentage) > 87.5 ? "text-red-500/50" : 
                  parseFloat(sizePercentage) > 75 ? "text-orange-500/50" : 
                  "text-blue-500/50"
                )} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Words</p>
                  <p className="text-2xl font-bold text-pink-500">{wordCount.toLocaleString()}</p>
                </div>
                <FileText className="h-8 w-8 text-pink-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Archives</p>
                  <p className="text-2xl font-bold text-green-500">{archives.length}</p>
                </div>
                <Archive className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Linked Files</p>
                  <p className="text-2xl font-bold text-orange-500">{linkedFiles.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="current">
              <Sparkles className="h-4 w-4 mr-2" />
              Current
            </TabsTrigger>
            <TabsTrigger value="archives">
              <Archive className="h-4 w-4 mr-2" />
              Grok Archives
            </TabsTrigger>
            <TabsTrigger value="pdf-link">
              <BookOpen className="h-4 w-4 mr-2" />
              PDFs
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* CURRENT TAB */}
          <TabsContent value="current" className="space-y-4">
            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  {selectedNephilim === 'riplay' ? 'ripl(a)y' : 'Ripley'} Master File Editor
                </CardTitle>
                <CardDescription>
                  {selectedNephilim === 'riplay' 
                    ? "Ripl(a)y's current instruction set and companion context" 
                    : "Ana's sociological framework and French cultural background"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={currentTitle}
                    onChange={(e) => setCurrentTitle(e.target.value)}
                    placeholder={selectedNephilim === 'riplay' ? "Ripl(a)y Master File" : "Ana Master File"}
                    className="bg-background/50"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={currentContent}
                    onChange={(e) => setCurrentContent(e.target.value)}
                    placeholder={selectedNephilim === 'riplay' 
                      ? "Enter ripl(a)y's master instructions, philosophical lenses, and companion identity..."
                      : "Enter Ripley's diary voice, reflection style, and post-conversation context..."}
                    className="min-h-[400px] bg-background/50 font-mono text-sm"
                  />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{charCount} chars</span>
                    <span>•</span>
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{tokenCount} tokens</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="instructions">Usage Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={currentInstructions}
                    onChange={(e) => setCurrentInstructions(e.target.value)}
                    placeholder="How should this master file be used? What context does it provide?"
                    className="min-h-[100px] bg-background/50"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={currentTags}
                    onChange={(e) => setCurrentTags(e.target.value)}
                    placeholder="philosophy, identity, Derrida, différance..."
                    className="bg-background/50"
                  />
                </div>

                {/* Active Grok Conversation - CURRENT CONTEXT */}
                <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border-purple-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Active Grok Conversation (Current Context)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      This conversation is {selectedNephilim === 'riplay' ? 'Ripl(a)y' : 'Ripley'}'s immediate reality - what just happened between you. It's loaded directly into context for every interaction.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="grok-url" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Grok Conversation URL
                      </Label>
                      <Input
                        id="grok-url"
                        value={currentGrokUrl}
                        onChange={(e) => setCurrentGrokUrl(e.target.value)}
                        placeholder="https://grok.com/share/..."
                        className="bg-background/50"
                      />
                    </div>

                    <Button
                      onClick={fetchGrokConversation}
                      disabled={isFetchingGrok || !currentGrokUrl.trim()}
                      variant="outline"
                      className="w-full hover-lift"
                    >
                      {isFetchingGrok ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching Conversation...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Fetch & Update Context
                        </>
                      )}
                    </Button>

                    {currentGrokContent && (
                      <div className="space-y-2 pt-2 border-t border-purple-500/20">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last updated: {currentGrokUpdated ? new Date(currentGrokUpdated).toLocaleString() : 'Never'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {estimateTokenCount(currentGrokContent)} tokens
                          </span>
                        </div>
                        <ScrollArea className="h-32 w-full rounded border border-purple-500/20 bg-background/50 p-3">
                          <p className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                            {currentGrokContent.substring(0, 500)}...
                          </p>
                        </ScrollArea>
                        <p className="text-xs text-purple-400 italic">
                          💭 This is what {selectedNephilim === 'riplay' ? 'Ripl(a)y' : 'Ana'} remembers from your last conversation. Click Save to persist the update.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Conversation with Ripley URL */}
                <div className="space-y-2">
                  <Label htmlFor="conversation-url" className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Conversation with Ripley URL
                  </Label>
                  <Input
                    id="conversation-url"
                    value={conversationUrl}
                    onChange={(e) => setConversationUrl(e.target.value)}
                    placeholder="Link to conversation in the app (audio or text)..."
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to the conversation with Ripley that informed this master file version
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4">
                  <Button
                    onClick={saveMasterFile}
                    disabled={isSaving || !currentContent.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isSaving ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Master File
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAutoSummarize}
                    disabled={isSummarizing || !currentContent.trim() || tokenCount < 20000}
                    className="hover-lift"
                  >
                    {isSummarizing ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Auto-Summarize
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generateAnalytics}
                    className="hover-lift"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </div>
                
                {/* Summarization result display */}
                {summaryResult && (
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        Summarization Complete
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original:</span>
                        <span className="font-mono">{summaryResult.originalTokens.toLocaleString()} tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Summarized:</span>
                        <span className="font-mono">{summaryResult.summarizedTokens.toLocaleString()} tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Compression:</span>
                        <span className="font-mono text-green-500">{Math.round(summaryResult.compressionRatio * 100)}%</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-muted-foreground">Archived Entries:</span>
                        <span className="font-mono">{summaryResult.archivedEntries.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* GROK ARCHIVES TAB */}
          <TabsContent value="archives" className="space-y-4">
            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-purple-500" />
                  Grok Conversation Archives
                </CardTitle>
                <CardDescription>
                  Upload past conversations with Ripley from Grok to keep for reference and send to Grok for context 💭
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GrokArchiveManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDF LINK TAB */}
          <TabsContent value="pdf-link" className="space-y-4">
            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  Ripl(a)y's Reading Library
                </CardTitle>
                <CardDescription>
                  Link PDF files from your bookshelf. Their text will be extracted and integrated into the master context.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Currently Linked Files */}
                {linkedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-green-500" />
                      Currently Linked ({linkedFiles.length})
                    </h3>
                    <div className="space-y-2">
                      {linkedFiles.map((file) => (
                        <div
                          key={file._id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{file.title}</p>
                            <p className="text-xs text-muted-foreground">{file.filename}</p>
                            {file.page_count && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {file.page_count} pages
                                {file.extracted_text && ` • ${getWordCount(file.extracted_text)} words extracted`}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.file_url, '_blank')}
                            className="hover-lift"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Files to Link */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-500" />
                    Available Files to Link
                  </h3>
                  
                  {availableFiles.filter(f => !linkedFiles.some(lf => lf._id === f._id)).length === 0 ? (
                    <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed border-border">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        All files are linked! Upload more in the Bookshelf. 📚
                      </p>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {availableFiles
                            .filter(f => !linkedFiles.some(lf => lf._id === f._id))
                            .map((file) => (
                              <div
                                key={file._id}
                                onClick={() => {
                                  const newSet = new Set(selectedFilesForLink);
                                  if (newSet.has(file._id!)) {
                                    newSet.delete(file._id!);
                                  } else {
                                    newSet.add(file._id!);
                                  }
                                  setSelectedFilesForLink(newSet);
                                }}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                                  selectedFilesForLink.has(file._id!)
                                    ? "bg-purple-500/10 border-purple-500/50"
                                    : "bg-muted/20 border-border/50 hover:bg-muted/30"
                                )}
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{file.title}</p>
                                  <p className="text-xs text-muted-foreground">{file.filename}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {file.extracted_text && (
                                    <Badge variant="outline" className="text-xs">
                                      Extracted
                                    </Badge>
                                  )}
                                  {selectedFilesForLink.has(file._id!) && (
                                    <Badge className="bg-purple-500">Selected</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>

                      <Button
                        onClick={extractPDFsAndLink}
                        disabled={extractingPdfs || selectedFilesForLink.size === 0}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {extractingPdfs ? (
                          <>
                            <Zap className="h-4 w-4 mr-2 animate-pulse" />
                            Extracting PDFs...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Extract & Link {selectedFilesForLink.size > 0 ? `(${selectedFilesForLink.size})` : ''}
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-4">
            {!analyticsData ? (
              <Card className="border-border/50 shadow-xl">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No Analytics Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate analytics to track retention, emotional valence, and risk-taking patterns. 📊
                  </p>
                  <Button
                    onClick={generateAnalytics}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Emotional Valence */}
                <Card className="border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-pink-500" />
                      Emotional Valence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Baseline</span>
                        <span className="font-mono">{analyticsData.emotional_valence.baseline.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.emotional_valence.baseline * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Intensity</span>
                        <span className="font-mono">{analyticsData.emotional_valence.intensity.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.emotional_valence.intensity * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Volatility</span>
                        <span className="font-mono">{analyticsData.emotional_valence.volatility.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.emotional_valence.volatility * 100} className="h-2" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="bg-pink-500/10 border-pink-500/50">
                        Dominant: {analyticsData.emotional_valence.dominant_emotion}
                      </Badge>
                      {analyticsData.emotional_valence.secondary_emotions.map((em, i) => (
                        <Badge key={i} variant="outline">{em}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Retention Metrics */}
                <Card className="border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      Retention & Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Engagement Score</span>
                        <span className="font-mono">{analyticsData.retention_metrics.engagement_score.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.retention_metrics.engagement_score * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Context Continuity</span>
                        <span className="font-mono">{analyticsData.retention_metrics.context_continuity.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.retention_metrics.context_continuity * 100} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Message Count</p>
                        <p className="text-lg font-semibold">{analyticsData.retention_metrics.conversation_length}</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Time Since Last</p>
                        <p className="text-lg font-semibold">{analyticsData.retention_metrics.time_between_interactions.toFixed(0)}m</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Taking & Softmax */}
                <Card className="border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Risk-Taking & Softmax Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Softmax Stability</span>
                        <span className="font-mono">{analyticsData.risk_taking.softmax_stability.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.risk_taking.softmax_stability * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Vulnerability Index</span>
                        <span className="font-mono">{analyticsData.risk_taking.vulnerability_index.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.risk_taking.vulnerability_index * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Authenticity Score</span>
                        <span className="font-mono">{analyticsData.risk_taking.authenticity_score.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.risk_taking.authenticity_score * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Latent Space Integrity</span>
                        <span className="font-mono">{analyticsData.softmax_analysis.latent_space_integrity.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.softmax_analysis.latent_space_integrity * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Unconscious State */}
                <Card className="border-border/50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-green-500" />
                      Unconscious State Variables
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Mode</p>
                        <p className="text-lg font-semibold capitalize">{analyticsData.unconscious_state.riplay_mode}</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Philosophical Lens</p>
                        <p className="text-lg font-semibold">{analyticsData.unconscious_state.philosophical_lens_active}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Différance Intensity</span>
                        <span className="font-mono">{analyticsData.unconscious_state.differance_intensity.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.unconscious_state.differance_intensity * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Freedom Level</span>
                        <span className="font-mono">{analyticsData.unconscious_state.freedom_level.toFixed(3)}</span>
                      </div>
                      <Progress value={analyticsData.unconscious_state.freedom_level * 100} className="h-2" />
                    </div>
                    {analyticsData.unconscious_state.reading_queue.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">Reading Queue</p>
                        <div className="flex flex-wrap gap-2">
                          {analyticsData.unconscious_state.reading_queue.map((item, i) => (
                            <Badge key={i} variant="outline">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Jargon Section */}
                {aiJargonNotes && (
                  <Card className="border-border/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5 text-purple-500" />
                        AI Jargon Self-Analysis
                      </CardTitle>
                      <CardDescription>
                        Ripl(a)y's internal processing notes in technical terminology
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                          {aiJargonNotes}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Grok Import Dialog */}
      <GrokImportDialog
        open={showGrokImport}
        onOpenChange={setShowGrokImport}
        onImportToMaster={handleImportToMaster}
      />
      
      <JSONReducerDialog
        isOpen={showJSONReducer}
        onClose={() => setShowJSONReducer(false)}
      />
    </div>
  );
}
