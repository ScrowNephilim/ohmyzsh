import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Upload, Sparkles, Calendar, FileText, Download, Archive, X, Zap, Brain, Heart, User, Users, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processGrokJSONFile, type ExtractedMiniConversation } from '@/lib/grok-json-extractor';
import { batchAnalyzeConversations, calculateImportanceScore } from '@/lib/conversation-analyzer';
import type { ConversationAnalysis } from '@/lib/conversation-analyzer';
import { table } from '@devvai/devv-code-backend';
import { estimateTokens } from '@/lib/token-utils';

const GROK_ARCHIVES_TABLE = 'f45d7c8188w0';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportToMaster: (conversation: ExtractedMiniConversation) => void;
}

export function GrokImportDialog({ open, onOpenChange, onImportToMaster }: Props) {
  const { toast } = useToast();
  const [isProcessingJSON, setIsProcessingJSON] = useState(false);
  const [extractedConversations, setExtractedConversations] = useState<ExtractedMiniConversation[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, ConversationAnalysis>>(new Map());
  const [isSaving, setIsSaving] = useState<string | null>(null);

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
      
      console.log('[GrokImport] JSON extraction complete:', extracted.length, 'conversations');
      
      setExtractedConversations(extracted);
      
      toast({
        title: "✨ JSON Processed!",
        description: `Found ${extracted.length} conversation(s). Review and import them below.`,
      });

    } catch (error) {
      console.error('JSON processing error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Please check the file format and try again 🔄";
      
      toast({
        title: "JSON Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingJSON(false);
      event.target.value = '';
    }
  };

  const handleImport = (conv: ExtractedMiniConversation) => {
    onImportToMaster(conv);
    
    // Remove from list
    setExtractedConversations(prev => prev.filter(c => c.conversationId !== conv.conversationId));
    
    toast({
      title: "✨ Added to Editor!",
      description: `${conv.title} appended to current master file (${conv.rawText.length.toLocaleString()} characters)`,
    });
  };

  const handleSaveToArchives = async (conv: ExtractedMiniConversation) => {
    try {
      setIsSaving(conv.conversationId);

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
        title: "✨ Saved to Archives!",
        description: `${conv.title} added to Grok archives`,
      });

    } catch (error) {
      console.error('Save to archives error:', error);
      toast({
        title: "Save Failed",
        description: "Couldn't save to archives. Try again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const clearAll = () => {
    setExtractedConversations([]);
    toast({
      title: "Cleared",
      description: "All extracted conversations removed",
    });
  };

  const getLengthBadge = (text: string) => {
    const len = text.length;
    if (len < 1000) return { label: 'Short', color: 'bg-green-500/20 text-green-400' };
    if (len < 5000) return { label: 'Medium', color: 'bg-blue-500/20 text-blue-400' };
    return { label: 'Long', color: 'bg-orange-500/20 text-orange-400' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            Import Grok Conversations
          </DialogTitle>
          <DialogDescription>
            Upload your Grok JSON export to extract and import conversations into your master file
          </DialogDescription>
        </DialogHeader>

        {/* File Upload Section */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <label htmlFor="grok-json-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-sm font-medium">
                  Click to upload Grok JSON export
                </div>
                <div className="text-xs text-muted-foreground">
                  Maximum file size: 20MB
                </div>
              </div>
              <input
                id="grok-json-upload"
                type="file"
                accept=".json"
                onChange={handleJSONUpload}
                className="hidden"
                disabled={isProcessingJSON}
              />
            </label>
          </div>

          {isProcessingJSON && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing JSON file...
            </div>
          )}
        </div>

        {/* Extracted Conversations */}
        {extractedConversations.length > 0 && (
          <div className="flex-1 min-h-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">
                {extractedConversations.length} conversation(s) extracted
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>

            <ScrollArea className="h-full">
              <div className="space-y-3 pr-4">
                {extractedConversations.map((conv) => {
                  const lengthBadge = getLengthBadge(conv.rawText);
                  
                  return (
                    <Card key={conv.conversationId} className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">{conv.title}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {conv.date}
                          </div>
                        </div>
                        <Badge className={lengthBadge.color}>
                          {lengthBadge.label}
                        </Badge>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {conv.messageCount} messages
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {conv.rawText.length.toLocaleString()} chars
                        </Badge>
                      </div>

                      {/* Preview */}
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {conv.rawText.slice(0, 200)}
                        {conv.rawText.length > 200 && '...'}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleImport(conv)}
                          className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                          disabled={isSaving !== null}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Add to Current Master File
                        </Button>
                        <Button
                          onClick={() => handleSaveToArchives(conv)}
                          variant="outline"
                          className="flex-1"
                          disabled={isSaving !== null}
                        >
                          {isSaving === conv.conversationId ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Archive className="h-4 w-4 mr-2" />
                          )}
                          Save to Archives
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Empty State */}
        {!isProcessingJSON && extractedConversations.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center py-8">
            <div className="space-y-2 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto opacity-50" />
              <div className="text-sm font-medium">No conversations yet</div>
              <div className="text-xs">Upload a JSON file to get started</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
