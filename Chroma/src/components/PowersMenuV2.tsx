/**
 * Powers Menu Component - Phase 5 v6: Collapsible Optimization
 * Added collapsible sections for 62% space reduction and better UX
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  USER_POWERS, 
  calculateMaxStrength,
  formatPowerText,
  getStrengthStyle,
  isPowerOnCooldown,
  getRemainingCooldownBubbles,
  canActivatePower,
  getTotalBubbleCount,
  isTargetInRange,
  getPowerCombinationDescription,
  type UserPower 
} from '@/lib/user-powers-v2';
import { Zap, Target, Cloud, Clock, X, Sword, Eye, Flame, Moon, Waves, ChevronDown, ChevronUp, Swords, Gauge, Shield, Sun, AlertTriangle } from 'lucide-react';

// Helper function to get range description in km
function getRangeDescription(range: number | undefined): string {
  if (!range) return 'Self-targeting only';
  
  switch(range) {
    case 10:
      return 'Range 10 (~10m)';
    case 20:
      return 'Range 20 (~1km)';
    case 30:
      return 'Range 30 (~20km)';
    default:
      return `Range ${range}`;
  }
}

// Helper function to get full skill tooltip with description and range
function getSkillTooltip(name: string, description: string, range?: number): string {
  const rangeInfo = getRangeDescription(range);
  return `${name}: ${description} ${rangeInfo}`;
}

interface PowersMenuV2Props {
  activePowers: string[];
  selectedTargets: string[];
  availableTargets: Array<{ name: string; type: 'nephilim' | 'character' | 'bystander' | 'environment' | 'self' }>;
  onTogglePower: (powerId: string) => void;
  onUsePower: (powerId: string, targets: string[], strength: number) => void;
  onTargetSelect: (target: string) => void;
  onTargetDeselect: (target: string) => void;
  onAddPowerToInput: (powerText: string) => void;
  isTimeStopActive?: boolean;
  timeStopCountdown?: number;
  immersiveStyle?: { primaryColor: string; secondaryColor: string; borderColor: string; cardBackground: string; textColor: string };
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: string | number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  immersiveStyle?: { primaryColor: string; borderColor: string; cardBackground: string; textColor: string };
}

function CollapsibleSection({ title, icon: Icon, badge, isExpanded, onToggle, children, immersiveStyle }: CollapsibleSectionProps) {
  return (
    <Card 
      className="backdrop-blur-md border overflow-hidden transition-all"
      style={{
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderColor: isExpanded ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') : (immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'),
        color: immersiveStyle?.textColor || 'white'
      }}
    >
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }} />
          <h3 className="font-bold text-sm">{title}</h3>
          {badge !== undefined && (
            <Badge 
              className="text-[10px]"
              style={{
                backgroundColor: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                color: 'black'
              }}
            >
              {badge}
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Content - Collapsible */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 animate-in fade-in-50 duration-200">
          {children}
        </div>
      )}
    </Card>
  );
}

