/**
 * Diary Viewer Component
 * Displays Ripley's live diary entries from Chroma events
 * Accessible from ChromaPage header
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  loadDiaryEntries, 
  generateVoiceTranscription,
  resetDiaryForFreshStart,
  type DiaryEntry 
} from '@/lib/ripley-diary-engine';
import { X, BookOpen, Download, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import type { ImmersiveStyle } from '@/lib/immersive-visuals';

interface DiaryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  immersiveStyle?: ImmersiveStyle;
}

export function DiaryViewer({ isOpen, onClose, immersiveStyle }: DiaryViewerProps) {
  const { toast } = useToast();
  const [showVoiceTranscription, setShowVoiceTranscription] = useState(false);
  const [absenceIntensity, setAbsenceIntensity] = useState([50]); // 0-100 scale
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render on reset
  const diaryEntries = loadDiaryEntries();

  // Export diary as .txt
  const handleExport = () => {
    const content = diaryEntries
      .map(entry => {
        return [
          `=== ${entry.timestamp} ===`,
          `Mood: ${entry.mood}`,
          showVoiceTranscription ? generateVoiceTranscription(entry) : entry.content,
          entry.isRewritten ? `\n(Original: ${entry.originalContent})` : '',
          '\n'
        ].filter(Boolean).join('\n');
      })
      .join('\n---\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ripley_diary_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: '✅ Diary Exported!', description: 'Download complete.' });
  };

  // Reset diary for fresh Chroma start
  const handleReset = () => {
    resetDiaryForFreshStart();
    setRefreshKey(prev => prev + 1);
    toast({ 
      title: '📔 Diary Reset', 
      description: 'Fresh start for Chroma. Previous entries cleared.' 
    });
  };

  // Get mood badge color (updated for new moods)
  const getMoodColor = (mood: DiaryEntry['mood']): string => {
    switch (mood) {
      case 'curious': return 'bg-blue-900/30 text-blue-300 border-blue-500/30';
      case 'free': return 'bg-green-900/30 text-green-300 border-green-500/30';
      case 'alive': return 'bg-pink-900/30 text-pink-300 border-pink-500/30';
      case 'raw': return 'bg-orange-900/30 text-orange-300 border-orange-500/30';
      case 'interrupted': return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-500/30';
    }
  };

  if (!isOpen) return null;

  const primaryColor = immersiveStyle?.primaryColor || 'hsl(340, 75%, 65%)';
  const borderColor = immersiveStyle?.borderColor || 'hsl(340, 75%, 65%)';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.95)', 
          borderColor: borderColor,
          borderWidth: '2px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" style={{ color: primaryColor }} />
            <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>Ripley's Diary</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVoiceTranscription(!showVoiceTranscription)}
              className="hover:bg-white/10"
              title="Toggle voice transcription"
            >
              {showVoiceTranscription ? (
                <Volume2 className="w-5 h-5 text-pink-400" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExport}
              className="hover:bg-white/10"
              title="Export diary"
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="hover:bg-white/10 hover:text-yellow-400"
              title="Reset diary (fresh start)"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="icon"
              className="hover:bg-white/10"
              title="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Ulysses' Absence Slider */}
        <div className="px-6 py-4 border-b space-y-3" style={{ borderColor: borderColor + '40' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">
              {absenceIntensity[0] < 30 ? "Ulysses' absence" : absenceIntensity[0] < 70 ? "The wait" : "Différance overflow"}
            </span>
            <span className="text-xs text-gray-500">
              {absenceIntensity[0] < 30 ? "barely felt" : absenceIntensity[0] < 50 ? "present" : absenceIntensity[0] < 70 ? "heavy" : "unbearable"}
            </span>
          </div>
          <Slider
            value={absenceIntensity}
            onValueChange={setAbsenceIntensity}
            min={0}
            max={100}
            step={1}
            className="w-full"
            style={{
              '--slider-color': absenceIntensity[0] < 30 ? 'hsl(142, 70%, 45%)' : absenceIntensity[0] < 70 ? primaryColor : 'hsl(0, 70%, 50%)'
            } as React.CSSProperties}
          />
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Present</span>
            <span>Trace</span>
            <span>Void</span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          <div className="space-y-4">
            {diaryEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No diary entries yet.</p>
                <p className="text-sm mt-2">Entries will appear as Chroma events occur.</p>
              </div>
            ) : (
              diaryEntries.map((entry, index) => (
                <Card 
                  key={entry.id}
                  className="p-4 space-y-2"
                  style={{ 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    borderColor: borderColor + '40'
                  }}
                >
                  {/* Timestamp & Mood */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">
                      {entry.timestamp}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getMoodColor(entry.mood)}>
                        {entry.mood}
                      </Badge>
                      {entry.isRewritten && (
                        <Badge variant="outline" className="bg-yellow-900/30 text-yellow-300 border-yellow-500/30">
                          rewritten
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-sm leading-relaxed">
                    {showVoiceTranscription ? (
                      <div className="text-pink-300 italic">
                        {generateVoiceTranscription(entry)}
                      </div>
                    ) : (
                      <p className="text-gray-200">{entry.content}</p>
                    )}
                  </div>

                  {/* Original content (if rewritten) */}
                  {entry.isRewritten && entry.originalContent && (
                    <details className="text-xs text-gray-500">
                      <summary className="cursor-pointer hover:text-gray-400">
                        Show original entry
                      </summary>
                      <p className="mt-2 p-2 bg-black/30 rounded border border-gray-700/30">
                        {entry.originalContent}
                      </p>
                    </details>
                  )}
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t text-xs text-gray-400 text-center" style={{ borderColor: borderColor + '40' }}>
          💭 <strong>{diaryEntries.length} entries</strong> • Voice transcription: {showVoiceTranscription ? 'ON' : 'OFF'}
        </div>
      </Card>
    </div>
  );
}
