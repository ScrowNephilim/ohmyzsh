/**
 * Health Bar Component - Display health for Nephilims and Characters
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Skull } from 'lucide-react';
import { 
  getHealthPercentage, 
  getHealthBarColor, 
  formatHealthDisplay,
  type HealthEntity 
} from '@/lib/health-system';

interface HealthBarProps {
  entity: HealthEntity;
  immersiveStyle?: { primaryColor: string; borderColor: string; cardBackground: string; textColor: string };
}

export function HealthBar({ entity, immersiveStyle }: HealthBarProps) {
  const percentage = getHealthPercentage(entity);
  const color = getHealthBarColor(percentage);
  const isDead = entity.isDead;

  return (
    <Card
      className="px-3 py-2 backdrop-blur-md border inline-flex items-center gap-2 min-w-[200px]"
      style={{
        backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.6)',
        borderColor: isDead ? '#ff0000' : (immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'),
        color: immersiveStyle?.textColor || 'white'
      }}
    >
      {/* Icon */}
      {isDead ? (
        <Skull className="w-4 h-4 text-red-500" />
      ) : (
        <Heart className="w-4 h-4" style={{ color }} />
      )}

      {/* Name and Type Badge */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">{entity.name}</span>
          <Badge 
            variant="outline" 
            className="text-[8px] px-1 py-0"
            style={{
              borderColor: entity.type === 'nephilim' ? '#FF69B4' : '#FFD700',
              color: entity.type === 'nephilim' ? '#FF69B4' : '#FFD700'
            }}
          >
            {entity.type === 'nephilim' ? 'N' : 'C'}
          </Badge>
        </div>

        {/* Health Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>

        {/* Health Numbers */}
        <div className="text-[10px] text-gray-400">
          {formatHealthDisplay(entity)}
          {isDead && (
            <span className="ml-2 text-red-500 font-bold">
              {entity.type === 'nephilim' ? 'STATIC FOREVER' : 'DEFEATED'}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
