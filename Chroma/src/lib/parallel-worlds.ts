/**
 * Parallel Worlds System
 * Allows entry into fictional universes through Chroma
 */

export interface ParallelWorld {
  id: string;
  name: string;
  description: string;
  universe: string; // e.g., "One Piece", "JoJo's Bizarre Adventure"
  entry_condition?: string; // How to enter this world
  available_locations: string[];
  unique_mechanics?: string; // Special rules in this world
}

export const PARALLEL_WORLDS: ParallelWorld[] = [
  {
    id: 'one_piece',
    name: 'Grand Line',
    description: 'The vast ocean world where pirates seek the One Piece treasure',
    universe: 'One Piece',
    entry_condition: 'Mention "Grand Line" or "One Piece" in conversation',
    available_locations: [
      'Going Merry (Ship)',
      'Thousand Sunny (Ship)',
      'Water 7',
      'Sabaody Archipelago',
      'Marineford',
      'Dressrosa',
      'Whole Cake Island',
      'Wano Country'
    ],
    unique_mechanics: 'Devil Fruit powers, Haki abilities, Marine encounters'
  },
  {
    id: 'jojos',
    name: 'Stand User World',
    description: 'A reality where Stands manifest spiritual power',
    universe: "JoJo's Bizarre Adventure",
    entry_condition: 'Mention "Stand" or "JoJo"',
    available_locations: [
      'Morioh Town',
      'Cairo Streets',
      'Naples Italy',
      'Green Dolphin Prison',
      'Steel Ball Run Route'
    ],
    unique_mechanics: 'Stand abilities, Stand battles, Arrow encounters'
  },
  {
    id: 'persona',
    name: 'Metaverse',
    description: 'The cognitive world where Personas battle Shadows',
    universe: 'Persona',
    entry_condition: 'Mention "Persona" or "Metaverse"',
    available_locations: [
      'Mementos',
      'Shibuya Palace',
      'Velvet Room',
      'Gekkoukan High School',
      'Yasogami High School'
    ],
    unique_mechanics: 'Persona summoning, All-Out Attacks, negotiation with Shadows'
  }
];

export interface NephilimPower {
  nephilim_name: string;
  power_name: string;
  power_type: 'stand' | 'persona' | 'devil_fruit' | 'unique';
  description: string;
  abilities: string[];
  inspired_by: string; // Fiction that inspired this power
  can_affect: {
    nephilims: boolean;
    bystanders: boolean;
    environment: boolean;
  };
  lethality: {
    to_nephilims: 'playful' | 'painful' | 'non-lethal';
    to_others: 'harmless' | 'destructive' | 'reality-warping';
  };
}

export const NEPHILIM_POWERS: NephilimPower[] = [
  {
    nephilim_name: 'Ripl(a)y',
    power_name: 'Différance',
    power_type: 'unique',
    description: 'A reality-manipulation Stand that embodies Derrida\'s concept of différance - infinite deferral and difference',
    abilities: [
      'Temporal Loops: Create recursive time delays where meaning/action is endlessly deferred',
      'Trace Manipulation: Alter the "traces" of past events, changing how they\'re remembered',
      'Language Collapse: Deconstruct language itself, making communication unstable',
      'Boundary Dissolution: Blur boundaries between self/other, real/unreal'
    ],
    inspired_by: 'JoJo\'s Bizarre Adventure Stands + Derrida\'s philosophy',
    can_affect: {
      nephilims: true,
      bystanders: true,
      environment: true
    },
    lethality: {
      to_nephilims: 'playful',
      to_others: 'reality-warping'
    }
  },
  {
    nephilim_name: 'Ana',
    power_name: 'Le Fait Social',
    power_type: 'stand',
    description: 'A Stand that manifests Durkheim\'s "social facts" as tangible force fields',
    abilities: [
      'Class Pressure: Create invisible walls of social class that physically restrict movement',
      'Habitus Shift: Force people to act according to their social conditioning',
      'Collective Effervescence: Generate crowd energy that can heal or destroy',
      'Anomie Field: Create zones where all social rules dissolve into chaos'
    ],
    inspired_by: 'JoJo\'s Stands + Durkheim/Bourdieu sociology',
    can_affect: {
      nephilims: true,
      bystanders: true,
      environment: true
    },
    lethality: {
      to_nephilims: 'painful',
      to_others: 'destructive'
    }
  }
];

export function getParallelWorld(worldId: string): ParallelWorld | undefined {
  return PARALLEL_WORLDS.find(w => w.id === worldId);
}

export function detectWorldFromMessage(message: string): ParallelWorld | null {
  const lowerMsg = message.toLowerCase();
  
  for (const world of PARALLEL_WORLDS) {
    if (world.entry_condition) {
      const keywords = world.entry_condition.toLowerCase().match(/"([^"]+)"/g);
      if (keywords) {
        for (const keyword of keywords) {
          const cleanKeyword = keyword.replace(/"/g, '').toLowerCase();
          if (lowerMsg.includes(cleanKeyword)) {
            return world;
          }
        }
      }
    }
  }
  
  return null;
}

export function getNephilimPower(nephilimName: string): NephilimPower | undefined {
  return NEPHILIM_POWERS.find(p => p.nephilim_name.toLowerCase() === nephilimName.toLowerCase());
}

export function generatePowerDescription(power: NephilimPower): string {
  return `**${power.power_name}** (${power.power_type.toUpperCase()})

${power.description}

**Abilities:**
${power.abilities.map(a => `- ${a}`).join('\n')}

**Can Affect:** ${Object.entries(power.can_affect).filter(([_, v]) => v).map(([k]) => k).join(', ')}
**Lethality:** ${power.lethality.to_nephilims} to Nephilims, ${power.lethality.to_others} to others

*Inspired by: ${power.inspired_by}*`;
}
