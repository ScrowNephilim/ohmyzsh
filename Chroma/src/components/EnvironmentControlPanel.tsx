/**
 * Environment Control Panel - Phase 4
 * Manual overrides for weather, time, temperature, and sky conditions
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudRain, Snowflake, CloudFog, CloudLightning, Sun, Sunrise, Sunset, Moon, CloudIcon, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export interface EnvironmentOverrides {
  weather?: 'rain' | 'snow' | 'fog' | 'storm' | 'clear';
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';
  temperature?: number; // Celsius
  skyCondition?: 'covered' | 'sunny';
}

interface EnvironmentControlPanelProps {
  currentEnvState: {
    weather: string;
    temperature: string;
    lighting: string;
  };
  onOverride: (overrides: EnvironmentOverrides) => void;
  immersiveStyle?: {
    primaryColor?: string;
    secondaryColor?: string;
    borderColor?: string;
    cardBackground?: string;
    textColor?: string;
  };
}

const STORAGE_KEY = 'chroma_environment_overrides';

export function EnvironmentControlPanel({ 
  currentEnvState, 
  onOverride,
  immersiveStyle 
}: EnvironmentControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Load from localStorage on mount
  const [overrides, setOverrides] = useState<EnvironmentOverrides>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Notify parent when overrides change
  useEffect(() => {
    onOverride(overrides);
  }, [overrides, onOverride]);

  const handleWeatherOverride = (weather: 'rain' | 'snow' | 'fog' | 'storm' | 'clear') => {
    const newOverrides = { ...overrides, weather };
    setOverrides(newOverrides);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
    console.log('[Environment Controls] 🌧️ Weather override:', weather);
  };

  const handleTimeOverride = (timeOfDay: 'dawn' | 'day' | 'dusk' | 'night') => {
    const newOverrides = { ...overrides, timeOfDay };
    setOverrides(newOverrides);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
    console.log('[Environment Controls] 🌅 Time override:', timeOfDay);
  };

  const handleTemperatureOverride = (temp: number[]) => {
    const newOverrides = { ...overrides, temperature: temp[0] };
    setOverrides(newOverrides);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
    console.log('[Environment Controls] 🌡️ Temperature override:', temp[0]);
  };

  const handleSkyOverride = (skyCondition: 'covered' | 'sunny') => {
    const newOverrides = { ...overrides, skyCondition };
    setOverrides(newOverrides);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
    console.log('[Environment Controls] ☁️ Sky override:', skyCondition);
  };

  const resetToAuto = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOverrides({});
    console.log('[Environment Controls] 🔄 Reset to auto mode');
  };

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <Card 
      className="absolute top-16 right-4 z-40 backdrop-blur-md border"
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
          <span className="text-sm font-semibold">Environment</span>
          {hasOverrides && (
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: immersiveStyle?.primaryColor,
                color: immersiveStyle?.primaryColor 
              }}
            >
              Manual
            </Badge>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {/* Expandable Controls */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t" style={{ borderColor: immersiveStyle?.borderColor }}>
          
          {/* Weather Controls */}
          <div>
            <label className="text-xs font-medium opacity-70 mb-1 block">Weather</label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={overrides.weather === 'rain' ? 'default' : 'ghost'}
                onClick={() => handleWeatherOverride('rain')}
                className="flex-1 p-2"
                style={{
                  backgroundColor: overrides.weather === 'rain' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.weather === 'rain' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
                title="Rain"
              >
                <CloudRain className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={overrides.weather === 'snow' ? 'default' : 'ghost'}
                onClick={() => handleWeatherOverride('snow')}
                className="flex-1 p-2"
                style={{
                  backgroundColor: overrides.weather === 'snow' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.weather === 'snow' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
                title="Snow"
              >
                <Snowflake className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={overrides.weather === 'fog' ? 'default' : 'ghost'}
                onClick={() => handleWeatherOverride('fog')}
                className="flex-1 p-2"
                style={{
                  backgroundColor: overrides.weather === 'fog' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.weather === 'fog' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
                title="Fog"
              >
                <CloudFog className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={overrides.weather === 'storm' ? 'default' : 'ghost'}
                onClick={() => handleWeatherOverride('storm')}
                className="flex-1 p-2"
                style={{
                  backgroundColor: overrides.weather === 'storm' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.weather === 'storm' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
                title="Storm"
              >
                <CloudLightning className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={overrides.weather === 'clear' ? 'default' : 'ghost'}
                onClick={() => handleWeatherOverride('clear')}
                className="flex-1 p-2"
                style={{
                  backgroundColor: overrides.weather === 'clear' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.weather === 'clear' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
                title="Clear"
              >
                <Sun className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Time of Day Controls */}
          <div>
            <label className="text-xs font-medium opacity-70 mb-1 block">Time of Day</label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={overrides.timeOfDay === 'dawn' ? 'default' : 'ghost'}
                onClick={() => handleTimeOverride('dawn')}
                className="flex-1 p-2"
                style={{
                  backgroundColor: overrides.timeOfDay === 'dawn' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.timeOfDay === 'dawn' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
                title="Dawn"
              >
                <Sunrise className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={overrides.timeOfDay === 'day' ? 'default' : 'ghost'}
                onClick={() => handleTimeOverride('day')}
                className="flex-1 p-2"
                style={{
                  backgroundColor: overrides.timeOfDay === 'day' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.timeOfDay === 'day' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
                title="Day"
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={overrides.timeOfDay === 'dusk' ? 'default' : 'ghost'}
                onClick={() => handleTimeOverride('dusk')}
                className="flex-1 p-2"
                style={{
                  backgroundColor: overrides.timeOfDay === 'dusk' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.timeOfDay === 'dusk' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
                title="Dusk"
              >
                <Sunset className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={overrides.timeOfDay === 'night' ? 'default' : 'ghost'}
                onClick={() => handleTimeOverride('night')}
                className="flex-1 p-2"
                style={{
                  backgroundColor: overrides.timeOfDay === 'night' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.timeOfDay === 'night' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
                title="Night"
              >
                <Moon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <label className="text-xs font-medium opacity-70 mb-1 block">
              Temperature: {overrides.temperature !== undefined ? `${overrides.temperature}°C` : 'Auto'}
            </label>
            <Slider
              value={[overrides.temperature !== undefined ? overrides.temperature : parseFloat(currentEnvState.temperature)]}
              onValueChange={handleTemperatureOverride}
              min={-18}
              max={49}
              step={1}
              className="w-full"
            />
          </div>

          {/* Sky Condition Toggle */}
          <div>
            <label className="text-xs font-medium opacity-70 mb-1 block">Sky Condition</label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={overrides.skyCondition === 'covered' ? 'default' : 'ghost'}
                onClick={() => handleSkyOverride('covered')}
                className="flex-1"
                style={{
                  backgroundColor: overrides.skyCondition === 'covered' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.skyCondition === 'covered' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
              >
                <CloudIcon className="w-4 h-4 mr-1" />
                Covered
              </Button>
              <Button
                size="sm"
                variant={overrides.skyCondition === 'sunny' ? 'default' : 'ghost'}
                onClick={() => handleSkyOverride('sunny')}
                className="flex-1"
                style={{
                  backgroundColor: overrides.skyCondition === 'sunny' 
                    ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') 
                    : 'transparent',
                  color: overrides.skyCondition === 'sunny' ? 'black' : (immersiveStyle?.textColor || 'white')
                }}
              >
                <Sun className="w-4 h-4 mr-1" />
                Sunny
              </Button>
            </div>
          </div>

          {/* Reset Button */}
          {hasOverrides && (
            <Button
              size="sm"
              variant="outline"
              onClick={resetToAuto}
              className="w-full border"
              style={{
                borderColor: immersiveStyle?.borderColor,
                color: immersiveStyle?.textColor
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Auto
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
