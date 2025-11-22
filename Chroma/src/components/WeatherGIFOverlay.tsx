/**
 * Weather GIF Overlay Component - Phase 4
 * Manual weather effect toggles with pixelated GIF overlays
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CloudRain, Snowflake, Sun } from 'lucide-react';
import { replicate, imageGen } from '@devvai/devv-code-backend';

interface WeatherGIFOverlayProps {
  currentWeather: 'rain' | 'snow' | 'clear' | 'storm' | 'fog';
  onWeatherOverride: (weather: string) => void;
  immersiveStyle?: {
    primaryColor?: string;
    secondaryColor?: string;
    borderColor?: string;
    cardBackground?: string;
    textColor?: string;
  };
}

export function WeatherGIFOverlay({ 
  currentWeather, 
  onWeatherOverride, 
  immersiveStyle 
}: WeatherGIFOverlayProps) {
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualWeather, setManualWeather] = useState(currentWeather);
  const hasUserInteractedRef = useRef(false); // ✅ Track if user manually clicked

  // ✅ FIX: Only generate GIF when USER manually clicks (not on auto weather changes)
  useEffect(() => {
    if (manualWeather !== 'clear' && hasUserInteractedRef.current) {
      generateWeatherGIF(manualWeather);
    } else if (manualWeather === 'clear' && hasUserInteractedRef.current) {
      setGifUrl(null); // Clear overlay when "Clear" selected by user
    }
    // Note: If hasUserInteracted is false, weather changes from API won't trigger generation
  }, [manualWeather]);

  const generateWeatherGIF = async (weather: string) => {
    setIsGenerating(true);
    console.log('[Weather GIF] 🌧️ Generating overlay for:', weather);
    
    try {
      // Determine prompt based on weather type
      let prompt = '';
      if (weather === 'rain' || weather === 'storm') {
        prompt = 'Highly pixelated 8-bit retro transparent overlay, diagonal rain droplets falling from top-left to bottom-right, seamless loop animation, transparent background, chunky square pixels, 16-bit video game style';
      } else if (weather === 'snow') {
        prompt = 'Highly pixelated 8-bit retro transparent overlay, snowflakes drifting down slowly, seamless loop animation, transparent background, chunky square pixels, 16-bit video game style';
      } else if (weather === 'fog') {
        prompt = 'Highly pixelated 8-bit retro transparent overlay, thick fog clouds moving horizontally, seamless loop animation, transparent background, chunky square pixels, 16-bit video game style';
      }

      // Try Replicate first (fastest)
      try {
        console.log('[Weather GIF] 🚀 Calling Replicate with prompt:', prompt.substring(0, 50) + '...');
        
        const replicateResult = await replicate.textToImage({
          model: 'black-forest-labs/flux-schnell',
          prompt,
          aspect_ratio: '16:9',
          output_format: 'png'
          // Note: num_inference_steps removed - flux-schnell handles this internally
        });

        console.log('[Weather GIF] 📦 Replicate response:', replicateResult);
        
        if (replicateResult.images && replicateResult.images.length > 0) {
          console.log('[Weather GIF] ✅ Replicate success:', replicateResult.images[0]);
          setGifUrl(replicateResult.images[0]);
          return;
        } else {
          console.warn('[Weather GIF] ⚠️ Replicate returned no images, trying DevvAI fallback');
        }
      } catch (replicateErr: any) {
        console.error('[Weather GIF] ❌ Replicate failed:', {
          message: replicateErr?.message || 'Unknown error',
          errCode: replicateErr?.errCode,
          errMsg: replicateErr?.errMsg,
          fullError: replicateErr
        });
        console.log('[Weather GIF] 🔄 Falling back to DevvAI...');
      }

      // Fallback to DevvAI
      const devvResult = await imageGen.textToImage({
        prompt: `Pixelated 8-bit ${weather} effect overlay, transparent background, looping animation style, retro video game graphics`,
        aspect_ratio: '16:9'
      });

      if (devvResult.images && devvResult.images.length > 0) {
        console.log('[Weather GIF] ✅ DevvAI success:', devvResult.images[0]);
        setGifUrl(devvResult.images[0]);
      } else {
        console.error('[Weather GIF] ❌ Both services failed');
      }

    } catch (err) {
      console.error('[Weather GIF] ❌ Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWeatherChange = (weather: 'rain' | 'snow' | 'clear') => {
    console.log('[Weather GIF] 🔄 Manual override:', weather);
    hasUserInteractedRef.current = true; // ✅ Mark that user has manually interacted
    setManualWeather(weather);
    onWeatherOverride(weather);
  };

  return (
    <>
      {/* GIF Overlay */}
      {gifUrl && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <img 
            src={gifUrl} 
            alt="Weather effect" 
            className="w-full h-full object-cover opacity-70" 
            style={{ mixBlendMode: 'screen' }} // Blend mode for better visibility
          />
        </div>
      )}

      {/* Loading Indicator */}
      {isGenerating && (
        <div 
          className="absolute top-24 right-4 z-30 backdrop-blur-md p-2 rounded-full border"
          style={{
            backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.6)',
            borderColor: immersiveStyle?.borderColor || 'rgba(142, 142, 180, 0.3)'
          }}
        >
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: immersiveStyle?.primaryColor }} />
        </div>
      )}


    </>
  );
}
