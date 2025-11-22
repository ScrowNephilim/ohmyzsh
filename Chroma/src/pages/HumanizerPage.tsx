import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from '@/components/FileUpload';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  FileText,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DevvAI } from '@devvai/devv-code-backend';
import type { FileAttachment } from '@/store/chat-store';

export default function HumanizerPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isDevMode = useAuthStore(state => state.isDevMode);
  const { toast } = useToast();

  const [inputText, setInputText] = useState('');
  const [instructions, setInstructions] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = (files: FileAttachment[]) => {
    setAttachedFiles([...attachedFiles, ...files]);
    toast({
      title: '✨ Files Attached!',
      description: `${files.length} file(s) ready for processing`
    });
  };

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setCharacterCount(chars);
    setWordCount(words);
  };

  const handleHumanize = async () => {
    if (isDevMode) {
      toast({
        title: '🔓 Dev Mode Active',
        description: 'AI features require real authentication. Please switch to real auth.',
        variant: 'destructive'
      });
      return;
    }

    if (!inputText.trim() && attachedFiles.length === 0) {
      toast({
        title: 'Nothing to Process',
        description: 'Please add some text or attach files first 📝',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setOutputText('');

    try {
      // Build the humanization prompt
      const systemPrompt = `You are a humanization expert. Your job is to rewrite text to sound natural, human, and authentic while maintaining the original meaning and intent. Follow these principles:

1. **Natural Language Flow**: Use conversational tone, varied sentence structures, and natural transitions
2. **Remove AI Patterns**: Eliminate overly formal language, robotic phrasing, and AI-typical word choices
3. **Add Human Touch**: Include occasional contractions, natural imperfections, personal voice
4. **Maintain Authenticity**: Keep the core message, facts, and key points intact
5. **Context Awareness**: Adapt style based on the type of content (academic, creative, professional, etc.)

Additional instructions from user:
${instructions.trim() || 'No specific instructions provided. Use your best judgment.'}`;

      const userPrompt = `Please humanize the following text. Make it sound natural, authentic, and human-written while preserving the original meaning:

${inputText}`;

      // Prepare content array with text and files
      const content: any[] = [{ type: 'text', text: userPrompt }];

      // Add attached files to content
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          content.push({
            type: 'file',
            file_url: file.url
          });
        }
      }

      console.log('🤖 Humanizer: Sending request to DevvAI...');

      const ai = new DevvAI();

      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content }
        ],
        temperature: 0.8, // Higher temperature for more natural, varied output
        max_tokens: 4000
      });

      const humanizedText = response.choices[0]?.message?.content || '';

      if (!humanizedText) {
        throw new Error('No response from AI');
      }

      setOutputText(humanizedText);

      toast({
        title: '✨ Text Humanized!',
        description: 'Your content has been rewritten naturally'
      });

      console.log('✅ Humanizer: Processing complete');
    } catch (error: any) {
      console.error('❌ Humanizer error:', error);

      // Check for session expiration
      if (error.message?.includes('invalid session') || error.message?.includes('unauthorized')) {
        toast({
          title: 'Session Expired 💫',
          description: 'Please log in again to continue',
          variant: 'destructive'
        });
        useAuthStore.getState().logout();
        navigate('/login');
        return;
      }

      toast({
        title: 'Processing Failed',
        description: error.message || 'Something went wrong. Please try again 🔄',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyOutput = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    toast({
      title: '✨ Copied!',
      description: 'Humanized text copied to clipboard'
    });
  };

  const handleDownloadOutput = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `humanized-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: '✨ Download Complete!',
      description: 'Your humanized text is ready'
    });
  };

  const handleReset = () => {
    setInputText('');
    setInstructions('');
    setAttachedFiles([]);
    setOutputText('');
    setCharacterCount(0);
    setWordCount(0);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/50 backdrop-blur-md p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,45%)]/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Wand2 className="h-6 w-6 text-[hsl(142,70%,45%)]" />
                  <h1 className="text-2xl font-bold" style={{ fontFamily: "'Fira Code', 'Courier New', monospace" }}>
                    Assignment Humanizer
                  </h1>
                </div>
                <p className="text-sm text-white/60 mt-1">
                  Make AI-written text sound natural and human 🎯
                </p>
              </div>
            </div>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-[hsl(142,70%,45%)]/30 hover:bg-[hsl(142,70%,45%)]/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Dev Mode Warning */}
        {isDevMode && (
          <div className="bg-orange-500/20 border-b border-orange-500/30 p-3">
            <div className="max-w-7xl mx-auto flex items-center gap-2 text-orange-200">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">
                🔓 <strong>Dev Mode:</strong> AI humanizer requires real authentication. Please switch to real auth to use this feature.
              </span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="bg-black/50 border-white/10 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[hsl(142,70%,45%)]" />
                  Input Text
                </h2>
                <div className="text-sm text-white/60">
                  {wordCount} words • {characterCount} chars
                </div>
              </div>

              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Paste your AI-generated text here... I'll make it sound natural and human! 📝"
                className="min-h-[300px] bg-black/50 border-white/20 text-white resize-none mb-4 font-mono"
              />

              {/* Instructions */}
              <div className="mb-4">
                <label className="text-sm text-white/60 mb-2 block">
                  Special Instructions (Optional)
                </label>
                <Input
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g., Keep it academic, Use British English, Make it more casual..."
                  className="bg-black/50 border-white/20 text-white"
                />
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label className="text-sm text-white/60 mb-2 block">
                  Attach Files (Optional)
                </label>
                <FileUpload
                  onFilesUploaded={handleFileUpload}
                />
                {attachedFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachedFiles.map((file, index) => {
                      const Icon = FileText;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-black/30 rounded border border-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-white/60" />
                            <span className="text-sm text-white/80">{file.filename}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Humanize Button */}
              <Button
                onClick={handleHumanize}
                disabled={isProcessing || (!inputText.trim() && attachedFiles.length === 0)}
                className="w-full bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-black font-semibold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Humanizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Humanize Text
                  </>
                )}
              </Button>
            </Card>

            {/* Output Section */}
            <Card className="bg-black/50 border-white/10 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[hsl(142,70%,45%)]" />
                  Humanized Output
                </h2>
                {outputText && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyOutput}
                      className="border-[hsl(142,70%,45%)]/30 hover:bg-[hsl(142,70%,45%)]/10"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadOutput}
                      className="border-[hsl(142,70%,45%)]/30 hover:bg-[hsl(142,70%,45%)]/10"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              <ScrollArea className="h-[400px] bg-black/30 border border-white/10 rounded p-4">
                {outputText ? (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-white/90 whitespace-pre-wrap font-sans leading-relaxed">
                      {outputText}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-white/40">
                    <Wand2 className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg mb-2">Your humanized text will appear here</p>
                    <p className="text-sm">Add your text and click "Humanize Text" to get started ✨</p>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
