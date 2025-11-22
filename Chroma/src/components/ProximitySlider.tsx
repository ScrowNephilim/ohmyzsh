/**
 * Proximity Slider Component
 * Visual interface for managing Nephilim spatial proximity (0-100 scale)
 * Can't go below 5 on command (below 5 is intimate territory)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  getProximityDescription, 
  distanceToKilometers, 
  getDistanceColor,
  enforceMinimumDistance,
  canInteractIntimately,
  canInteractVerbally,
  type NephilimProximity 
} from '@/lib/nephilim-proximity';
import { MapPin, X } from 'lucide-react';

interface ProximitySliderProps {
  nephilims: Array<{ name: string; distance: number }>;
  onDistanceChange: (nephilimName: string, newDistance: number) => void;
  onClose?: () => void;
  className?: string;
}

export function ProximitySlider({ nephilims, onDistanceChange, onClose, className }: ProximitySliderProps) {
  const [hoveredNephilim, setHoveredNephilim] = useState<string | null>(null);

  // Local buffered values so the user must click the Teleport/Apply button
  const [localValues, setLocalValues] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    nephilims.forEach(n => { map[n.name] = n.distance; });
    return map;
  });

  const handleLocalSliderChange = (nephilimName: string, value: number[]) => {
    const requested = value[0];
    // enforce minimum distance and clamp
    const enforced = Math.max(5, Math.min(100, Math.round(requested)));
    setLocalValues(prev => ({ ...prev, [nephilimName]: enforced }));
  };

  const applyProximityChange = (nephilimName: string) => {
    const requestedDistance = localValues[nephilimName];
    const enforcedDistance = enforceMinimumDistance(requestedDistance);
    // Block changes beyond 50 when the target is considered in a parallel universe
    // (distance > 50 is treated as 'parallel universe' and cannot be moved into directly)
    if (enforcedDistance > 50) {
      // do not apply - show a gentle console note; UI should indicate disabled state
      console.info(`Proximity change blocked: ${nephilimName} appears in a parallel universe (distance > 50)`);
      return;
    }
    onDistanceChange(nephilimName, enforcedDistance);
  };

  return (
    <Card className={`${className} w-60 max-h-[40vh] overflow-y-auto`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            clues
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
      </CardHeader>
      <CardContent className="space-y-4">
        {nephilims.map(({ name, distance }) => {
          const description = getProximityDescription(distance);
          const kilometers = distanceToKilometers(distance);
          const color = getDistanceColor(distance);
          const isHovered = hoveredNephilim === name;
          const canTalk = canInteractVerbally(distance);
          const isIntimate = canInteractIntimately(distance);
          const localValue = localValues[name] ?? distance;
          const isParallel = distance > 50; // treat >50 as parallel universe

          return (
            <div 
              key={name}
              className="space-y-2"
              onMouseEnter={() => setHoveredNephilim(name)}
              onMouseLeave={() => setHoveredNephilim(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color }}>
                    {name}
                  </span>
                  {isIntimate && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: color,
                        color,
                        backgroundColor: `${color}15`
                      }}
                    >
                      intimate
                    </Badge>
                  )}
                  {!isIntimate && canTalk && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: color,
                        color,
                        backgroundColor: `${color}15`
                      }}
                    >
                      can talk
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {description}
                  </div>
                  <div className="text-xs opacity-50">
                    ~{kilometers}
                  </div>
                </div>
              </div>

              <div className="relative">
                <Slider
                  value={[localValue]}
                  min={5}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleLocalSliderChange(name, value)}
                  className="cursor-pointer"
                  disabled={isParallel}
                  style={{
                    '--slider-color': (isParallel ? '#6b7280' : color)
                  } as React.CSSProperties}
                />

                {/* Apply / Teleport button - user must confirm change */}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs opacity-60">
                    {localValue <= 10 ? (
                      <span className="text-yellow-500">close (≤10m)</span>
                    ) : localValue <= 30 ? (
                      <span>same location (out of sight)</span>
                    ) : localValue <= 50 ? (
                      <span>same town / district</span>
                    ) : (
                      <span className="text-gray-400">parallel universe</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => applyProximityChange(name)}
                      disabled={isParallel || (localValue === distance)}
                      className={`h-7 px-2 text-xs ${isParallel ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isParallel ? 'Unavailable' : (localValue === distance ? 'Set' : 'Teleport')}
                    </Button>
                  </div>
                </div>
              </div>

              {isHovered && distance < 5 && (
                <div className="text-xs text-muted-foreground italic">
                  *can't go below 5 on command - intimate territory*
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="text-yellow-500">• <strong>Beyond 30:</strong> Use clues to find</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
