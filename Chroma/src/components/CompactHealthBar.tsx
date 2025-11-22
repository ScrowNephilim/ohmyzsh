/**
 * Compact Health Bar Component
 * Small health bar displayed above Nephilim/Character names in header
 * Shows as thin bar, orange <40%, red <10%
 * Click to expand to detailed view
 */

import { useState } from 'react';
import { getHealthPercentage, type HealthEntity } from '@/lib/health-system';
import { Heart, Skull } from 'lucide-react';

interface CompactHealthBarProps {
  entity: HealthEntity;
  immersiveStyle?: { primaryColor: string; textColor: string };
}

export function CompactHealthBar({ entity, immersiveStyle }: CompactHealthBarProps) {
  const [showDetailed, setShowDetailed] = useState(false);
  const percentage = getHealthPercentage(entity);
  const isDead = entity.isDead;

  // Color logic: green >40%, orange 10-40%, red <10%
  const getBarColor = () => {
    if (isDead) return '#FF0000';
    if (percentage < 10) return '#FF0000'; // Red
    if (percentage < 40) return '#FFA500'; // Orange
    return '#00FF00'; // Green
  };

  const color = getBarColor();

  return (
    <div className="relative">
      {/* Compact Bar (Always Visible) */}
      <div 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowDetailed(!showDetailed)}
        title={`${entity.name}: ${entity.currentHealth}/${entity.maxHealth} HP - Click for details`}
      >
        <div 
          className="h-1 w-16 rounded-full overflow-hidden"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: `1px solid ${color}40`
          }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
      </div>

      {/* Detailed View (On Click) */}
      {showDetailed && (
        <div 
          className="absolute top-6 left-0 z-50 min-w-[180px] px-3 py-2 rounded-lg border backdrop-blur-md animate-fade-in"
          style={{
            backgroundColor: 'rgba(0,0,0,0.85)',
            borderColor: color,
            color: immersiveStyle?.textColor || 'white'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex items-center gap-2 mb-2">
            {isDead ? (
              <Skull className="w-4 h-4 text-red-500" />
            ) : (
              <Heart className="w-4 h-4" style={{ color }} />
            )}
            <span className="text-xs font-bold">{entity.name}</span>
            <span 
              className="text-[8px] px-1.5 py-0.5 rounded border ml-auto"
              style={{
                borderColor: entity.type === 'nephilim' ? '#FF69B4' : '#FFD700',
                color: entity.type === 'nephilim' ? '#FF69B4' : '#FFD700'
              }}
            >
              {entity.type === 'nephilim' ? 'NEPHILIM' : 'CHARACTER'}
            </span>
          </div>

          {/* Pixel Art Health Bar */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span style={{ color }}>HP:</span>
              <span className="text-white font-bold">
                {entity.currentHealth} / {entity.maxHealth}
              </span>
            </div>
            
            {/* Pixelated bar */}
            <div 
              className="h-3 rounded"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: `1px solid ${color}`,
                imageRendering: 'pixelated'
              }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color,
                  imageRendering: 'pixelated'
                }}
              />
            </div>

            {/* Status */}
            {isDead && (
              <div className="text-[10px] text-red-500 font-bold mt-1">
                {entity.type === 'nephilim' ? '⚡ STATIC FOREVER' : '💀 DEFEATED'}
              </div>
            )}
          </div>

          {/* Close hint */}
          <div className="text-[8px] text-gray-500 mt-2 text-center">
            Click outside to close
          </div>
        </div>
      )}
    </div>
  );
}
