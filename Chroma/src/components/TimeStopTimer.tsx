/**
 * Time Stop Timer - The World countdown overlay
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface TimeStopTimerProps {
  isActive: boolean;
  duration: number; // 15 or 60 seconds based on power strength
  onComplete: () => void;
}

export function TimeStopTimer({ isActive, duration, onComplete }: TimeStopTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setTimeRemaining(duration);
      setShowCountdown(false);
      return;
    }

    // Reset to new duration when activated
    setTimeRemaining(duration);

    // Start countdown
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 10) {
          setShowCountdown(true); // Show countdown at 10s
        }
        
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  // Only show countdown when below 10s or at 5-4-3-2-1-0
  const shouldShow = timeRemaining <= 10;

  return (
    <>
      {/* Full screen negative colors overlay with expanding circle animation */}
      <div 
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{
          filter: 'invert(1) hue-rotate(180deg)',
          animation: 'expand-circle 1s ease-out forwards',
          background: 'transparent'
        }}
      />
    </>
  );
}