export function PowersMenuV2({
  activePowers,
  selectedTargets,
  availableTargets,
  onTogglePower,
  onUsePower,
  onTargetSelect,
  onTargetDeselect,
  onAddPowerToInput,
  isTimeStopActive = false,
  timeStopCountdown = 60,
  immersiveStyle
}: PowersMenuV2Props) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [strength, setStrength] = useState(1);
  const [geassCommand, setGeassCommand] = useState('');
  const [yamiActiveCountdown, setYamiActiveCountdown] = useState<number | null>(null);
  const [yamiActivationBubble, setYamiActivationBubble] = useState<number | null>(null);
  const [showSeppukuDialog, setShowSeppukuDialog] = useState(false);
  const [pendingSeppukuPower, setPendingSeppukuPower] = useState<{ power: UserPower; targets: string[]; strength: number } | null>(null);
  
  // Collapsible section state - toggles now collapsible too
  const [expandedSections, setExpandedSections] = useState({
    toggles: false,
    attacks: false,
    strength: false,
    targets: false
  });
  
  const maxStrength = calculateMaxStrength(activePowers);
  
  // Calculate effective strength with ALL boosts
  const gear5Boost = activePowers.includes('gear5') ? 25 : 0;
  const colorKingBoost = activePowers.includes('coloroftheking') ? 40 : 0;
  const worldBoost = activePowers.includes('theworld') ? 30 : 0;
  const totalBoost = Math.max(gear5Boost, colorKingBoost) + worldBoost;
  const effectiveStrength = Math.min(strength + totalBoost, 100);
  
  console.log('[PowersMenuV2] 💪 Strength calculation:', { 
    base: strength, 
    gear5Boost, 
    colorKingBoost, 
    worldBoost, 
    totalBoost, 
    effective: effectiveStrength,
    max: maxStrength
  });

  // Auto-expand sections based on context
  useEffect(() => {
    // NO auto-expand for Toggles - user controls visibility even with active powers
    
    // Auto-expand Attack Moves when Gear 5 or Rocks active
    if ((activePowers.includes('gear5') || activePowers.includes('coloroftheking')) && !expandedSections.attacks) {
      console.log('[PowersMenuV2] 🔓 Auto-expanding Attack Moves section');
      setExpandedSections(prev => ({ ...prev, attacks: true }));
    }
    
    // NO auto-expand for Target Selection - user must manually expand even when targets selected
  }, [activePowers, selectedTargets.length, expandedSections.attacks]);

  // Yami countdown timer (30s)
  useEffect(() => {
    if (yamiActiveCountdown !== null && yamiActiveCountdown > 0) {
      const interval = setInterval(() => {
        setYamiActiveCountdown(prev => {
          if (prev === null || prev <= 1) {
            console.log('[闇] ⚫ Black hole collapsed - Liberation!');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [yamiActiveCountdown]);

  const toggleSection = (section: 'toggles' | 'attacks' | 'strength' | 'targets') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    console.log(`[PowersMenuV2] 🔄 Toggled ${section} section: ${!expandedSections[section]}`);
  };

  const handlePowerClick = (power: UserPower) => {
    // Block all actions when time stop countdown = 0
    if (isTimeStopActive && timeStopCountdown === 0) {
      toast({
        title: "Time Is Frozen",
        description: "Cannot act at countdown 0. Type a message to resume time.",
        variant: "destructive"
      });
      return;
    }

    // Toggle powers (Gear 5, The World, Color of the King's Haki)
    if (power.type === 'toggle') {
      const isActivating = !activePowers.includes(power.id);
      
      if (isActivating) {
        // Check if can activate (mutual exclusivity + cooldown)
        const check = canActivatePower(power.id, activePowers);
        if (!check.canActivate) {
          toast({
            title: "Cannot Activate",
            description: check.reason,
            variant: "destructive"
          });
          return;
        }
        
        console.log(`[PowersMenuV2] ⚡ Activating ${power.name}`);
        onTogglePower(power.id);
        
        // The World auto-triggers time stop (visual effects only, NO chat text)
        if (power.id === 'theworld') {
          console.log('[The World] 🌍 Time stop activated (toggle only, no chat text)');
          onUsePower(power.id, [], effectiveStrength);
        }
      } else {
        console.log(`[PowersMenuV2] ⚡ Deactivating ${power.name}`);
        onTogglePower(power.id);
      }
      return;
    }

    // Targeted powers (廃止, 深淵, 闇) and utility (心綱)
    if (power.type === 'targeted' || power.type === 'utility') {
      // Check cooldown
      if (isPowerOnCooldown(power)) {
        const remaining = getRemainingCooldownBubbles(power);
        toast({
          title: "On Cooldown",
          description: `${remaining} bubble${remaining > 1 ? 's' : ''} remaining`,
          variant: "destructive"
        });
        return;
      }

      // 闇 special handling (double-click for Kurouzu)
      if (power.id === 'yami') {
        if (yamiActiveCountdown !== null) {
          // Second click → Kurouzu (pull targets closer)
          console.log('[闇] 🌀 Kurouzu activated - pulling targets 20 proximity closer');
          const powerText = formatPowerText('闇: Kurouzu', selectedTargets, effectiveStrength);
          onAddPowerToInput(powerText);
          return;
        } else {
          // First click → Activate black hole prison
          if (selectedTargets.length === 0) {
            toast({
              title: "Select Target",
              description: "Select target(s) for 闇 (Darkness)",
              variant: "destructive"
            });
            return;
          }
          
          console.log('[闇] ⚫ Black hole prison activated - 30s duration');
          setYamiActiveCountdown(30);
          setYamiActivationBubble(getTotalBubbleCount());
          
          const powerText = formatPowerText('闇', selectedTargets, effectiveStrength);
          onAddPowerToInput(powerText);
          return;
        }
      }

      // 心綱 (no targets needed, utility)
      if (power.id === 'shinkou') {
        if (selectedTargets.length === 0) {
          toast({
            title: "Select Target",
            description: "Select target(s) to predict actions",
            variant: "destructive"
          });
          return;
        }
        
        console.log('[心綱] 👁️ Observation Haki - predicting next 3 actions');
        const powerText = formatPowerText('心綱', selectedTargets, 1);
        onAddPowerToInput(powerText);
        return;
      }

      // 廃止 and 深淵 (standard targeted)
      if (selectedTargets.length === 0) {
        toast({
          title: "Select Target",
          description: `Select target(s) for ${power.name}`,
          variant: "destructive"
        });
        return;
      }
      
      // Check for seppuku confirmation (self-targeting with damaging uchigatana moves)
      if (power.requiresSeppukuConfirmation && selectedTargets.includes('Ulysses')) {
        setPendingSeppukuPower({ power, targets: selectedTargets, strength: effectiveStrength });
        setShowSeppukuDialog(true);
        return;
      }
      
      console.log(`[PowersMenuV2] ⚔️ Using ${power.name} on ${selectedTargets.join(', ')}`);
      const powerText = formatPowerText(power.displayName, selectedTargets, effectiveStrength);
      onAddPowerToInput(powerText);
      
      // Mark last used (for cooldown tracking)
      power.lastUsed = getTotalBubbleCount();
      
      return;
    }
  };
  
  const handleGeassCommand = () => {
    if (!geassCommand.trim()) {
      toast({
        title: "Enter Command",
        description: "Type a Geass command first",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedTargets.length === 0) {
      toast({
        title: "Select Target",
        description: "Select target(s) for Geass command",
        variant: "destructive"
      });
      return;
    }
    
    const powerText = `*Geass: ${geassCommand} → ${selectedTargets.join(', ')}* [${effectiveStrength}]`;
    onAddPowerToInput(powerText);
    setGeassCommand(''); // Clear after sending
  };

  const hasActivePowers = activePowers.length > 0;
  const gear5Power = USER_POWERS.find(p => p.id === 'gear5')!;
  const worldPower = USER_POWERS.find(p => p.id === 'theworld')!;
  const colorKingPower = USER_POWERS.find(p => p.id === 'coloroftheking')!;
  const baseAttacks = USER_POWERS.filter(p => p.slot === 0); // Base attacks (always visible)
  const slot4Powers = USER_POWERS.filter(p => p.slot === 4); // 廃止, 心綱, 深淵, 闇

  // Floating button
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full p-0 backdrop-blur-md border-2 transition-all hover:scale-110 hover:shadow-lg"
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
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
    <TooltipProvider delayDuration={200}>
      <div 
        className="fixed left-4 top-4 z-20 space-y-3 max-h-[85vh] overflow-y-auto custom-scrollbar"
        style={{ width: '240px' }}
      >
      {/* Strength Slider with Close Button */}
      <Card 
        className="p-3 backdrop-blur-md border"
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
          color: immersiveStyle?.textColor || 'white'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4" style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }} />
            <div className="flex items-center gap-1">
              <span className="text-[10px] opacity-70">Strength:</span>
              {gear5Boost > 0 && <Badge className="text-[8px] bg-white/20">+{gear5Boost}</Badge>}
              {colorKingBoost > 0 && <Badge className="text-[8px] bg-black/60 text-red-500">+{colorKingBoost}</Badge>}
              {worldBoost > 0 && <Badge className="text-[8px] bg-yellow-600/60">+{worldBoost}</Badge>}
              <span className="text-sm font-bold" style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }}>{effectiveStrength}</span>
            </div>
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
        <Slider
          value={[strength]}
          onValueChange={(values) => {
            setStrength(values[0]);
            console.log(`[PowersMenuV2] 📊 Strength adjusted: ${values[0]} (effective: ${Math.min(values[0] + totalBoost, 100)})`);
          }}
          min={1}
          max={maxStrength}
          step={1}
          className="w-full"
        />
      </Card>

      {/* COLLAPSIBLE SECTION 0: POWER TOGGLES - MORE COMPACT h-8 */}
      <CollapsibleSection
        title="Power Toggles"
        icon={Zap}
        badge={activePowers.length > 0 ? activePowers.length : undefined}
        isExpanded={expandedSections.toggles}
        onToggle={() => toggleSection('toggles')}
        immersiveStyle={immersiveStyle}
      >
        <div className="space-y-1.5">
          {/* SLOT 1: Gear 5 - COMPACT h-8 with NEON CONTOUR when active */}
          <Button
            onClick={() => handlePowerClick(gear5Power)}
            className={`w-full h-8 text-[10px] font-bold border-2 transition-all relative ${
              activePowers.includes('gear5') ? 'gear5-neon-active' : ''
            }`}
            style={{
              background: activePowers.includes('gear5') 
                ? 'linear-gradient(to bottom, white, #F5F5F5, #E5E5E5)' 
                : 'rgba(255,255,255,0.2)',
              color: 'black',
              letterSpacing: '0.2em',
              fontFamily: '"Courier New", monospace'
            }}
          >
            {activePowers.includes('gear5') && (
              <Cloud className="absolute top-0.5 right-0.5 w-4 h-4 text-gray-400 opacity-50 animate-pulse" />
            )}
            <span>{gear5Power.displayName}</span>
          </Button>

          {/* SLOT 2: The World - COMPACT h-8 */}
          <Button
            onClick={() => handlePowerClick(worldPower)}
            disabled={isPowerOnCooldown(worldPower)}
            className="w-full h-8 text-[10px] font-bold border-2 transition-all"
            style={{
              backgroundColor: activePowers.includes('theworld') ? '#B8860B' : 
                              isPowerOnCooldown(worldPower) ? 'rgba(100,100,100,0.3)' : '#8B7355',
              color: 'white',
              letterSpacing: '0.1em',
              fontFamily: '"Times New Roman", serif',
              fontWeight: 900
            }}
          >
            <div className="flex items-center justify-between w-full">
              <span>{worldPower.displayName}</span>
              <div className="flex items-center gap-1">
                {isTimeStopActive && activePowers.includes('theworld') && timeStopCountdown !== undefined && timeStopCountdown <= 10 && (
                  <Badge className="text-[8px] bg-yellow-500 text-black animate-pulse">
                    {timeStopCountdown === 0 ? 'Type to resume' : `${timeStopCountdown}s`}
                  </Badge>
                )}
                {isPowerOnCooldown(worldPower) && (
                  <Badge className="text-[8px] bg-red-500 text-white">
                    {getRemainingCooldownBubbles(worldPower)} 🗨️
                  </Badge>
                )}
              </div>
            </div>
          </Button>

          {/* SLOT 3: Color of the King's Haki (Rocks D. Xebec) - BIGGER FONT 14px */}
          <Button
            onClick={() => handlePowerClick(colorKingPower)}
            className="w-full h-10 text-[14px] font-bold transition-all"
            style={{
              backgroundColor: activePowers.includes('coloroftheking') 
                ? 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(139,139,139,1))'
                : 'transparent',
              color: '#000000',
              letterSpacing: '0.05em',
              fontFamily: '"Times New Roman", serif',
              fontWeight: 900,
              border: '2px solid #FF0000'
            }}
          >
            <span style={{ color: '#000', fontWeight: 900 }}>{colorKingPower.displayName}</span>
          </Button>
        </div>
      </CollapsibleSection>

      {/* COLLAPSIBLE SECTION 1: ATTACK MOVES */}
      <CollapsibleSection
        title="Attack Moves"
        icon={Swords}
        badge={(activePowers.includes('gear5') || activePowers.includes('coloroftheking')) ? '⚡' : undefined}
        isExpanded={expandedSections.attacks}
        onToggle={() => toggleSection('attacks')}
        immersiveStyle={immersiveStyle}
      >
        {/* BASE ATTACKS - ALWAYS VISIBLE, HORIZONTAL ROW */}
        <div className="flex gap-1 mb-2">
          {baseAttacks.map((power, index) => {
            // Override slot 0 (Armament Koka 🛡️) with Observation Haki button
            if (index === 0) {
              return (
                <Tooltip key="observation_haki_override" delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => {
                        // Observation Haki requires targets
                        if (selectedTargets.length === 0) {
                          toast({
                            title: "Select Target",
                            description: "Select target(s) for Observation Haki",
                            variant: "destructive"
                          });
                          return;
                        }
                        onAddPowerToInput(`*Observation Haki* [${strength}]`);
                      }}
                      className="flex-1 h-10 text-xs font-bold border transition-all flex items-center justify-center"
                      style={{
                        background: 'rgba(138,43,226,0.6)',
                        color: 'white',
                        borderColor: 'rgba(138,43,226,0.8)'
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="text-xs backdrop-blur-lg text-center max-w-[250px]"
                    style={{
                      backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.95)',
                      color: immersiveStyle?.textColor || 'white',
                      borderColor: immersiveStyle?.primaryColor || 'rgba(138,43,226,0.7)',
                      opacity: 0.95
                    }}
                  >
                    👁️ Observation Haki: Predict 3 future actions. Range 30 (~20km)
                  </TooltipContent>
                </Tooltip>
              );
            }
            
            return (
              <Tooltip key={power.id} delayDuration={200}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      // Handle self-target only powers
                      if (power.selfTargetOnly) {
                        const powerText = formatPowerText(power.displayName, ['Ulysses'], strength);
                        onAddPowerToInput(powerText);
                      } else {
                        // Check if targets selected
                        if (selectedTargets.length === 0) {
                          toast({
                            title: "Select Target",
                            description: `Select target(s) for ${power.name}`,
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        // Check for seppuku confirmation (self-targeting with damaging uchigatana moves)
                        if (power.requiresSeppukuConfirmation && selectedTargets.includes('Ulysses')) {
                          setPendingSeppukuPower({ power, targets: selectedTargets, strength });
                          setShowSeppukuDialog(true);
                          return;
                        }
                        
                        const powerText = formatPowerText(power.displayName, selectedTargets, strength);
                        onAddPowerToInput(powerText);
                      }
                    }}
                    className="flex-1 h-10 text-xs font-bold transition-all flex items-center justify-center"
                    style={{
                      background: power.backgroundColor,
                      color: power.textColor,
                      border: 'none'
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 900 }}>{power.displayName}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="text-xs backdrop-blur-lg text-center max-w-[250px]"
                  style={{
                    backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.95)',
                    color: immersiveStyle?.textColor || 'white',
                    borderColor: immersiveStyle?.primaryColor || 'rgba(138,43,226,0.7)',
                    opacity: 0.95
                  }}
                >
                  {getSkillTooltip(power.displayName, power.description, power.range)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* GEAR 5 ATTACKS - VISIBLE WHEN GEAR 5 ACTIVE, 1 HORIZONTAL ROW */}
        {activePowers.includes('gear5') && (
          <div className="flex gap-1 mb-2">
            {/* Red Roc - 𝐑𝐞𝐝 𝐑𝐨𝐜 text, toned-down red background */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onAddPowerToInput(`*Gomu Gomu No: Red Roc* [${strength}]`)}
                  className="flex-1 h-8 text-xs font-bold transition-all flex items-center justify-center"
                  style={{
                    background: '#C84C4C',
                    color: 'black',
                    border: 'none'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: '"Times New Roman", serif' }}>ᴿᴱᴰ ᴿᴼᶜ</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="text-xs backdrop-blur-lg text-center max-w-[250px]"
                style={{
                  backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.95)',
                  color: immersiveStyle?.textColor || 'white',
                  borderColor: immersiveStyle?.primaryColor || 'rgba(138,43,226,0.7)',
                  opacity: 0.95
                }}
              >
                🔥 Red Roc: Haki-imbued fire punch. Range 30 (~20km)
              </TooltipContent>
            </Tooltip>
            
            {/* Supreme Armament - ▲ 覇王 (Self-target imbue: uchigatana, fists, head + defense) */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onAddPowerToInput(`*Supreme Armament: Imbue* [${strength}]`)}
                  className="flex-1 h-8 text-xs font-bold transition-all flex items-center justify-center gap-1"
                  style={{
                    background: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: 'inset 0 0 10px rgba(255,0,0,0.3)'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 900 }}>▲</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: '"Noto Serif JP", serif' }}>覇王</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="text-xs backdrop-blur-lg text-center max-w-[250px]"
                style={{
                  backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.95)',
                  color: immersiveStyle?.textColor || 'white',
                  borderColor: immersiveStyle?.primaryColor || 'rgba(138,43,226,0.7)',
                  opacity: 0.95
                }}
              >
                🛡️ Supreme Armament: Imbue weapons with Supreme King Haki. Self-only.
              </TooltipContent>
            </Tooltip>
            
            {/* Observation Haki - Eye icon only, darker purple background */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onAddPowerToInput(`*Observation Haki* [${strength}]`)}
                  className="flex-1 h-8 text-xs font-bold transition-all flex items-center justify-center"
                  style={{
                    background: 'rgba(138,43,226,0.6)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="text-xs backdrop-blur-lg text-center max-w-[250px]"
                style={{
                  backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.95)',
                  color: immersiveStyle?.textColor || 'white',
                  borderColor: immersiveStyle?.primaryColor || 'rgba(138,43,226,0.7)',
                  opacity: 0.95
                }}
              >
                👁️ Observation Haki: Predict 3 future actions. Range 30 (~20km)
              </TooltipContent>
            </Tooltip>
            
            {/* Dawn Gatling - Waves icon only, solid light blue background */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onAddPowerToInput(`*Gomu Gomu No: Dawn Gatling* [${strength}]`)}
                  className="flex-1 h-8 text-xs font-bold transition-all flex items-center justify-center"
                  style={{
                    background: '#87CEEB',
                    color: 'white',
                    border: 'none',
                    boxShadow: 'inset 0 0 8px rgba(255,255,255,0.2)'
                  }}
                >
                  <Waves className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="text-xs backdrop-blur-lg text-center max-w-[250px]"
                style={{
                  backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.95)',
                  color: immersiveStyle?.textColor || 'white',
                  borderColor: immersiveStyle?.primaryColor || 'rgba(138,43,226,0.7)',
                  opacity: 0.95
                }}
              >
                🌊 Dawn Gatling: Rapid punch barrage. Range 30 (~20km)
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Geass Command Input - RESTORED */}
        <div className="space-y-1 mb-2">
          <label className="text-[10px] opacity-70">Geass Command</label>
          <div className="flex gap-1">
            <Input
              value={geassCommand}
              onChange={(e) => setGeassCommand(e.target.value)}
              placeholder="e.g., sleep, obey..."
              className="h-8 text-xs bg-black/30 border-pink-500/30 text-pink-300 placeholder:text-pink-500/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGeassCommand();
                }
              }}
            />
            <Button
              onClick={handleGeassCommand}
              size="sm"
              className="h-8 px-2 bg-pink-600 hover:bg-pink-700 text-white"
            >
              Send
            </Button>
          </div>
        </div>

        {/* SLOT 4: 4 Attack Buttons - CONDITIONAL VISIBILITY, HORIZONTAL ROW, COMPACT */}
        {activePowers.includes('coloroftheking') && (
          <div className="flex gap-1">
            {slot4Powers.map(power => {
              const cooldownRemaining = getRemainingCooldownBubbles(power);
              const isOnCooldown = cooldownRemaining > 0;
              const isYamiActive = power.id === 'yami' && yamiActiveCountdown !== null;
              
              // Icons
              const iconMap = {
                'haishi': Sword,
                'shinkou': Eye,
                'shin_en': Flame,
                'yami': Moon
              };
              const Icon = iconMap[power.id as keyof typeof iconMap] || Zap;
              
              return (
                <Tooltip key={power.id} delayDuration={200}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handlePowerClick(power)}
                      disabled={isOnCooldown}
                      className="flex-1 h-10 text-xs font-bold border transition-all flex items-center justify-between px-1"
                      style={{
                        background: isOnCooldown ? 'rgba(100,100,100,0.3)' : 
                          power.id === 'haishi' ? 'linear-gradient(to right, #000000, #555555)' :
                          power.backgroundColor,
                        color: power.id === 'haishi' ? '#FF4444' : power.textColor,
                        fontFamily: '"Noto Serif JP", serif',
                        border: 'none'
                      }}
                    >
                      {/* Icon + Name Horizontal */}
                      <div className="flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        <span style={{ fontSize: '9px', fontWeight: 900 }}>{power.displayName}</span>
                      </div>
                      
                      {/* Cooldown or Active Timer */}
                      {isOnCooldown && (
                        <Badge className="text-[8px] bg-yellow-500 text-black">
                          {cooldownRemaining}
                        </Badge>
                      )}
                      {isYamiActive && (
                        <Badge className="text-[8px] bg-purple-500 text-white animate-pulse">
                          {yamiActiveCountdown}s
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="text-xs max-w-[250px] backdrop-blur-lg text-center"
                    style={{
                      backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.95)',
                      color: immersiveStyle?.textColor || 'white',
                      borderColor: immersiveStyle?.primaryColor || 'rgba(138,43,226,0.7)',
                      opacity: 0.95
                    }}
                  >
                    {getSkillTooltip(
                      power.id === 'haishi' ? '⚔️ Aufhebung (Uchigatana):Xebec\'s Supreme King Haki' : power.displayName, 
                      power.description, 
                      power.range
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      {/* COLLAPSIBLE SECTION 2: SCALING (RENAMED) */}
      <CollapsibleSection
        title="Scaling"
        icon={Gauge}
        badge={strength}
        isExpanded={expandedSections.strength}
        onToggle={() => toggleSection('strength')}
        immersiveStyle={immersiveStyle}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-70">Strength:</span>
            <div className="flex items-center gap-1">
              {gear5Boost > 0 && (
                <Badge className="text-[8px]" style={{ backgroundColor: '#F5F5F5', color: 'black' }}>
                  +30
                </Badge>
              )}
              {colorKingBoost > 0 && (
                <Badge className="text-[8px]" style={{ backgroundColor: '#8B8B8B', color: 'white' }}>
                  +40
                </Badge>
              )}
              {worldBoost > 0 && (
                <Badge className="text-[8px]" style={{ backgroundColor: '#B8860B', color: 'white' }}>
                  +10
                </Badge>
              )}
              <span className="font-bold">{strength}</span>
            </div>
          </div>
          <Slider
            value={[strength]}
            onValueChange={(val) => {
              setStrength(val[0]);
              // Auto-expand when user adjusts strength
              if (!expandedSections.strength) {
                console.log('[PowersMenuV2] 🔓 Auto-expanding Strength section');
                setExpandedSections(prev => ({ ...prev, strength: true }));
              }
            }}
            min={1}
            max={maxStrength}
            step={1}
            className="w-full"
          />
          {/* Show active boosts */}
          {totalBoost > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {gear5Boost > 0 && (
                <Badge className="text-[9px]" style={{ backgroundColor: '#F5F5F5', color: 'black' }}>
                  +30
                </Badge>
              )}
              {colorKingBoost > 0 && (
                <Badge className="text-[9px]" style={{ backgroundColor: '#8B8B8B', color: 'white' }}>
                  +40
                </Badge>
              )}
              {worldBoost > 0 && (
                <Badge className="text-[9px]" style={{ backgroundColor: '#B8860B', color: 'white' }}>
                  +10
                </Badge>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* COLLAPSIBLE SECTION 3: TARGET SELECTION */}
      <CollapsibleSection
        title="Target Selection"
        icon={Target}
        badge={selectedTargets.length > 0 ? selectedTargets.length : undefined}
        isExpanded={expandedSections.targets}
        onToggle={() => toggleSection('targets')}
        immersiveStyle={immersiveStyle}
      >
        <div className="space-y-3">
          {/* Selected Targets Section */}
          {selectedTargets.length > 0 && (
            <div>
              <p className="text-[10px] opacity-60 mb-1.5">Selected:</p>
              <div className="flex flex-wrap gap-1">
                {selectedTargets.map(target => (
                  <Badge 
                    key={target}
                    className="text-[10px] cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onTargetDeselect(target)}
                    style={{
                      backgroundColor: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                      color: 'black'
                    }}
                  >
                    {target} ✕
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Targets Section */}
          {availableTargets.length > 0 ? (
            <div>
              <p className="text-[10px] opacity-60 mb-1.5">Available Targets:</p>
              <div className="flex flex-wrap gap-1">
                {availableTargets.map(target => {
                  const isSelected = selectedTargets.includes(target.name);
                  const typeLabel = 
                    target.type === 'nephilim' ? 'N' : 
                    target.type === 'character' ? 'C' : 
                    target.type === 'self' ? 'S' :
                    target.type === 'bystander' ? 'B' : 'E';
                  
                  return (
                    <Badge
                      key={target.name}
                      onClick={() => isSelected ? onTargetDeselect(target.name) : onTargetSelect(target.name)}
                      className="cursor-pointer text-[10px] hover:opacity-100 transition-all"
                      style={{
                        backgroundColor: isSelected
                          ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)')
                          : 'rgba(0,0,0,0.3)',
                        opacity: isSelected ? 1 : 0.6,
                        color: isSelected ? 'black' : 'white',
                        borderColor: isSelected ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') : 'transparent',
                        borderWidth: '1px'
                      }}
                    >
                      {target.name}
                      {isSelected && ' ✓'}
                      <span className="text-[8px] ml-1 opacity-60">
                        {typeLabel}
                      </span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs opacity-60 text-center py-2">
              No targets available
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* Seppuku Confirmation Dialog */}
      <AlertDialog open={showSeppukuDialog} onOpenChange={setShowSeppukuDialog}>
        <AlertDialogContent 
          className="backdrop-blur-md border-2"
          style={{
            backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.9)',
            borderColor: '#DC143C',
            color: immersiveStyle?.textColor || 'white'
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2" style={{ color: '#DC143C' }}>
              <AlertTriangle className="w-5 h-5" />
              Confirm Seppuku
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm" style={{ color: immersiveStyle?.textColor || 'white' }}>
              You are about to use <span className="font-bold">{pendingSeppukuPower?.power.displayName}</span> on yourself with an uchigatana.
              <br /><br />
              This is a <span className="font-bold text-red-400">self-inflicted strike</span>. It will not kill you, but will cause damage.
              <br /><br />
              Do you wish to proceed with this action?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: immersiveStyle?.borderColor || 'rgba(255,255,255,0.2)',
                color: immersiveStyle?.textColor || 'white'
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (pendingSeppukuPower) {
                  const powerText = formatPowerText(
                    pendingSeppukuPower.power.displayName, 
                    pendingSeppukuPower.targets, 
                    strength
                  );
                  onAddPowerToInput(powerText);
                  setPendingSeppukuPower(null);
                  setShowSeppukuDialog(false);
                }
              }}
              className="border-2"
              style={{
                backgroundColor: '#DC143C',
                borderColor: '#8B0000',
                color: 'white'
              }}
            >
              Yes, I want to proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
