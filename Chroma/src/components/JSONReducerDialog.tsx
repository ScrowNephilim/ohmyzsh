import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Loader2, Upload, Download, CheckCircle2, AlertCircle, FileDown, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reduceJSONSize, downloadReducedJSON, formatBytes, type ReductionResult } from '@/lib/json-size-reducer';

interface JSONReducerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JSONReducerDialog({ isOpen, onClose }: JSONReducerDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ReductionResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [targetSizeMB, setTargetSizeMB] = useState<number>(10);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.json')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a .json file',
        variant: 'destructive'
      });
      return;
    }

    const sizeMB = selectedFile.size / (1024 * 1024);
    if (sizeMB < 10) {
      toast({
        title: 'File Too Small',
        description: `File is ${sizeMB.toFixed(1)}MB, already under 10MB target. No reduction needed!`,
        variant: 'default'
      });
      return;
    }

    setFile(selectedFile);
    setResult(null);
    console.log(`[JSONReducer] 📁 File selected: ${selectedFile.name} (${sizeMB.toFixed(2)}MB)`);
  };

  const handleReduce = async () => {
    if (!file) return;

    setIsProcessing(true);
    console.log('[JSONReducer] 🚀 Starting reduction process...');

    try {
      // Read file
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Reduce size
      const reductionResult = await reduceJSONSize(jsonData, targetSizeMB);
      setResult(reductionResult);

      if (reductionResult.success) {
        toast({
          title: '✨ Reduction Complete!',
          description: `Reduced from ${formatBytes(reductionResult.originalSize)} to ${formatBytes(reductionResult.reducedSize)} (${reductionResult.reductionPercentage.toFixed(1)}% saved)`
        });
      } else {
        toast({
          title: '⚠️ Partial Reduction',
          description: `Reduced to ${formatBytes(reductionResult.reducedSize)}, but couldn't reach ${targetSizeMB}MB target. Try more aggressive settings.`,
          variant: 'default'
        });
      }
    } catch (error: any) {
      console.error('[JSONReducer] ❌ Error:', error);
      toast({
        title: 'Reduction Failed',
        description: error.message || 'Could not process JSON file',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const newFilename = file.name.replace('.json', '_reduced.json');
    downloadReducedJSON(result, newFilename);
    toast({
      title: '📥 Downloaded!',
      description: `Saved as ${newFilename}`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-black/95 border-violet-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-violet-400" />
            JSON File Size Reducer
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Compress large JSON files (15MB → 10MB) by removing non-essential data while preserving conversation content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Upload Section */}
          <Card className="p-6 bg-black/60 border-violet-500/20">
            <h3 className="text-lg font-semibold mb-3 text-violet-300">1. Upload JSON File</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="json-file-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="json-file-upload">
                  <Button
                    variant="outline"
                    className="border-violet-500/50 hover:bg-violet-500/20 text-white cursor-pointer"
                    disabled={isProcessing}
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>
                {file && (
                  <span className="text-sm text-gray-400">
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Target Size (MB)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="1"
                    value={targetSizeMB}
                    onChange={(e) => setTargetSizeMB(Number(e.target.value))}
                    className="flex-1 accent-violet-500"
                    disabled={isProcessing}
                  />
                  <span className="text-sm font-mono text-violet-300 w-16 text-right">
                    {targetSizeMB}MB
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Lower values = more aggressive compression
                </p>
              </div>
            </div>
          </Card>

          {/* Process Button */}
          <Button
            onClick={handleReduce}
            disabled={!file || isProcessing}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Reducing File Size...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Reduce File Size
              </>
            )}
          </Button>

          {/* Results Section */}
          {result && (
            <Card className="p-6 bg-black/60 border-violet-500/20 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                {result.success ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-green-300">Reduction Complete!</h3>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-yellow-300">Partial Reduction</h3>
                  </>
                )}
              </div>

              {/* Size Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Original Size</p>
                  <p className="text-2xl font-bold text-red-400">{formatBytes(result.originalSize)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Reduced Size</p>
                  <p className="text-2xl font-bold text-green-400">{formatBytes(result.reducedSize)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Size Reduction</span>
                  <span className="text-violet-300 font-bold">{result.reductionPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={result.reductionPercentage} className="h-3" />
              </div>

              {/* Compression Steps */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">Compression Steps Applied:</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  {result.compressionSteps.map((step, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <FileDown className="w-5 h-5 mr-2" />
                Download Reduced JSON
              </Button>
            </Card>
          )}

          {/* Info Card */}
          <Card className="p-4 bg-violet-950/30 border-violet-500/20">
            <p className="text-xs text-gray-400">
              <strong className="text-violet-300">💡 How it works:</strong>
              <br />
              The reducer progressively removes non-essential data: metadata fields, duplicate conversations, 
              short conversations (&lt;3 messages), empty fields, and truncates long messages while preserving 
              all conversation content and structure. Your original file is never modified.
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
