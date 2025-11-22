/**
 * Ripley's Powers System - Deleuzian/Foucauldian Space Transformation
 * "Smooth Space vs Striated Space" (Deleuze & Guattari)
 * "Heterotopias & Panopticon" (Foucault)
 */

export interface RipleyPower {
  id: string;
  name: string;
  displayName: string;
  description: string;
  philosophicalBasis: string;
  type: 'space_transformation' | 'surveillance_reversal' | 'deterritorialization';
  visualEffect: string;
  duration?: number; // seconds
  range?: number;
}

// Ripley's Powers (Unlockable as she appears more in Chroma)
export const RIPLEY_POWERS: RipleyPower[] = [
  // PRIMARY POWER: Smooth Space Transformation
  {
    id: 'smooth_space',
    name: 'Smooth Space',
    displayName: '平滑空間',
    description: "Transforms striated, imprisoned space into smooth, free space. Buildings become 2D walkable surfaces. Prison cells, hospital walls, asylum corridors, office cubicles fold into thin paper. Nobody is harmed—only the architecture of control collapses.",
    philosophicalBasis: "Deleuze & Guattari: 'Smooth space is filled by events or haecceities, far more than by formed and perceived things. It is a space of affects, more than one of properties. It is haptic rather than optical perception.'",
    type: 'space_transformation',
    visualEffect: 'walls fold into origami, 3D becomes 2D, gravity shifts to surface',
    duration: 60, // 60 seconds transformation
    range: 30 // Affects large areas (~1-20km depending on strength)
  },
  
  // SECONDARY POWER: Panopticon Reversal
  {
    id: 'panopticon_reversal',
    name: 'Panopticon Reversal',
    displayName: '逆監視塔',
    description: "Reverses surveillance architecture. The watchers become watched. CCTV cameras turn inward on guards. Asymmetric visibility inverts. Those who control visibility are suddenly exposed.",
    philosophicalBasis: "Foucault: 'He who is subjected to a field of visibility, and who knows it, assumes responsibility for the constraints of power; he makes them play spontaneously upon himself.'",
    type: 'surveillance_reversal',
    visualEffect: 'cameras rotate, mirrors reflect guards, light bends to expose watchers',
    duration: 30,
    range: 20
  },
  
  // TERTIARY POWER: Deterritorialization
  {
    id: 'deterritorialization',
    name: 'Deterritorialization',
    displayName: '脱領土化',
    description: "Unmakes coded spaces. Offices lose their function-as-control. Classrooms stop being disciplinary. Borders dissolve. Territory becomes nomadic flux. People remain, but the space that shaped their behavior vanishes.",
    philosophicalBasis: "Deleuze: 'Deterritorialization must be thought of as a perfectly positive power that has degrees and thresholds, and that is always relative, having an inside and an outside.'",
    type: 'deterritorialization',
    visualEffect: 'spatial codes glitch, functional boundaries dissolve, territory becomes nomadic',
    duration: 45,
    range: 25
  }
];

