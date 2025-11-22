/**
 * Sound Effects Menu Component
 * Centralized sound uploader for all user powers
 * Accessible from ChromaPage header icon
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { upload } from '@devvai/devv-code-backend';
import { 
  registerPowerSound, 
  getAllPowerSounds, 
  unregisterPowerSound, 
  type PowerSound 
} from '@/lib/power-audio';
import { X, Upload, Volume2, Trash2, Loader2 } from 'lucide-react';
import type { ImmersiveStyle } from '@/lib/immersive-visuals';

interface SoundEffectsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activePowers: string[];
  immersiveStyle?: ImmersiveStyle;
}

export function SoundEffectsMenu({ isOpen, onClose, activePowers, immersiveStyle }: SoundEffectsMenuProps) {
  const { toast } = useToast();
  const [registeredSounds, setRegisteredSounds] = useState<PowerSound[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  // Load registered sounds
  useEffect(() => {
    setRegisteredSounds(getAllPowerSounds());
  }, []);

  // Handle MP3 upload
  const handleFileUpload = async (powerId: string, category: 'activation' | 'deactivation' | 'impact', file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast({ title: '⚠️ Invalid File Type', description: 'Please upload an audio file (MP3, WAV, etc.)' });
      return;
    }

    const key = `${powerId}_${category}`;
    setUploadingFor(key);

    try {
      const result = await upload.uploadFile(file);
      
      if (upload.isErrorResponse(result)) {
        throw new Error(`Upload error ${result.errCode}: ${result.errMsg}`);
      }

      if (result.link) {
        registerPowerSound(powerId, category, result.link);
        setRegisteredSounds(getAllPowerSounds());
        
        toast({ title: '✅ Sound Uploaded!', description: `${powerId} ${category} sound is ready` });
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (error) {
      console.error('[Sound Menu] Upload error:', error);
      toast({ title: '❌ Upload Failed', description: 'Could not upload sound file. Try again!' });
    } finally {
      setUploadingFor(null);
    }
  };

  // Handle sound deletion
  const handleDeleteSound = (powerId: string, category: 'activation' | 'deactivation' | 'impact') => {
    unregisterPowerSound(powerId, category);
    setRegisteredSounds(getAllPowerSounds());
    toast({ title: '🗑️ Sound Removed', description: `${powerId} ${category} deleted` });
  };

  // Check if sound is registered
  const hasSound = (powerId: string, category: 'activation' | 'deactivation' | 'impact'): boolean => {
    return registeredSounds.some(s => s.powerName === powerId && s.category === category);
  };

  // Get sound key
  const getSoundKey = (powerId: string, category: string): string => `${powerId}_${category}`;

  if (!isOpen) return null;

  const primaryColor = immersiveStyle?.primaryColor || 'hsl(262, 75%, 55%)';
  const borderColor = immersiveStyle?.borderColor || 'hsl(262, 75%, 55%)';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.95)', 
          borderColor: borderColor,
          borderWidth: '2px'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b" style={{ borderColor }}>
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6" style={{ color: primaryColor }} />
            <h2 className="text-2xl font-bold" style={{ color: primaryColor }}>Power Sound Effects</h2>
          </div>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            size="icon"
            className="hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="text-sm text-gray-300 space-y-2">
            <p>💡 <strong>Upload custom sound effects for your powers!</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Activation</strong>: Plays when power is turned ON/used</li>
              <li><strong>Deactivation</strong>: Plays when power is turned OFF</li>
              <li><strong>Impact</strong>: Plays on high-strength attacks (&gt;25 strength)</li>
            </ul>
            <p className="text-xs text-gray-400 mt-2">📁 Supported formats: MP3, WAV, OGG, M4A</p>
          </div>

          {/* Gear 5 Sounds */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Badge variant="outline" className="bg-white text-black border-none">Ｇｅａｒ ５</Badge>
              <span className="text-sm text-gray-400">(Luffy's Power)</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['activation', 'deactivation', 'impact'] as const).map((category) => {
                const key = getSoundKey('gear5', category);
                const isUploading = uploadingFor === key;
                const hasUpload = hasSound('gear5', category);

                return (
                  <div key={category} className="space-y-2">
                    <p className="text-xs text-gray-400 capitalize">{category}</p>
                    {hasUpload ? (
                      <div className="flex items-center justify-between p-2 bg-green-900/30 border border-green-500/30 rounded">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-300">Uploaded</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-900/30"
                          onClick={() => handleDeleteSound('gear5', category)}
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    ) : (
                      <label className="block">
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('gear5', category, file);
                          }}
                          disabled={isUploading}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isUploading}
                          onClick={(e) => {
                            e.preventDefault();
                            (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                          }}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              <span className="text-xs">Upload</span>
                            </>
                          )}
                        </Button>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* The World Sounds */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Badge variant="outline" className="bg-[#B8860B] text-black border-none font-bold">𝐓𝐇𝐄 𝐖𝐎𝐑𝐋𝐃</Badge>
              <span className="text-sm text-gray-400">(Dio's Time Stop)</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['activation', 'deactivation'] as const).map((category) => {
                const key = getSoundKey('theworld', category);
                const isUploading = uploadingFor === key;
                const hasUpload = hasSound('theworld', category);

                return (
                  <div key={category} className="space-y-2">
                    <p className="text-xs text-gray-400 capitalize">{category}</p>
                    {hasUpload ? (
                      <div className="flex items-center justify-between p-2 bg-green-900/30 border border-green-500/30 rounded">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-300">Uploaded</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-900/30"
                          onClick={() => handleDeleteSound('theworld', category)}
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    ) : (
                      <label className="block">
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('theworld', category, file);
                          }}
                          disabled={isUploading}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isUploading}
                          onClick={(e) => {
                            e.preventDefault();
                            (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                          }}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              <span className="text-xs">Upload</span>
                            </>
                          )}
                        </Button>
                      </label>
                    )}
                  </div>
                );
              })}
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Impact</p>
                <div className="p-2 bg-gray-800/30 border border-gray-700/30 rounded">
                  <span className="text-xs text-gray-500">N/A (Time Stop)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conqueror's Haki / Random Attack Sounds */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Badge variant="outline" className="bg-red-600 text-white border-none font-bold">Random Attacks</Badge>
              <span className="text-sm text-gray-400">(Conqueror's Haki, Red Roc, etc.)</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Activation</p>
                <div className="p-2 bg-gray-800/30 border border-gray-700/30 rounded">
                  <span className="text-xs text-gray-500">Auto (on attack)</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Deactivation</p>
                <div className="p-2 bg-gray-800/30 border border-gray-700/30 rounded">
                  <span className="text-xs text-gray-500">N/A</span>
                </div>
              </div>
              {(() => {
                const category = 'impact';
                const key = getSoundKey('randomattack', category);
                const isUploading = uploadingFor === key;
                const hasUpload = hasSound('randomattack', category);

                return (
                  <div key={category} className="space-y-2">
                    <p className="text-xs text-gray-400">Impact (&gt;25 strength)</p>
                    {hasUpload ? (
                      <div className="flex items-center justify-between p-2 bg-green-900/30 border border-green-500/30 rounded">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-green-300">Uploaded</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:bg-red-900/30"
                          onClick={() => handleDeleteSound('randomattack', category)}
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    ) : (
                      <label className="block">
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('randomattack', category, file);
                          }}
                          disabled={isUploading}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={isUploading}
                          onClick={(e) => {
                            e.preventDefault();
                            (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                          }}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              <span className="text-xs">Upload</span>
                            </>
                          )}
                        </Button>
                      </label>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-400 space-y-1 border-t pt-4" style={{ borderColor: borderColor + '40' }}>
            <p><strong>💡 Recommended Sound Files:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Gear 5 Activation</strong>: Cartoon/rubber stretch sound (2-3s)</li>
              <li><strong>The World Activation</strong>: Time warp/clock stopping sound (2-3s)</li>
              <li><strong>The World Deactivation</strong>: Time resume/clock ticking (1-2s)</li>
              <li><strong>Random Attack Impact</strong>: Explosion/shockwave sound (1-2s)</li>
            </ul>
            <p className="mt-2 text-gray-500">🎵 Sounds play automatically when powers are activated or used at high strength!</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
