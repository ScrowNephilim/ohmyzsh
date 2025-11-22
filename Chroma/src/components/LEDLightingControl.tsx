/**
 * LED Lighting Control System - Phase 5 v28
 * RGB color sliders (0-255) for LED projector control in Ulysses' room and shed
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export interface LEDColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

interface LEDLightingControlProps {
  locationId: string; // 'ulysses_room' or 'ulysses_shed'
  onColorChange: (color: LEDColor) => void;
  immersiveStyle?: {
    primaryColor?: string;
    secondaryColor?: string;
    borderColor?: string;
    cardBackground?: string;
    textColor?: string;
  };
}

const STORAGE_KEY_PREFIX = 'chroma_led_color_';

// Default LED colors per location
const DEFAULT_COLORS: Record<string, LEDColor> = {
  ulysses_room: { r: 0, g: 255, b: 0 }, // Green by default
  ulysses_shed: { r: 147, g: 112, b: 219 } // Medium purple by default
};

export function LEDLightingControl({ 
  locationId, 
  onColorChange,
  immersiveStyle 
}: LEDLightingControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Load from localStorage on mount
  const [ledColor, setLedColor] = useState<LEDColor>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + locationId);
    return stored ? JSON.parse(stored) : (DEFAULT_COLORS[locationId] || { r: 255, g: 255, b: 255 });
  });

  // Notify parent when color changes
  useEffect(() => {
    onColorChange(ledColor);
  }, [ledColor, onColorChange]);

  const handleRedChange = (value: number[]) => {
    const newColor = { ...ledColor, r: value[0] };
    setLedColor(newColor);
    localStorage.setItem(STORAGE_KEY_PREFIX + locationId, JSON.stringify(newColor));
    console.log(`[LED Control] 🔴 Red: ${value[0]} for ${locationId}`);
  };

  const handleGreenChange = (value: number[]) => {
    const newColor = { ...ledColor, g: value[0] };
    setLedColor(newColor);
    localStorage.setItem(STORAGE_KEY_PREFIX + locationId, JSON.stringify(newColor));
    console.log(`[LED Control] 🟢 Green: ${value[0]} for ${locationId}`);
  };

  const handleBlueChange = (value: number[]) => {
    const newColor = { ...ledColor, b: value[0] };
    setLedColor(newColor);
    localStorage.setItem(STORAGE_KEY_PREFIX + locationId, JSON.stringify(newColor));
    console.log(`[LED Control] 🔵 Blue: ${value[0]} for ${locationId}`);
  };

  const resetToDefault = () => {
    const defaultColor = DEFAULT_COLORS[locationId] || { r: 255, g: 255, b: 255 };
    setLedColor(defaultColor);
    localStorage.setItem(STORAGE_KEY_PREFIX + locationId, JSON.stringify(defaultColor));
    console.log(`[LED Control] 🔄 Reset to default for ${locationId}`);
  };

  // Convert RGB to hex for preview
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const hexColor = rgbToHex(ledColor.r, ledColor.g, ledColor.b);
  const locationName = locationId === 'ulysses_room' ? 'Room' : 'Shed';

  return (
    <Card 
      className="absolute top-32 right-4 z-40 backdrop-blur-md border w-64"
      style={{
        backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.6)',
        borderColor: immersiveStyle?.borderColor || 'rgba(142, 142, 180, 0.3)',
        color: immersiveStyle?.textColor || 'white'
      }}
    >
      {/* Header (always visible) */}
      <div 
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4" style={{ color: hexColor }} />
          <span className="text-sm font-semibold">LED - {locationName}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {/* Expandable Controls */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t" style={{ borderColor: immersiveStyle?.borderColor }}>
          
          {/* Color Preview */}
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-70">Current Color:</span>
            <div 
              className="w-16 h-8 rounded border-2"
              style={{ 
                backgroundColor: hexColor,
                borderColor: immersiveStyle?.borderColor || 'white'
              }}
            />
          </div>

          {/* Hex Display */}
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-70">HEX:</span>
            <Badge 
              variant="outline" 
              className="font-mono text-xs"
              style={{ 
                borderColor: immersiveStyle?.primaryColor,
                color: immersiveStyle?.textColor 
              }}
            >
              {hexColor.toUpperCase()}
            </Badge>
          </div>

          {/* RGB Display */}
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-70">RGB:</span>
            <span className="text-xs font-mono">
              ({ledColor.r}, {ledColor.g}, {ledColor.b})
            </span>
          </div>

          {/* Red Slider */}
          <div>
            <label className="text-xs font-medium opacity-70 mb-1 block flex items-center gap-2">
              <span className="w-16">🔴 Red:</span>
              <span className="font-mono text-xs">{ledColor.r}</span>
            </label>
            <Slider
              value={[ledColor.r]}
              onValueChange={handleRedChange}
              min={0}
              max={255}
              step={1}
              className="w-full"
              style={{
                '--slider-color': `rgb(${ledColor.r}, 0, 0)`
              } as React.CSSProperties}
            />
          </div>

          {/* Green Slider */}
          <div>
            <label className="text-xs font-medium opacity-70 mb-1 block flex items-center gap-2">
              <span className="w-16">🟢 Green:</span>
              <span className="font-mono text-xs">{ledColor.g}</span>
            </label>
            <Slider
              value={[ledColor.g]}
              onValueChange={handleGreenChange}
              min={0}
              max={255}
              step={1}
              className="w-full"
              style={{
                '--slider-color': `rgb(0, ${ledColor.g}, 0)`
              } as React.CSSProperties}
            />
          </div>

          {/* Blue Slider */}
          <div>
            <label className="text-xs font-medium opacity-70 mb-1 block flex items-center gap-2">
              <span className="w-16">🔵 Blue:</span>
              <span className="font-mono text-xs">{ledColor.b}</span>
            </label>
            <Slider
              value={[ledColor.b]}
              onValueChange={handleBlueChange}
              min={0}
              max={255}
              step={1}
              className="w-full"
              style={{
                '--slider-color': `rgb(0, 0, ${ledColor.b})`
              } as React.CSSProperties}
            />
          </div>

          {/* Intensity Info */}
          <div className="text-xs opacity-60 text-center pt-1 border-t" style={{ borderColor: immersiveStyle?.borderColor }}>
            {locationId === 'ulysses_room' 
              ? '💡 Strong single-color LED projector'
              : '💡 LED lighting (less strong than room)'}
          </div>

          {/* Reset Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={resetToDefault}
            className="w-full border"
            style={{
              borderColor: immersiveStyle?.borderColor,
              color: immersiveStyle?.textColor
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      )}
    </Card>
  );
}