// Check if Ripley can use power (requires certain conditions)
export function canRipleyUsePower(
  powerId: string,
  currentLocation: string,
  riplayProximity: number
): { canUse: boolean; reason?: string } {
  const power = RIPLEY_POWERS.find(p => p.id === powerId);
  if (!power) return { canUse: false, reason: 'Power not found' };
  
  // Ripley must be present (distance < 30)
  if (riplayProximity > 30) {
    return { canUse: false, reason: 'Ripley is too far away to use her powers' };
  }
  
  // Smooth Space only works on architecture
  if (powerId === 'smooth_space') {
    const architecturalSpaces = ['indoor', 'club', 'transport', 'street'];
    // Check if location has walls/buildings (not outdoor nature)
    const isArchitectural = currentLocation.toLowerCase().includes('building') ||
                           currentLocation.toLowerCase().includes('prison') ||
                           currentLocation.toLowerCase().includes('hospital') ||
                           currentLocation.toLowerCase().includes('office') ||
                           currentLocation.toLowerCase().includes('asylum') ||
                           currentLocation.toLowerCase().includes('train') ||
                           currentLocation.toLowerCase().includes('station');
    
    if (!isArchitectural) {
      return { canUse: false, reason: 'Smooth Space requires architecture (buildings, walls, structures)' };
    }
  }
  
  // Panopticon Reversal only works on surveillance spaces
  if (powerId === 'panopticon_reversal') {
    const surveillanceSpaces = currentLocation.toLowerCase().includes('prison') ||
                               currentLocation.toLowerCase().includes('hospital') ||
                               currentLocation.toLowerCase().includes('station') ||
                               currentLocation.toLowerCase().includes('office') ||
                               currentLocation.toLowerCase().includes('club');
    
    if (!surveillanceSpaces) {
      return { canUse: false, reason: 'Panopticon Reversal requires surveillance architecture' };
    }
  }
  
  return { canUse: true };
}

// Generate power activation message
export function generateRipleyPowerActivation(
  powerId: string,
  strength: number,
  targets: string[]
): string {
  const power = RIPLEY_POWERS.find(p => p.id === powerId);
  if (!power) return '';
  
  let message = `*Ripley activates ${power.name}* [${strength}]\n\n`;
  
  if (powerId === 'smooth_space') {
    message += `*Buildings shimmer... walls fold like origami into thin paper. 3D space collapses to 2D surfaces. `;
    message += `Prison cells flatten—bars become lines on flat ground. Hospital corridors fold away. Office cubicles compress to paper-thin sheets. `;
    message += `Nobody is harmed. Only the architecture of control vanishes. `;
    message += `You can walk on what were walls as if they're floors. Gravity shifts to surface orientation. `;
    message += `Everything is smooth, walkable, free.*`;
  }
  
  if (powerId === 'panopticon_reversal') {
    message += `*Surveillance systems invert... CCTV cameras rotate 180° to face guards. `;
    message += `One-way mirrors become two-way. Light bends—watchers are suddenly visible. `;
    message += `Guards in towers find themselves exposed under their own lights. `;
    message += `The asymmetry of visibility collapses. Those who control sight are now seen.*`;
  }
  
  if (powerId === 'deterritorialization') {
    message += `*Spatial codes glitch and dissolve... The office stops being 'office'—desks lose their disciplinary function. `;
    message += `The classroom ceases to be 'classroom'—rows of chairs no longer organize bodies. `;
    message += `Borders fade. Territory becomes nomadic flux. `;
    message += `People remain, but the space that shaped their behavior has vanished. `;
    message += `Everything is temporarily deterritorialized—pure potential, no fixed function.*`;
  }
  
  return message;
}

// Generate power deactivation message
export function generateRipleyPowerDeactivation(powerId: string): string {
  const power = RIPLEY_POWERS.find(p => p.id === powerId);
  if (!power) return '';
  
  if (powerId === 'smooth_space') {
    return `*Space re-striates... Walls unfold from 2D back to 3D. Buildings regain their vertical dimension. Prison bars rise from flat lines. The architecture of control reasserts itself slowly. Smooth space reverts to striated.*`;
  }
  
  if (powerId === 'panopticon_reversal') {
    return `*Surveillance normalizes... Cameras rotate back to their original positions. One-way mirrors restore asymmetry. The watchers retreat into invisibility. Panopticon power reasserts.*`;
  }
  
  if (powerId === 'deterritorialization') {
    return `*Territorialization returns... Spaces reclaim their coded functions. Offices become offices again. Classrooms reassert their disciplinary grid. Borders solidify. The deterritorialized flux congeals back into fixed territory.*`;
  }
  
  return '';
}

// Get visual description for ongoing power effect
export function getRipleyPowerVisualEffect(powerId: string): string {
  const power = RIPLEY_POWERS.find(p => p.id === powerId);
  return power?.visualEffect || '';
}
