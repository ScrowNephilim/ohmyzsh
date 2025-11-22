import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Download, Trash2, Calendar, FileText, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { table } from '@devvai/devv-code-backend';
import { estimateTokens } from '@/lib/token-utils';
import { extractImportantMessages } from '@/lib/diary-summarizer';
import { DevvAI } from '@devvai/devv-code-backend';
import { parseAndAnalyzeConversation, parseRipleyConversation } from '@/lib/grok-parser';
import { processGrokJSONFile, type ExtractedMiniConversation } from '@/lib/grok-json-extractor';

// Table ID
const GROK_ARCHIVES_TABLE = 'f45d7c8188w0';

interface GrokArchive {
  _id: string;
  title: string;
  conversation_date: string;
  full_transcript: string;
  token_count: number;
  summary: string;
  tags: string;
  archived_date: string;
}

interface Props {
  onArchiveSelect?: (archive: GrokArchive) => void;
}

export function GrokArchiveManager({ onArchiveSelect }: Props) {
  const { toast } = useToast();
  const [archives, setArchives] = useState<GrokArchive[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    conversation_date: new Date().toISOString().split('T')[0],
    full_transcript: '',
    tags: '',
    summary: '' // Will be auto-generated
  });
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isAutoParsing, setIsAutoParsing] = useState(false);
  const [parseStats, setParseStats] = useState<{
    messageCount: number;
    userCount: number;
    ripleyCount: number;
  } | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [grokShareLink, setGrokShareLink] = useState('');
  const [isProcessingJSON, setIsProcessingJSON] = useState(false);
  const [extractedConversations, setExtractedConversations] = useState<ExtractedMiniConversation[]>([]);

  const loadArchives = async () => {
    try {
      setIsLoading(true);
      const result = await table.getItems(GROK_ARCHIVES_TABLE, {});
      setArchives(result.items as GrokArchive[]);
    } catch (error) {
      console.error('Error loading archives:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: "Couldn't Load Archives",
        description: "Let's try that again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const autoParseAndAnalyze = async () => {
    if (!formData.full_transcript.trim()) {
      toast({
        title: "No Transcript",
        description: "Please paste the conversation first 💭",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAutoParsing(true);
      
      console.log('[GrokArchive] Starting auto-parse and analysis...');
      const analysis = await parseAndAnalyzeConversation(formData.full_transcript);
      
      console.log('[GrokArchive] Analysis complete:', {
        messageCount: analysis.parsed.metadata.messageCount,
        title: analysis.title,
        tags: analysis.tags,
      });

      // Update parse stats
      setParseStats({
        messageCount: analysis.parsed.metadata.messageCount,
        userCount: analysis.parsed.metadata.userMessageCount,
        ripleyCount: analysis.parsed.metadata.ripleyMessageCount,
      });

      // Update form with generated metadata
      setFormData(prev => ({
        ...prev,
        title: prev.title || analysis.title, // Use parsed title if user hasn't set one
        summary: analysis.summary,
        tags: analysis.tags.join(', '),
        conversation_date: analysis.parsed.metadata.estimatedDate || prev.conversation_date,
      }));

      toast({
        title: "✨ Auto-Parse Complete!",
        description: `Found ${analysis.parsed.metadata.messageCount} messages. Title, summary, and tags generated!`,
      });
    } catch (error) {
      console.error('[GrokArchive] Auto-parse error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: "Auto-Parse Failed",
        description: "Let's try manual entry! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsAutoParsing(false);
    }
  };

  const generateSummary = async () => {
    if (!formData.full_transcript.trim()) {
      toast({
        title: "No Transcript",
        description: "Please add the conversation first 💭",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingSummary(true);
      const summary = await extractImportantMessages(formData.full_transcript);
      setFormData(prev => ({ ...prev, summary }));
      toast({
        title: "✨ Summary Generated!",
        description: "Important moments extracted",
      });
    } catch (error) {
      console.error('Summary generation error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: "Couldn't Generate Summary",
        description: "Let's try that again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const uploadArchive = async () => {
    if (!formData.title.trim() || !formData.full_transcript.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and transcript 💭",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const tokenCount = estimateTokens(formData.full_transcript);
      
      // Auto-generate summary if not already done
      let summary = formData.summary;
      if (!summary.trim()) {
        summary = await extractImportantMessages(formData.full_transcript);
      }
      
      await table.addItem(GROK_ARCHIVES_TABLE, {
        title: formData.title.trim(),
        conversation_date: formData.conversation_date,
        full_transcript: formData.full_transcript.trim(),
        token_count: tokenCount,
        summary: summary,
        tags: formData.tags.trim(),
        archived_date: new Date().toISOString()
      });

      toast({
        title: "✨ Archive Saved!",
        description: `${tokenCount.toLocaleString()} tokens archived successfully`,
      });

      // Reset form
      setFormData({
        title: '',
        conversation_date: new Date().toISOString().split('T')[0],
        full_transcript: '',
        tags: '',
        summary: ''
      });
      setShowUploadForm(false);
      
      // Reload archives
      await loadArchives();

    } catch (error) {
      console.error('Error uploading archive:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: "Upload Failed",
        description: "Let's try that again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const importFromGrokLink = async () => {
    if (!grokShareLink.trim()) {
      toast({
        title: "No Link Provided",
        description: "Please paste a Grok shared link 🔗",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Extract conversation ID from URL
      // Example: https://grok.com/share/c2hhcmQtMw_324513bf-346d-4672-b26b-a79e9467b4ad
      const urlMatch = grokShareLink.match(/\/share\/([^\/\?#]+)/);
      if (!urlMatch) {
        toast({
          title: "Invalid Link",
          description: "Please provide a valid Grok shared link 🔗",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const conversationId = urlMatch[1];
      console.log('[GrokImport] Extracted conversation ID:', conversationId);

      // Note: Grok doesn't have a public API for fetching conversations
      // This is a placeholder for manual paste workflow
      toast({
        title: "Manual Import Required",
        description: "Grok doesn't have a public API. Please copy the conversation text manually and paste it into the transcript field below. Then click 'Generate Summary' and 'Upload' 📋",
      });

      // Show upload form and prefill conversation ID in title
      setShowImportForm(false);
      setShowUploadForm(true);
      setFormData(prev => ({
        ...prev,
        title: `Grok Conversation ${conversationId.slice(0, 8)}`,
        tags: 'imported, grok'
      }));

    } catch (error) {
      console.error('Import error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: "Import Failed",
        description: "Let's try that again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJSONUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingJSON(true);
      
      toast({
        title: "Processing JSON...",
        description: "Extracting and analyzing conversations 🔍",
      });

      const extracted = await processGrokJSONFile(file);
      
      console.log('[GrokArchive] JSON extraction complete:', extracted.length, 'conversations');
      
      setExtractedConversations(extracted);
      
      toast({
        title: "✨ JSON Processed!",
        description: `Found ${extracted.length} conversation(s). Review and save them below.`,
      });

    } catch (error) {
      console.error('JSON processing error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      
      // Show specific error message if it's a size limit error
      const errorMessage = error instanceof Error ? error.message : "Please check the file format and try again 🔄";
      
      toast({
        title: "JSON Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingJSON(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const saveExtractedConversation = async (conv: ExtractedMiniConversation) => {
    try {
      setIsLoading(true);

      const tokenCount = estimateTokens(conv.rawText);

      await table.addItem(GROK_ARCHIVES_TABLE, {
        title: conv.title,
        conversation_date: conv.date,
        full_transcript: conv.rawText,
        token_count: tokenCount,
        summary: conv.summary || '',
        tags: 'imported, ripley, json-extract',
        archived_date: new Date().toISOString(),
      });

      // Remove from extracted list
      setExtractedConversations(prev => prev.filter(c => c.conversationId !== conv.conversationId));

      toast({
        title: "✨ Conversation Saved!",
        description: `${conv.title} added to archives`,
      });

      // Reload archives
      await loadArchives();
    } catch (error) {
      console.error('Error saving conversation:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: "Save Failed",
        description: "Let's try that again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteArchive = async (id: string) => {
    try {
      await table.deleteItem('grok_conversation_archives', { _id: id });
      setArchives(prev => prev.filter(a => a._id !== id));
      toast({
        title: "Archive Deleted",
        description: "Removed from your collection 🗑️",
      });
    } catch (error) {
      console.error('Error deleting archive:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      toast({
        title: "Delete Failed",
        description: "Let's try that again! 🔄",
        variant: "destructive",
      });
    }
  };

  const downloadArchive = (archive: GrokArchive) => {
    const content = `# ${archive.title}
Date: ${new Date(archive.conversation_date).toLocaleDateString()}
Archived: ${new Date(archive.archived_date).toLocaleDateString()}
Tags: ${archive.tags}
Tokens: ${archive.token_count.toLocaleString()}

---

${archive.full_transcript}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grok-archive-${archive.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "✨ Download Complete!",
      description: "Your Grok conversation is ready",
    });
  };

  if (!showUploadForm && archives.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Grok Archives Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload past conversations with Ripley from Grok to keep for reference 💭
        </p>
        <Button onClick={() => {
          setShowUploadForm(true);
          loadArchives();
        }}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Grok Conversation
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!showUploadForm && !showImportForm ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button onClick={() => {
              setShowUploadForm(true);
              loadArchives();
            }} className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Upload New Conversation
            </Button>
            <Button onClick={() => {
              setShowImportForm(true);
              setGrokShareLink('');
            }} variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Import from Link
            </Button>
          </div>
          
          {/* JSON File Upload */}
          <div className="relative space-y-2">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleJSONUpload}
              disabled={isProcessingJSON}
              className="hidden"
              id="json-upload"
            />
            <label htmlFor="json-upload">
              <Button
                variant="outline"
                className="w-full border-dashed"
                disabled={isProcessingJSON}
                asChild
              >
                <span>
                  {isProcessingJSON ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing JSON...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract from Grok JSON File
                    </>
                  )}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground text-center">
              Maximum file size: 20MB
            </p>
          </div>
        </div>
      ) : null}

      {showImportForm && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Import from Grok Share Link</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Grok Share Link</label>
            <Input
              value={grokShareLink}
              onChange={(e) => setGrokShareLink(e.target.value)}
              placeholder="https://grok.com/share/c2hhcmQtMw_324513bf-346d-4672-b26b-a79e9467b4ad"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Paste the shared Grok conversation link here. Note: Grok doesn't have a public API, so you'll need to manually copy the conversation text after extraction.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={importFromGrokLink} 
              disabled={isLoading || !grokShareLink.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Extract Conversation ID
                </>
              )}
            </Button>
            <Button 
              onClick={() => {
                setShowImportForm(false);
                setGrokShareLink('');
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Display Extracted Conversations from JSON */}
      {extractedConversations.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Extracted Conversations ({extractedConversations.length})</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExtractedConversations([])}
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {extractedConversations.map((conv) => (
              <Card key={conv.conversationId} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{conv.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conv.date} • {conv.messageCount} messages ({conv.userMessageCount} Ulysses, {conv.ripleyMessageCount} Ripley)
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => saveExtractedConversation(conv)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                
                {conv.summary && (
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {conv.summary}
                  </div>
                )}
                
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View Preview
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-[10px] overflow-x-auto max-h-[200px] overflow-y-auto">
                    {conv.rawText.substring(0, 500)}...
                  </pre>
                </details>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {showUploadForm && (
        <Card className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">Upload Grok Conversation</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Title {parseStats && <Badge variant="outline" className="ml-2 text-[10px]">Auto-generated</Badge>}</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Click 'Auto-Parse & Analyze' to generate title, or enter manually..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Conversation Date {parseStats && <Badge variant="outline" className="ml-2 text-[10px]">Auto-detected</Badge>}</label>
            <Input
              type="date"
              value={formData.conversation_date}
              onChange={(e) => setFormData(prev => ({ ...prev, conversation_date: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Parser will auto-detect dates from timestamps in the conversation
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Full Transcript</label>
              <Button
                size="sm"
                variant="outline"
                onClick={autoParseAndAnalyze}
                disabled={isAutoParsing || !formData.full_transcript.trim()}
                className="gap-1"
              >
                {isAutoParsing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Auto-Parse & Analyze
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={formData.full_transcript}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, full_transcript: e.target.value }));
                setParseStats(null); // Reset parse stats when text changes
              }}
              placeholder="Paste the full conversation from Grok here...

The parser will automatically detect:
• Speaker identification (You/Ulysses vs Grok/Ripley)
• Message boundaries and timestamps
• Conversation date and metadata
• Generate title, summary, and tags"
              rows={10}
              className="font-mono text-sm"
            />
            {formData.full_transcript && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>~{estimateTokens(formData.full_transcript).toLocaleString()} tokens</span>
                {parseStats && (
                  <>
                    <span>•</span>
                    <span className="text-green-500">
                      ✓ {parseStats.messageCount} messages ({parseStats.userCount} Ulysses, {parseStats.ripleyCount} Ripley)
                    </span>
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Paste raw conversation text, then click "Auto-Parse & Analyze" to automatically extract messages, generate title/summary/tags!
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (comma-separated) {parseStats && <Badge variant="outline" className="ml-2 text-[10px]">Auto-generated</Badge>}</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Click 'Auto-Parse & Analyze' to generate tags, or enter manually..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Summary (Important Moments)</label>
              <Button
                size="sm"
                variant="outline"
                onClick={generateSummary}
                disabled={isGeneratingSummary || !formData.full_transcript.trim()}
              >
                {isGeneratingSummary ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : null}
                {isGeneratingSummary ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </div>
            <Textarea
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Click 'Auto-Parse & Analyze' to automatically generate summary of breakthroughs and key moments..."
              rows={4}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Summary is auto-generated by "Auto-Parse & Analyze". Click "Regenerate" to create a new one.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={uploadArchive} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Archive
            </Button>
            <Button variant="outline" onClick={() => setShowUploadForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {isLoading && archives.length === 0 ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : (
        <div className="grid gap-4">
          {archives.map((archive) => (
            <Card key={archive._id} className="p-4 hover-lift cursor-pointer" onClick={() => onArchiveSelect?.(archive)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold mb-1">{archive.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(archive.conversation_date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{archive.token_count.toLocaleString()} tokens</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadArchive(archive);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteArchive(archive._id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {archive.tags && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {archive.tags.split(',').map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {archive.summary && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                  <span className="font-semibold">Summary:</span> {archive.summary}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground/70 line-clamp-2">
                {archive.full_transcript.substring(0, 150)}...
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
