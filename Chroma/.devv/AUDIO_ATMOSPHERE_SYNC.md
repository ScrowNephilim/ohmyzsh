# Audio-Atmosphere Sync System

## Overview
Integrated system that dynamically adjusts background music volume based on atmospheric intensity in Chroma environment. The audio engine responds in real-time to temperature changes, weather conditions, location types, and power activations.

---

## Core Concept

**Higher atmospheric intensity = Lower music volume**

This inverse relationship ensures that:
- Intense moments (storms, extreme temperatures, power activations) have quieter music so atmospheric text/effects are more prominent
- Calm moments (comfortable weather, peaceful locations) have fuller music volume
- Power activations temporarily "duck" the volume for dramatic effect

---

## System Components

### 1. **Audio-Atmosphere Sync Engine** (`audio-atmosphere-sync.ts`)
Core calculation and synchronization logic.

#### Intensity Calculations

**Temperature Intensity** (0-1 scale):
- `< 20°F`: 0.95 (extreme cold)
- `20-40°F`: 0.75 (cold)
- `40-60°F`: 0.5 (cool)
- `60-75°F`: 0.3 (comfortable - lowest intensity)
- `75-90°F`: 0.5 (warm)
- `90-100°F`: 0.75 (hot)
- `> 100°F`: 0.95 (extreme heat)

**Weather Intensity** (0-1 scale):
- Storm/blizzard/hurricane: 1.0
- Rain/thunder/snow: 0.7
- Wind/fog/mist: 0.5
- Cloudy/overcast: 0.3
- Clear/sunny: 0.2

**Location Intensity** (0-1 scale):
- Indoor: 0.4 (enclosed, calmer)
- Outdoor: 0.5 (open, variable)
- Urban/transport: 0.6 (urban chaos)
- Parallel worlds: 0.7 (heightened reality)
- Special locations:
  * Mementos: 0.95 (distorted reality)
  * Chicago club: 0.9 (loud, pulsing)
  * Velvet Room: 0.3 (ethereal calm)
  * Wano: 0.4 (peaceful oriental)

**Power Intensity** (0-1 scale):
- No power: 0
- Low power activation: 0.5
- Medium power activation: 0.75
- High/full power: 1.0
- Conqueror's Haki: Always 1.0 (maximum)

#### Overall Intensity Calculation

```typescript
overall = (
  temperature * 0.25 +
  weather * 0.25 +
  location * 0.3 +
  power * 0.2
)

// Boost when power is active
if (power > 0) {
  overall = min(overall + (power * 0.3), 1.0)
}
```

#### Volume Calculation

```typescript
targetVolume = baseVolume - (overall * (baseVolume - 0.2))

// Power activations further reduce volume
if (power > 0) {
  targetVolume = targetVolume * (1 - (power * 0.5))
}

// Clamp to 0.1-1.0 range
```

**Example:**
- Base volume: 70%
- Overall intensity: 0.8 (high)
- Target volume: 70% - (0.8 * 50%) = 30%
- With power active (0.75): 30% * (1 - 0.375) = 18.75%

---

### 2. **AudioPlayer Component** (`components/AudioPlayer.tsx`)

Enhanced with real-time atmosphere sync.

#### New Props:
```typescript
interface Props {
  environmentType?: 'street' | 'club' | 'indoor' | 'outdoor';
  envState?: EnvironmentState; // NEW
  location?: LocationPreset; // NEW
  activePower?: NephilimPower | null; // NEW
  powerIntensity?: 'low' | 'medium' | 'high'; // NEW
}
```

#### New Features:
- **Intensity Badge**: Visual indicator showing MINIMAL/LOW/MODERATE/HIGH/EXTREME
  - Color-coded: Blue (low), Orange (moderate), Red (high)
- **Real-time Volume Sync**: Smooth transitions based on atmosphere changes
- **Atmosphere Sync Info Panel**: Detailed breakdown of all intensity factors
  - Temperature percentage
  - Weather percentage
  - Location percentage
  - Power percentage (highlighted in red when active)
  - Current vs base volume comparison
- **Fast Power Response**: 0.3s transition for power activations (vs 1.0s for environment changes)

#### Volume Sync Effect:
```typescript
useEffect(() => {
  if (!isPlaying || !envState || !location) return;
  
  const intensity = calculateAtmosphereIntensity(...);
  const targetVolume = intensityToVolume(intensity, baseVolume);
  
  // Smooth Web Audio API volume ramp
  gainNode.gain.linearRampToValueAtTime(
    targetVolume, 
    now + transitionTime
  );
}, [envState, location, activePower, powerIntensity, baseVolume]);
```

