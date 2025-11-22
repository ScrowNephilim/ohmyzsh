/**
 * Powers Menu Component - Phase 3D
 * Floating button that unveils power controls overlay
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  USER_POWERS, 
  calculateMaxStrength, 
  generateRandomAttack,
  formatPowerText,
  getStrengthStyle,
  isPowerOnCooldown,
  getRemainingCooldown,
  isValidGeassCommand,
  type UserPower 
} from '@/lib/user-powers';
import { Zap, Target, Cloud, Clock, X } from 'lucide-react';

interface PowersMenuProps {
  activePowers: string[];
  selectedTargets: string[];
  availableTargets: Array<{ name: string; type: 'nephilim' | 'character' | 'bystander' | 'environment' }>;
  onTogglePower: (powerId: string) => void;
  onUsePower: (powerId: string, targets: string[], strength: number, geassCommand?: string) => void;
  onTargetSelect: (target: string) => void;
  onTargetDeselect: (target: string) => void;
  onRandomAttackGenerated: (attackText: string) => void; // NEW: Adds random attack text to input
  isTimeStopActive?: boolean; // PHASE 4: For strength boost display
  immersiveStyle?: { primaryColor: string; secondaryColor: string; borderColor: string; cardBackground: string; textColor: string };
}

export function PowersMenu({
  activePowers,
  selectedTargets,
  availableTargets,
  onTogglePower,
  onUsePower,
  onTargetSelect,
  onTargetDeselect,
  onRandomAttackGenerated,
  isTimeStopActive = false,
  immersiveStyle
}: PowersMenuProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [strength, setStrength] = useState(1);
  const [geassCommand, setGeassCommand] = useState('');
  const [randomAttack, setRandomAttack] = useState(generateRandomAttack(activePowers));
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const maxStrength = calculateMaxStrength(activePowers);
  
  // PHASE 4: Calculate effective strength with ALL boosts
  const gear5Boost = activePowers.includes('gear5') ? 25 : 0;
  const worldBoost = activePowers.includes('theworld') ? 30 : 0;
  const totalBoost = gear5Boost + worldBoost;
  const effectiveStrength = Math.min(strength + totalBoost, 80);
  
  console.log('[PowersMenu] 💪 Strength calculation:', { base: strength, gear5Boost, worldBoost, totalBoost, effective: effectiveStrength });

  // Update random attack when active powers change
  useEffect(() => {
    setRandomAttack(generateRandomAttack(activePowers));
  }, [activePowers]);

  // Update cooldowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newCooldowns: Record<string, number> = {};
      USER_POWERS.forEach(power => {
        const remaining = getRemainingCooldown(power);
        if (remaining > 0) {
          newCooldowns[power.id] = remaining;
        }
      });
      setCooldowns(newCooldowns);
    }, 1000);

    return () => clearInterval(interval);
  }, []);



  const handlePowerClick = (power: UserPower) => {
    // Toggle power (Gear 5 + The World)
    if (power.type === 'toggle') {
      // PHASE 4: Special handling for The World
      if (power.id === 'theworld') {
        const isActivating = !activePowers.includes('theworld');
        
        if (isActivating) {
          // Check cooldown before activating
          if (isPowerOnCooldown(power)) {
            console.log('[PowersMenu] 🌍 The World on cooldown, cannot activate');
            return;
          }
          
          console.log('[PowersMenu] 🌍 The World activating - auto-triggering time stop');
          onTogglePower(power.id); // Add to activePowers
          
          // Auto-trigger time stop sequence (sound → GIF → timer in ChromaPage)
          onUsePower(power.id, [], effectiveStrength); // Triggers time stop
        } else {
          console.log('[PowersMenu] 🌍 The World deactivating');
          onTogglePower(power.id); // Remove from activePowers (starts cooldown)
        }
      } else {
        // Gear 5 - simple toggle
        onTogglePower(power.id);
      }
      return;
    }

    // Check cooldown
    if (isPowerOnCooldown(power)) {
      return; // Don't use if on cooldown
    }

    // Random attack - generate and add directly (NOT via onUsePower)
    if (power.type === 'random') {
      const newAttack = generateRandomAttack(activePowers);
      setRandomAttack(newAttack); // Update displayed attack for next click
      onRandomAttackGenerated(newAttack); // Add formatted attack to input
      console.log('[PowersMenu] 🎲 Random attack generated:', newAttack);
      return; // Don't call onUsePower for random attacks
    }

    // Targeted power (Geass)
    if (power.type === 'targeted') {
      if (selectedTargets.length === 0) {
        alert('Select a target first');
        return;
      }
      if (!geassCommand.trim()) {
        alert('Enter a Geass command');
        return;
      }
      onUsePower(power.id, selectedTargets, strength, geassCommand);
      setGeassCommand(''); // Clear command
      return;
    }

    // Instant power (NO LONGER USED - The World is now toggle)
    if (power.type === 'instant') {
      onUsePower(power.id, [], strength);
      return;
    }
  };

  const strengthStyle = getStrengthStyle(strength);
  const gear5Active = activePowers.includes('gear5');
  const hasActivePowers = activePowers.length > 0;

  // Floating button
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full p-0 backdrop-blur-md border-2 transition-all hover:scale-110 hover:shadow-lg"
        style={{
          backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.6)',
          borderColor: hasActivePowers ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') : (immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'),
          color: immersiveStyle?.textColor || 'white'
        }}
      >
        <div className="relative">
          <Zap className="w-6 h-6" style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }} />
          {hasActivePowers && (
            <Badge 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-[10px]"
              style={{
                backgroundColor: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                color: 'black'
              }}
            >
              {activePowers.length}
            </Badge>
          )}
        </div>
      </Button>
    );
  }

  // Full menu overlay
  return (
    <div 
      className="fixed left-4 top-1/2 -translate-y-1/2 z-20 space-y-3"
      style={{ width: '220px' }}
    >
      {/* Powers Title with Close Button */}
      <Card 
        className="p-3 backdrop-blur-md border"
        style={{
          backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.4)',
          borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
          color: immersiveStyle?.textColor || 'white'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }} />
            <h3 className="font-bold text-sm">POWERS</h3>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-500/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Power Slots */}
      <div className="space-y-2">
        {USER_POWERS.map((power) => {
          const isActive = activePowers.includes(power.id);
          const onCooldown = cooldowns[power.id] !== undefined;
          const isGear5 = power.id === 'gear5';
          
          return (
            <Button
              key={power.id}
              onClick={() => handlePowerClick(power)}
              disabled={onCooldown && !isGear5}
              className="w-full h-auto p-2 text-xs font-bold border transition-all relative overflow-hidden"
              style={{
                backgroundColor: isActive && isGear5 ? power.backgroundColor : (onCooldown ? 'rgba(100,100,100,0.3)' : power.backgroundColor),
                color: power.textColor,
                borderColor: isActive && isGear5 ? 'white' : (immersiveStyle?.borderColor || 'hsl(142,70%,45%)/50'),
                ...(!isGear5 ? {} : { letterSpacing: '0.2em' }),
                fontFamily: power.id === 'theworld' ? '"Times New Roman", serif' : 
                             power.id === 'geass' ? '"Roboto", sans-serif' : 
                             '"Courier New", monospace'
              }}
            >
              {/* Gear 5 Cloud Effect */}
              {isActive && isGear5 && (
                <Cloud className="absolute top-0 right-0 w-6 h-6 text-white opacity-30 animate-pulse" />
              )}
              
              {/* Power Name */}
              <div className="flex items-center justify-between w-full">
                <span>
                  {power.id === 'random' ? `🎲 ${randomAttack}` : power.displayName}
                </span>
                {isActive && isGear5 && (
                  <Badge variant="outline" className="ml-1 text-[10px] bg-green-500/20 text-green-300 border-green-500/50">
                    ON
                  </Badge>
                )}
                {onCooldown && !isGear5 && (
                  <Badge variant="outline" className="ml-1 text-[10px] bg-orange-500/20 text-orange-300 border-orange-500/50">
                    <Clock className="w-2 h-2 mr-1" />
                    {cooldowns[power.id]}s
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Geass Command Input */}
      <Card
        className="p-2 backdrop-blur-md border"
        style={{
          backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.4)',
          borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'
        }}
      >
        <Input
          placeholder="Geass command..."
          value={geassCommand}
          onChange={(e) => setGeassCommand(e.target.value)}
          className="h-8 text-xs bg-black/50 border-pink-500/50 text-white placeholder:text-gray-500"
          style={{ fontFamily: '"Roboto", sans-serif' }}
        />
      </Card>

      {/* Strength Slider */}
      <Card 
        className="p-3 backdrop-blur-md border"
        style={{
          backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.4)',
          borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
          color: immersiveStyle?.textColor || 'white'
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold">STRENGTH</span>
            <div className="flex items-center gap-1">
              <Badge 
                className="text-xs px-2 py-0.5"
                style={{
                  ...strengthStyle,
                  fontSize: '10px'
                }}
              >
                {strength}
              </Badge>
              {/* PHASE 4: Boost Indicators */}
              {totalBoost > 0 && (
                <>
                  <span className="text-xs" style={{ color: immersiveStyle?.primaryColor || '#4ade80' }}>
                    +{totalBoost}
                  </span>
                  <Badge 
                    className="text-xs px-2 py-0.5"
                    style={{
                      backgroundColor: '#B8860B',
                      color: 'black',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    = {effectiveStrength}
                  </Badge>
                </>
              )}
            </div>
          </div>
          <Slider
            value={[strength]}
            onValueChange={(val) => setStrength(val[0])}
            min={1}
            max={maxStrength}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>1</span>
            <span className="text-center">
              {gear5Active ? '50' : '25'} 
              {activePowers.includes('gear5') && activePowers.includes('theworld') && ' → 80'}
            </span>
            <span>{maxStrength}</span>
          </div>
        </div>
      </Card>

      {/* Target Selection */}
      <Card 
        className="p-3 backdrop-blur-md border max-h-48 overflow-y-auto"
        style={{
          backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.4)',
          borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
          color: immersiveStyle?.textColor || 'white'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3 h-3" style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }} />
          <span className="text-xs font-bold">TARGETS</span>
        </div>
        <div className="space-y-1">
          {availableTargets.length === 0 ? (
            <p className="text-[10px] text-gray-500 italic">No targets available</p>
          ) : (
            availableTargets.map((target) => {
              const isSelected = selectedTargets.includes(target.name);
              return (
                <Button
                  key={target.name}
                  onClick={() => isSelected ? onTargetDeselect(target.name) : onTargetSelect(target.name)}
                  variant="outline"
                  size="sm"
                  className="w-full h-auto py-1 text-[10px] justify-start"
                  style={{
                    backgroundColor: isSelected ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)/30') : 'transparent',
                    borderColor: isSelected ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') : (immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'),
                    color: immersiveStyle?.textColor || 'white'
                  }}
                >
                  <Badge 
                    variant="outline" 
                    className="mr-2 text-[8px] px-1 py-0"
                    style={{
                      borderColor: 
                        target.type === 'nephilim' ? '#FF69B4' : 
                        target.type === 'character' ? '#FFD700' : 
                        target.type === 'environment' ? '#00CED1' : '#999'
                    }}
                  >
                    {target.type[0].toUpperCase()}
                  </Badge>
                  {target.name}
                </Button>
              );
            })
          )}
        </div>
      </Card>

      {/* Selected Targets Summary */}
      {selectedTargets.length > 0 && (
        <Card 
          className="p-2 backdrop-blur-md border"
          style={{
            backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.4)',
            borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
            color: immersiveStyle?.textColor || 'white'
          }}
        >
          <div className="text-[10px]">
            <span className="font-bold" style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }}>
              Selected: 
            </span>{' '}
            {selectedTargets.join(', ')}
          </div>
        </Card>
      )}
    </div>
  );
}
