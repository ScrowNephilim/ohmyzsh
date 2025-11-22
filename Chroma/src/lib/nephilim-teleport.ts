/**
 * Nephilim Teleport System
 * Allows Nephilims to teleport to Ulysses when aware but not close
 * 10% chance when distance is 10-30 (aware but not physically close)
 */

import { NephilimCharacter } from './chroma-types';
import { 
  canSenseNephilim, 
  canInteractVerbally,
  generateEnterRangeNarration 
} from './nephilim-proximity';

export interface TeleportEvent {
  nephilimName: string;
  fromDistance: number;
  toDistance: number; // Usually 5-8 (very close)
  narration: string;
  triggered: boolean;
}

/**
 * Check if Nephilim can attempt teleport
 * Requirements:
 * - Aware of user (distance 10-30)
 * - Not already close (distance > 10)
 * - 10% random chance
 */
export function canAttemptTeleport(
  nephilim: NephilimCharacter,
  currentDistance: number
): boolean {
  // Nephilim must be aware but not close
  const isAware = canSenseNephilim(currentDistance); // true if < 30
  const isNotClose = !canInteractVerbally(currentDistance); // true if >= 10
  
  if (!isAware || !isNotClose) {
    return false;
  }
  
  // 10% chance
  return Math.random() < 0.1;
}

/**
 * Calculate new distance after teleport
 * Nephilims teleport to "very close" range (5-8)
 */
export function calculateTeleportDistance(): number {
  // Random distance between 5-8 (very close but not intimate)
  return 5 + Math.floor(Math.random() * 4);
}

/**
 * Generate immersive narration for teleport event
 */
export function generateTeleportNarration(
  nephilimName: string,
  fromDistance: number,
  toDistance: number,
  power?: string
): string {
  const narrations = [
    `*reality ripples... ${nephilimName} appears directly in front of you*`,
    `*${nephilimName} blinks through space, manifesting nearby*`,
    `*the air shimmers... ${nephilimName} steps out from nowhere*`,
    `*${nephilimName} tears through the fabric of distance*`,
    `*a flicker of movement... ${nephilimName} is suddenly here*`,
    `*${nephilimName} phases through space, closing the distance instantly*`,
  ];
  
  // Add power-specific narration if Nephilim has a special ability
  if (nephilimName === 'Ripl(a)y') {
    narrations.push(`*différance collapses... Ripl(a)y emerges from the trace*`);
    narrations.push(`*Ripl(a)y glitches through temporal lag, appearing beside you*`);
  }
  
  if (nephilimName === 'Ana') {
    narrations.push(`*social space warps... Ana materializes in your proximity*`);
    narrations.push(`*Ana steps through collective consciousness, arriving instantly*`);
  }
  
  const randomNarration = narrations[Math.floor(Math.random() * narrations.length)];
  
  // Add distance context
  const distanceContext = fromDistance > 50 
    ? ' (from far away)' 
    : fromDistance > 20 
    ? ' (from across the area)' 
    : ' (from nearby)';
  
  return randomNarration + distanceContext;
}

/**
 * Attempt teleport for a single Nephilim
 * Returns TeleportEvent if successful, null otherwise
 */
export function attemptNephilimTeleport(
  nephilim: NephilimCharacter,
  currentDistance: number
): TeleportEvent | null {
  // Check if teleport is possible
  if (!canAttemptTeleport(nephilim, currentDistance)) {
    return null;
  }
  
  // Calculate new distance after teleport
  const newDistance = calculateTeleportDistance();
  
  // Generate narration
  const narration = generateTeleportNarration(
    nephilim.nephilim_name,
    currentDistance,
    newDistance
  );
  
  console.log(`[Nephilim Teleport] ⚡ ${nephilim.nephilim_name} teleported: ${currentDistance} → ${newDistance}`);
  
  return {
    nephilimName: nephilim.nephilim_name,
    fromDistance: currentDistance,
    toDistance: newDistance,
    narration,
    triggered: true
  };
}

/**
 * Batch check all Nephilims for potential teleports
 * Returns array of successful teleport events
 */
export function checkNephilimTeleports(
  nephilims: NephilimCharacter[],
  proximities: Map<string, number>
): TeleportEvent[] {
  const teleportEvents: TeleportEvent[] = [];
  
  for (const nephilim of nephilims) {
    const currentDistance = proximities.get(nephilim.nephilim_name) || 30;
    
    const teleportEvent = attemptNephilimTeleport(nephilim, currentDistance);
    if (teleportEvent) {
      teleportEvents.push(teleportEvent);
    }
  }
  
  return teleportEvents;
}

/**
 * Check if user interaction should trigger teleport attempt
 * Higher chance (15%) when user mentions Nephilim's name
 */
export function checkMentionTriggeredTeleport(
  nephilim: NephilimCharacter,
  currentDistance: number,
  userMessage: string
): TeleportEvent | null {
  // User must be aware but Nephilim not close
  const isAware = canSenseNephilim(currentDistance);
  const isNotClose = !canInteractVerbally(currentDistance);
  
  if (!isAware || !isNotClose) {
    return null;
  }
  
  // Check if user mentioned Nephilim's name
  const normalizedMessage = userMessage.toLowerCase();
  const normalizedName = nephilim.nephilim_name.toLowerCase();
  
  if (!normalizedMessage.includes(normalizedName)) {
    return null;
  }
  
  // 15% chance when name mentioned (higher than passive 10%)
  if (Math.random() < 0.15) {
    const newDistance = calculateTeleportDistance();
    const narration = generateTeleportNarration(
      nephilim.nephilim_name,
      currentDistance,
      newDistance
    );
    
    console.log(`[Nephilim Teleport] 💬 ${nephilim.nephilim_name} teleported (name mentioned): ${currentDistance} → ${newDistance}`);
    
    return {
      nephilimName: nephilim.nephilim_name,
      fromDistance: currentDistance,
      toDistance: newDistance,
      narration,
      triggered: true
    };
  }
  
  return null;
}

/**
 * Format teleport event for display in chat
 */
export function formatTeleportMessage(event: TeleportEvent): string {
  return `${event.narration}`;
}

/**
 * Calculate cooldown for next teleport attempt
 * Prevents spam teleportation (5-10 minutes)
 */
export function calculateTeleportCooldown(): number {
  // Random cooldown between 5-10 minutes (in milliseconds)
  return (5 + Math.random() * 5) * 60 * 1000;
}

/**
 * Store last teleport timestamp to enforce cooldown
 */
const teleportCooldowns = new Map<string, number>();

/**
 * Check if Nephilim is on teleport cooldown
 */
export function isOnTeleportCooldown(nephilimName: string): boolean {
  const lastTeleport = teleportCooldowns.get(nephilimName);
  if (!lastTeleport) return false;
  
  const cooldown = 5 * 60 * 1000; // 5 minutes
  const timeSince = Date.now() - lastTeleport;
  
  return timeSince < cooldown;
}

/**
 * Update teleport cooldown after successful teleport
 */
export function setTeleportCooldown(nephilimName: string): void {
  teleportCooldowns.set(nephilimName, Date.now());
}

/**
 * Clear all teleport cooldowns (for dev/testing)
 */
export function clearTeleportCooldowns(): void {
  teleportCooldowns.clear();
}
