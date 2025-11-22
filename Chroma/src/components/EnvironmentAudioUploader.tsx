/**
 * Environment Audio Uploader Component
 * Allows uploading weather/environment MP3s with volume control
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Upload, Volume2, VolumeX, Play, Pause, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type EnvironmentAudioType = 
  | 'rain' | 'storm' | 'wind' | 'fog' | 'snow' | 'clear'
  | 'birds' | 'crickets' | 'city' | 'water' | 'fire' | 'night'
  | 'forest' | 'ocean' | 'thunder' | 'rustling';

interface EnvironmentAudio {
  type: EnvironmentAudioType;
  url: string;
  volume: number;
  isPlaying: boolean;
}

interface EnvironmentAudioUploaderProps {
  onClose?: () => void;
  className?: string;
}

const AUDIO_TYPES: { value: EnvironmentAudioType; label: string; icon: string }[] = [
  { value: 'rain', label: 'Rain', icon: '🌧️' },
  { value: 'storm', label: 'Storm', icon: '⛈️' },
  { value: 'wind', label: 'Wind', icon: '💨' },
  { value: 'fog', label: 'Fog', icon: '🌫️' },
  { value: 'snow', label: 'Snow', icon: '❄️' },
  { value: 'clear', label: 'Clear', icon: '☀️' },
  { value: 'birds', label: 'Birds', icon: '🐦' },
  { value: 'crickets', label: 'Crickets', icon: '🦗' },
  { value: 'city', label: 'City', icon: '🏙️' },
  { value: 'water', label: 'Water', icon: '💧' },
  { value: 'fire', label: 'Fire', icon: '🔥' },
  { value: 'night', label: 'Night', icon: '🌙' },
  { value: 'forest', label: 'Forest', icon: '🌲' },
  { value: 'ocean', label: 'Ocean', icon: '🌊' },
  { value: 'thunder', label: 'Thunder', icon: '⚡' },
  { value: 'rustling', label: 'Rustling', icon: '🍃' }
];

export function EnvironmentAudioUploader({ onClose, className }: EnvironmentAudioUploaderProps) {
  const { toast } = useToast();
  const [audioLibrary, setAudioLibrary] = useState<Map<EnvironmentAudioType, EnvironmentAudio>>(new Map());
  const [audioElements, setAudioElements] = useState<Map<EnvironmentAudioType, HTMLAudioElement>>(new Map());
  const [selectedType, setSelectedType] = useState<EnvironmentAudioType>('rain');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chroma-environment-audio');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const library = new Map<EnvironmentAudioType, EnvironmentAudio>(
          Object.entries(parsed).map(([key, value]) => [key as EnvironmentAudioType, value as EnvironmentAudio])
        );
        setAudioLibrary(library);
      } catch (e) {
        console.error('[EnvironmentAudio] Failed to load from storage:', e);
      }
    }
  }, []);

  // Save to localStorage whenever library changes
  useEffect(() => {
    const obj = Object.fromEntries(audioLibrary);
    localStorage.setItem('chroma-environment-audio', JSON.stringify(obj));
  }, [audioLibrary]);

  // Cleanup audio elements on unmount
  useEffect(() => {
    return () => {
      audioElements.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const handleFileUpload = (type: EnvironmentAudioType, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an audio file (MP3, WAV, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Create URL from file
    const url = URL.createObjectURL(file);
    
    // Stop any existing audio for this type
    const existingAudio = audioElements.get(type);
    if (existingAudio) {
      existingAudio.pause();
    }

    // Add to library
    const newAudio: EnvironmentAudio = {
      type,
      url,
      volume: 50,
      isPlaying: false
    };

    setAudioLibrary(prev => new Map(prev).set(type, newAudio));

    toast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Audio Uploaded`,
      description: `${file.name} is ready to use`,
    });
  };

  const handlePlay = (type: EnvironmentAudioType) => {
    const audioData = audioLibrary.get(type);
    if (!audioData) return;

    let audio = audioElements.get(type);
    if (!audio) {
      audio = new Audio(audioData.url);
      audio.loop = true;
      setAudioElements(prev => new Map(prev).set(type, audio!));
    }

    if (audioData.isPlaying) {
      // Pause
      audio.pause();
      setAudioLibrary(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(type)!;
        newMap.set(type, { ...current, isPlaying: false });
        return newMap;
      });
    } else {
      // Play
      audio.volume = audioData.volume / 100;
      audio.play().catch(err => {
        console.error('[EnvironmentAudio] Play error:', err);
        toast({
          title: "Playback Error",
          description: "Could not play audio. Try re-uploading.",
          variant: "destructive"
        });
      });
      setAudioLibrary(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(type)!;
        newMap.set(type, { ...current, isPlaying: true });
        return newMap;
      });
    }
  };

  const handleVolumeChange = (type: EnvironmentAudioType, value: number[]) => {
    const volume = value[0];
    const audio = audioElements.get(type);
    if (audio) {
      audio.volume = volume / 100;
    }

    setAudioLibrary(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(type);
      if (current) {
        newMap.set(type, { ...current, volume });
      }
      return newMap;
    });
  };

  const handleDelete = (type: EnvironmentAudioType) => {
    const audio = audioElements.get(type);
    if (audio) {
      audio.pause();
      audio.src = '';
      audioElements.delete(type);
    }

    // Instead of permanently deleting user-uploaded audio, archive it so published
    // MP3s are preserved. This moves the audio metadata to a separate archive key
    // in localStorage and removes it from the active library UI slot.
    const audioData = audioLibrary.get(type);
    if (audioData) {
      try {
        const archivedRaw = localStorage.getItem('chroma-environment-audio-archive');
        const archived = archivedRaw ? JSON.parse(archivedRaw) : {};
        archived[type] = audioData;
        localStorage.setItem('chroma-environment-audio-archive', JSON.stringify(archived));
      } catch (e) {
        console.error('[EnvironmentAudio] Failed to archive audio:', e);
      }
    }

    setAudioLibrary(prev => {
      const newMap = new Map(prev);
      newMap.delete(type);
      return newMap;
    });

    toast({
      title: "Audio Archived",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} audio moved to archive (preserved)`,
    });
  };

  return (
    <Card className={`${className} w-[600px] max-h-[80vh] overflow-y-auto`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="w-5 h-5" />
            Environment Audio Library
          </CardTitle>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-destructive/20"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Upload MP3s for weather and environment sounds. They'll loop automatically when active.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {AUDIO_TYPES.map(({ value, label, icon }) => {
          const audioData = audioLibrary.get(value);
          const hasAudio = !!audioData;

          return (
            <div key={value} className="space-y-2 p-3 rounded-lg border border-border/50 bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                  {hasAudio && (
                    <Badge variant="outline" className="text-xs">
                      {audioData.isPlaying ? 'Playing' : 'Ready'}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {hasAudio ? (
                    <>
                      {/* Play/Pause Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlay(value)}
                        className="h-7 w-7 p-0"
                      >
                        {audioData.isPlaying ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>

                      {/* Delete Button */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(value)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Upload Button */}
                      <label htmlFor={`upload-${value}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 cursor-pointer"
                          onClick={() => document.getElementById(`upload-${value}`)?.click()}
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                        </Button>
                      </label>
                      <input
                        id={`upload-${value}`}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(value, e)}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Volume Slider - Only show when audio exists */}
              {hasAudio && (
                <div className="flex items-center gap-3 pt-2">
                  <VolumeX className="w-3 h-3 opacity-50" />
                  <Slider
                    value={[audioData.volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleVolumeChange(audioData.type, value)}
                    className="flex-1"
                  />
                  <Volume2 className="w-3 h-3 opacity-50" />
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {audioData.volume}%
                  </span>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground space-y-1">
          <p><strong>Tip:</strong> Upload looping MP3s for best results</p>
          <p><strong>Usage:</strong> Click play to hear the audio, adjust volume slider</p>
          <p><strong>Auto-play:</strong> Environment audio plays automatically based on weather/location</p>
        </div>
      </CardContent>
    </Card>
  );
}
