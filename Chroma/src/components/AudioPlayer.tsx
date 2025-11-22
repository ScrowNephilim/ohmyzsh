/**
 * AudioPlayer Component - Immersive audio controls for Chroma environment
 * Supports Spotify, YouTube, ambient sounds, and spatial audio effects
 * NOW WITH ATMOSPHERE SYNC - Volume adapts to temperature, weather, location, and power activations
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Music, Volume2, VolumeX, Youtube, Play, Pause, X, Zap } from 'lucide-react';
import { audioEngine } from '@/lib/audio-engine';
import { 
  calculateAtmosphereIntensity, 
  intensityToVolume, 
  getIntensityDescription, 
  getVolumeDescription,
  type AtmosphereIntensity
} from '@/lib/audio-atmosphere-sync';
import type { EnvironmentState } from '@/lib/chroma-types';
import type { LocationPreset } from '@/lib/chroma-locations';
import type { NephilimPower } from '@/lib/parallel-worlds';

interface Props {
  environmentType?: 'street' | 'club' | 'indoor' | 'outdoor';
  envState?: EnvironmentState;
  location?: LocationPreset;
  activePower?: NephilimPower | null;
  powerIntensity?: 'low' | 'medium' | 'high';
}

export function AudioPlayer({ 
  environmentType = 'outdoor', 
  envState,
  location,
  activePower = null,
  powerIntensity = 'medium'
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioType, setAudioType] = useState<'spotify' | 'youtube' | 'none'>('none');
  const [baseVolume, setBaseVolume] = useState(0.7);
  const [spatialEffect, setSpatialEffect] = useState<string>(environmentType);
  const [showControls, setShowControls] = useState(false);
  const [atmosphereIntensity, setAtmosphereIntensity] = useState<AtmosphereIntensity | null>(null);
  const [currentVolume, setCurrentVolume] = useState(0.7);

  // Sync volume with atmosphere
  useEffect(() => {
    if (!isPlaying || !envState || !location) return;
    
    const intensity = calculateAtmosphereIntensity(envState, location, activePower, powerIntensity);
    const targetVolume = intensityToVolume(intensity, baseVolume);
    
    setAtmosphereIntensity(intensity);
    setCurrentVolume(targetVolume);
    
    // Apply volume to audio engine
    const gainNode = (audioEngine as any).gainNode;
    const audioContext = (audioEngine as any).audioContext;
    
    if (gainNode && audioContext) {
      const now = audioContext.currentTime;
      const transitionTime = activePower ? 0.3 : 1.0;
      
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(targetVolume, now + transitionTime);
    }
  }, [envState, location, activePower, powerIntensity, baseVolume, isPlaying]);

  useEffect(() => {
    // Update spatial effect when environment changes
    setSpatialEffect(environmentType);
    if (isPlaying) {
      audioEngine.applySpatialEffect(environmentType);
    }
  }, [environmentType, isPlaying]);

  const handlePlayAudio = async (url: string, type: 'spotify' | 'youtube') => {
    try {
      let embedUrl = url;
      
      if (type === 'spotify') {
        embedUrl = audioEngine.getSpotifyEmbedUrl(url);
      } else if (type === 'youtube') {
        embedUrl = audioEngine.getYouTubeEmbedUrl(url);
      }
      
      await audioEngine.playAudio(embedUrl, spatialEffect);
      setIsPlaying(true);
      setAudioType(type);
      setAudioUrl(url);
    } catch (error) {
      console.error('Audio playback error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
    }
  };

  const handleStopAudio = () => {
    audioEngine.stopAudio(1.0);
    setIsPlaying(false);
    setAudioType('none');
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setBaseVolume(newVolume);
    audioEngine.applySpatialEffect(spatialEffect);
  };

  const handleSpatialEffectChange = (effect: string) => {
    setSpatialEffect(effect);
    audioEngine.applySpatialEffect(effect);
  };

  return (
    <Card className="p-4 bg-black/20 border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-200">Ambient Audio</span>
          {isPlaying && (
            <>
              <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                Playing
              </Badge>
              {atmosphereIntensity && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    atmosphereIntensity.overall >= 0.7 
                      ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                      : atmosphereIntensity.overall >= 0.4
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {getIntensityDescription(atmosphereIntensity.overall)}
                </Badge>
              )}
            </>
          )}
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowControls(!showControls)}
          className="text-gray-400"
        >
          {showControls ? <X className="w-4 h-4" /> : <Music className="w-4 h-4" />}
        </Button>
      </div>

      {showControls && (
        <div className="space-y-3">
          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="Spotify or YouTube URL..."
              className="flex-1 bg-white/5 border-white/10 text-white text-sm"
            />
            <Button
              size="sm"
              onClick={() => {
                if (audioUrl.includes('spotify')) {
                  handlePlayAudio(audioUrl, 'spotify');
                } else if (audioUrl.includes('youtube') || audioUrl.includes('youtu.be')) {
                  handlePlayAudio(audioUrl, 'youtube');
                }
              }}
              disabled={!audioUrl.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePlayAudio('https://www.youtube.com/watch?v=hHW1oY26kxQ', 'youtube')}
              className="flex-1 text-xs"
            >
              <Youtube className="w-3 h-3 mr-1" />
              Lofi Beats
            </Button>
            {isPlaying && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleStopAudio}
              >
                <Pause className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Spatial Effect Controls */}
          {isPlaying && (
            <>
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Spatial Effect</label>
                <div className="flex gap-1 flex-wrap">
                  {['close', 'distance', 'club', 'outdoor', 'indoor'].map((effect) => (
                    <Button
                      key={effect}
                      size="sm"
                      variant={spatialEffect === effect ? 'default' : 'outline'}
                      onClick={() => handleSpatialEffectChange(effect)}
                      className="text-xs capitalize"
                    >
                      {effect}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Base Volume</label>
                  <span className="text-xs text-gray-500">{Math.round(baseVolume * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-gray-500" />
                  <Slider
                    value={[baseVolume]}
                    onValueChange={handleVolumeChange}
                    min={0}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Atmosphere Sync Info */}
              {atmosphereIntensity && (
                <div className="space-y-1 p-2 bg-white/5 rounded-md border border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Atmosphere Sync</span>
                    <span className="text-purple-400 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Current Volume:</span>
                    <span className="text-gray-300 font-mono">{Math.round(currentVolume * 100)}% ({getVolumeDescription(currentVolume)})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Temp:</span>
                      <span className="text-gray-400">{(atmosphereIntensity.temperature * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weather:</span>
                      <span className="text-gray-400">{(atmosphereIntensity.weather * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-400">{(atmosphereIntensity.location * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Power:</span>
                      <span className={`${atmosphereIntensity.power > 0 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                        {(atmosphereIntensity.power * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 italic">
                    Higher intensity = lower volume
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