---

### 3. **ChromaPage Integration** (`pages/ChromaPage.tsx`)

#### Props Passed to AudioPlayer:
```typescript
<AudioPlayer 
  environmentType={environment?.location_type}
  envState={JSON.parse(environment?.environment_state)}
  location={currentLocationPreset}
  activePower={activePowerVisual?.power}
  powerIntensity={activePowerVisual?.intensity}
/>
```

#### Power Activation Enhancement:
```typescript
setActivePowerVisual({
  ...powerVisual,
  power: power, // Store power object
  intensity: intensityLevel // Store intensity level
});
```

---

## User Experience

### Visual Feedback

1. **Intensity Badge** (when audio playing):
   - Shows current atmosphere intensity level
   - Color changes based on intensity
   - Zap icon indicates dynamic sync active

2. **Atmosphere Sync Panel** (expandable):
   - Real-time volume percentage
   - Individual intensity factors breakdown
   - Power status highlighted when active
   - Helpful note: "Higher intensity = lower volume"

### Audio Behavior Examples

**Scenario 1: Calm Evening**
- Temperature: 65°F (comfortable) → 0.3 intensity
- Weather: Clear → 0.2 intensity
- Location: Outdoor → 0.5 intensity
- Overall: ~0.33 (LOW)
- Volume: ~70% (near base volume)

**Scenario 2: Storm in Chicago Streets**
- Temperature: 42°F (cold) → 0.5 intensity
- Weather: Storm → 1.0 intensity
- Location: Urban → 0.6 intensity
- Overall: ~0.68 (MODERATE-HIGH)
- Volume: ~36% (quieter for storm ambiance)

**Scenario 3: Différance Power Activation**
- Base intensity: 0.5
- Power: High intensity → 1.0
- Overall: 0.5 + (1.0 * 0.3) = 0.8 (HIGH)
- Volume: 25% * (1 - 0.5) = 12.5% (heavily ducked)
- Duration: 5 seconds, then restores

**Scenario 4: Extreme Heat in Mementos**
- Temperature: 105°F (extreme) → 0.95 intensity
- Weather: Clear → 0.2 intensity
- Location: Mementos → 0.95 intensity
- Overall: ~0.81 (EXTREME)
- Volume: ~20% (minimal to emphasize intensity)

---

## Technical Implementation

### Web Audio API Integration

Uses the existing AudioEngine's gainNode for smooth volume control:

```typescript
const gainNode = audioEngine['gainNode'];
const audioContext = audioEngine['audioContext'];

gainNode.gain.setValueAtTime(currentValue, now);
gainNode.gain.linearRampToValueAtTime(targetValue, now + duration);
```

### Transition Timing

- **Environment changes**: 1.0 second smooth transition
- **Power activations**: 0.3 second rapid transition (more dramatic)

### Calculation Frequency

- Effect runs when any dependency changes:
  - envState (temperature, weather, lighting)
  - location (type, preset)
  - activePower (power object)
  - powerIntensity (low/medium/high)
  - baseVolume (user adjustment)

---

## Future Enhancements

### Potential Additions:
1. **Time-based modulation**: Night = slightly lower base volume
2. **Nephilim presence multiplier**: More Nephilims = slightly higher intensity
3. **Bystander chaos**: NPC crowd density affects intensity
4. **User preference profile**: Save preferred intensity-to-volume curve
5. **Audio ducking presets**: Aggressive, Normal, Subtle
6. **Spatial audio sync**: Distance effect intensity affects volume curve

### Advanced Features:
1. **Frequency filtering**: High intensity = more lowpass filtering (muffled)
2. **Reverb modulation**: Indoor vs outdoor reverb changes with intensity
3. **Rhythmic sync**: Power activations on beat (if music has beat detection)
4. **Voice ducking**: Additional duck when Nephilim is speaking

---

## Console Logging

Comprehensive debug output for monitoring:

```
🎵 Audio-Atmosphere Sync: {
  intensity: 0.68,
  volume: 0.36,
  temp: 0.50,
  weather: 1.00,
  location: 0.60,
  power: 0.00
}
```

---

## Summary

The audio-atmosphere sync system creates an immersive, responsive soundscape that adapts to every aspect of the Chroma environment. By intelligently lowering music volume during intense moments, it ensures that atmospheric effects, power activations, and environmental changes remain the focus of attention while maintaining a subtle musical backdrop during calmer moments.

**Result:** A living, breathing audio environment that reacts to temperature extremes, weather changes, location shifts, and power activations in real-time with smooth, professional transitions.
