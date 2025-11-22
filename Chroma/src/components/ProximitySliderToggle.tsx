/**
 * Proximity Slider Toggle Component
 * Click-to-reveal proximity slider for individual Nephilims
 * Toggles on/off when clicking Nephilim name, no permanent UI space
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  getProximityDescription, 
  distanceToKilometers, 
  getDistanceColor,
  enforceMinimumDistance,
  canInteractIntimately,
  canInteractVerbally,
} from '@/lib/nephilim-proximity';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProximitySliderToggleProps {
  nephilimName: string;
  distance: number;
  inAlternateDimension?: boolean;
  onDistanceChange: (newDistance: number) => void;
  onClose: () => void;
  className?: string;
}

export function ProximitySliderToggle({ 
  nephilimName, 
  distance, 
  inAlternateDimension = false,
  onDistanceChange, 
  onClose,
  className 
}: ProximitySliderToggleProps) {
  const handleSliderChange = (value: number[]) => {
    const requestedDistance = value[0];
    const enforcedDistance = enforceMinimumDistance(requestedDistance);
    onDistanceChange(enforcedDistance);
  };

  // If in alternate dimension, show special text
  if (inAlternateDimension) {
    return (
      <Card className={`${className} animate-in fade-in duration-200`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">{nephilimName}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center py-3">
            <p className="text-sm text-muted-foreground italic">
              *another dimension*
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Proximity can't be adjusted across dimensions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const description = getProximityDescription(distance);
  const kilometers = distanceToKilometers(distance);
  const color = getDistanceColor(distance);
  const canTalk = canInteractVerbally(distance);
  const isIntimate = canInteractIntimately(distance);

  return (
    <Card className={`${className} animate-in fade-in duration-200`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color }} />
            <span className="text-sm font-medium" style={{ color }}>
              {nephilimName}
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
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{description}</span>
            <span className="opacity-50">~{kilometers}</span>
          </div>

          <Slider
            value={[distance]}
            min={5}
            max={100}
            step={1}
            onValueChange={handleSliderChange}
            className="cursor-pointer"
            style={{
              '--slider-color': color
            } as React.CSSProperties}
          />
          
          {/* Distance markers */}
          <div className="flex justify-between text-[10px] opacity-50">
            <span>5</span>
            <span>30</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {distance < 5 && (
          <div className="text-xs text-muted-foreground italic mt-2 pt-2 border-t border-border/50">
            *can't go below 5 on command - intimate territory*
          </div>
        )}
      </CardContent>
    </Card>
  );
}
