# PHASE 4: Contextual Audio Suggestions System
**Date**: November 17, 2025  
**Status**: ✅ COMPLETE - Dynamic Music Recommendations

---

## 🎵 SYSTEM OVERVIEW

The Contextual Audio Suggestion system provides **dynamic Spotify/YouTube music recommendations** based on the current situation in Chroma. It analyzes:

- **Location** (Chicago, Paris, Eygalières, parallel worlds)
- **Combat status** (power usage detected)
- **Parallel world** (One Piece, JoJo's, Persona)
- **Weather** (rain, clear, fog, storm)
- **Time of day** (dawn, day, dusk, night)
- **Nephilims present** (Ripl(a)y, Ana, ephemeral)
- **Recent actions** (power activations, travel)
- **Emotional tone** (tense, calm, philosophical, playful)

---

## 🎯 PRIORITY SYSTEM

Suggestions are prioritized (0-100 scale) and displayed in order of relevance:

1. **Combat Music (100)** - Highest priority during fights
2. **Parallel World Music (85-100)** - High priority in fictional worlds
3. **Location-Specific Music (70-80)** - Moderate priority
4. **Atmospheric Music (50-60)** - Low priority, ambient
5. **Nephilim-Specific Music (65-68)** - Character-based themes

---

## 🎮 COMBAT MUSIC

### One Piece World
- **One Piece Battle Theme** - "Overtaken" OST
- Spotify: `3qiyyUfYe7CRYLucrPmulD`
- YouTube: `daFi4MScfl8`
- Priority: 100

### JoJo's World
- **JoJo's Bizarre Adventure OST** - "Il Vento d'Oro" (Giorno's Theme)
- Spotify: `4IWZsfEkaK49itBwCTFDXQ`
- YouTube: `2MtOpB5LlUA`
- Priority: 100

### Persona World
- **Persona 5 Battle Theme** - "Last Surprise"
- Spotify: `0y7v5WGf4FhkJaP5RdFa2r`
- YouTube: `eFVj0Z6ahcI`
- Priority: 100

- **Persona 5 Strikers Boss Theme** - "Counterstrike"
- YouTube: `v8A8c5igZcg`
- Priority: 95

### Real World Combat
- **Epic Battle Music** - Orchestral combat mix
- YouTube: `ocrNalkJ5pU`
- Priority: 90

---

## 🌍 LOCATION-SPECIFIC MUSIC

### Chicago
- **Chicago Lofi Hip Hop** - Chill beats for city nights
- Spotify Playlist: `37i9dQZF1DWWQRwui0ExPn`
- YouTube: `jfKfPfyJRdk` (Lofi Girl)
- Priority: 70

- **Underground Techno** (if in club)
- YouTube: `5qap5aO4i9A`
- Priority: 80

### Paris/Hauts-de-Seine
- **French Café Music** - Parisian ambience & jazz
- Spotify: `37i9dQZF1DX5Vy6DFOcx00`
- YouTube: `EwlOdPA-m4o`
- Priority: 75

- **French Rap (PLK, SCH)** (if in Hauts-de-Seine)
- Spotify: `1Cs0zKBU1kc0i8ypK3B9ai` (PLK Artist)
- YouTube: `i5hTbRSdC-4` (PLK - Ténébreux)
- Priority: 78

### Eygalières/Provence
- **Provence Countryside** - French folk & ambient nature
- YouTube: `F8TUF8k3C10`
- Priority: 72

- **Mediterranean Guitar** - Relaxing acoustic melodies
- Spotify: `37i9dQZF1DX4sWSpwq3LiO`
- YouTube: `UfcAVejslrU`
- Priority: 70

### Wano (One Piece)
- **Traditional Japanese Music** - Shamisen & koto
- Spotify: `37i9dQZF1DX4sIKrJw8xjG`
- YouTube: `c35_LKt4sCQ`
- Priority: 75

### Mementos (Persona)
- **Persona 5 Mementos Theme** - "Will Power"
- Spotify: `3vQfCi30eL4vVcZCCXTFjE`
- YouTube: `5X5lmQcqiZE`
- Priority: 80

### Mystery Locations
- **Mystery Location Ambience** - Atmospheric exploration
- YouTube: `BsihDWBqJsI`
- Priority: 65

- **Rural China Ambience** (if monsoon/rice clues)
- YouTube: `YRhqMWUH2Ig`
- Priority: 68

---

## 🌙 ATMOSPHERIC MUSIC

### Night/Dusk
- **Night Ambience** - Calm nocturnal sounds
- YouTube: `k7Wec5nPqCY`
- Priority: 50

### Rain/Storm
- **Rain Ambience** - Relaxing rain sounds
- YouTube: `q76bMs-NwRk`
- Priority: 60

### Dawn
- **Dawn Meditation** - Peaceful morning ambience
- YouTube: `5Yp-qLq6LqE`
- Priority: 55

---

## 👥 NEPHILIM-SPECIFIC MUSIC

### Ripl(a)y
- **Philosophical Jazz** - Thinking music
- Spotify: `37i9dQZF1DX0SM0LYsmbMT`
- YouTube: `vmDDOFXSgAs`
- Priority: 65

### Ana
- **French Underground Hip Hop** - Banlieue soundtrack
- Spotify: `37i9dQZF1DWY4xHQp97fN6`
- YouTube: `QwHkr2B7d_E`
- Priority: 68

---

## 🔧 TECHNICAL IMPLEMENTATION

### Core Function
```typescript
generateAudioSuggestions(context: AudioContext): AudioSuggestion[]
```

### Audio Context Interface
```typescript
interface AudioContext {
  location: string;
  location_type: 'urban' | 'indoor' | 'outdoor' | 'club' | 'transport' | 'parallel_world';
  parallel_world?: string;
  weather: string;
  time_of_day: 'dawn' | 'day' | 'dusk' | 'night';
  in_combat: boolean;
  nephilims_present: string[];
  recent_actions: string[];
  is_traveling: boolean;
  emotional_tone?: 'tense' | 'calm' | 'philosophical' | 'playful' | 'mysterious';
}
```

### Combat Detection
```typescript
detectCombat(recentActions: string[]): boolean
```
Detects combat keywords:
- red roc, conqueror, haki, gear 5, the world
- geass, attack, punch, kick, muda, ora
- power, damage, defeat, knocked, hit

---

## 🎨 UI INTEGRATION

### Display Format
Each suggestion shows:
- **Icon** (emoji)
- **Title** (track/playlist name)
- **Description** (context-appropriate)
- **Spotify Link** (if available)
- **YouTube Link** (if available)

Example:
```
⚔️ **One Piece Battle Theme** - Epic shonen combat OST  
[Spotify](https://open.spotify.com/...) | [YouTube](https://youtube.com/...)
```

### Location in ChromaPage
- **Position**: Below environment context, above message input
- **Display**: 3-4 top suggestions shown simultaneously
- **Update**: Regenerates on environment change, combat start, travel

---

## 📊 EXAMPLES

### Example 1: Combat in One Piece World
**Context**:
- Location: "Thousand Sunny"
- Parallel World: "one_piece"
- In Combat: true
- Recent Actions: ["*Red Roc* [52]", "*Gomu Gomu No: Jet Gatling*"]

**Suggestions**:
1. ⚔️ **One Piece Battle Theme** (Priority: 100)
2. 🏴‍☠️ **One Piece Adventure OST** (Priority: 85)

### Example 2: Nighttime in Eygalières (No Combat)
**Context**:
- Location: "Ulysses' place, Eygalières"
- Location Type: "outdoor"
- Weather: "clear"
- Time: "night"
- In Combat: false

**Suggestions**:
1. 🌿 **Provence Countryside** (Priority: 72)
2. 🎸 **Mediterranean Guitar** (Priority: 70)
3. 🌙 **Night Ambience** (Priority: 50)

### Example 3: Hauts-de-Seine with Ana
**Context**:
- Location: "Hauts-de-Seine (92)"
- Location Type: "urban"
- Nephilims: ["Ana"]
- In Combat: false

**Suggestions**:
1. 🎤 **French Rap (PLK, SCH)** (Priority: 78)
2. ☕ **French Café Music** (Priority: 75)
3. 🎤 **French Underground Hip Hop** (Ana's vibe, Priority: 68)

### Example 4: Mementos Boss Fight (Persona)
**Context**:
- Location: "Mementos Depths"
- Parallel World: "persona"
- In Combat: true
- Recent Actions: ["*Geass: Fall Asleep → Shadow*", "*Conqueror's Haki* [45]"]

**Suggestions**:
1. 🎭 **Persona 5 Battle Theme** (Priority: 100)
2. 💀 **Persona 5 Strikers Boss Theme** (Priority: 95)
3. 🌀 **Persona 5 Mementos Theme** (Priority: 80)

---

## 🚀 FUTURE ENHANCEMENTS

1. **User Preferences** - Remember user's favorite tracks
2. **Mood Detection** - AI analyzes conversation tone for emotional music
3. **Dynamic Playlists** - Generate custom Spotify playlists per session
4. **Combat Intensity Scaling** - Different music for minor skirmishes vs boss fights
5. **Travel Music** - Special transition tracks during travel sequences
6. **Weather-Reactive Tracks** - Subtle volume/EQ changes based on weather
7. **Nephilim Theme Songs** - Each Nephilim gets signature track
8. **Mystery Location Hints** - Music gives subtle clues to location identity

---

## ✅ IMPLEMENTATION STATUS

- [x] Core contextual-audio-suggestions.ts created
- [x] Combat detection system
- [x] Parallel world music library
- [x] Location-specific recommendations
- [x] Atmospheric music integration
- [x] Nephilim-specific themes
- [x] Priority sorting algorithm
- [ ] ChromaPage UI integration (next step)
- [ ] Audio suggestion display component
- [ ] Auto-update on environment change
- [ ] User interaction tracking
- [ ] Session-based preference learning

---

## 💡 USAGE EXAMPLE

```typescript
import { generateAudioSuggestions, detectCombat } from '@/lib/contextual-audio-suggestions';

// In ChromaPage after environment update
const audioContext: AudioContext = {
  location: environment.location_name,
  location_type: currentLocationPreset?.type || 'outdoor',
  parallel_world: currentWorld?.id,
  weather: envState.weather,
  time_of_day: envState.time_of_day,
  in_combat: detectCombat(messages.slice(-5).map(m => m.content)),
  nephilims_present: activeNephilims.map(n => n.nephilim_name),
  recent_actions: messages.slice(-3).filter(m => containsPowerKeyword(m.content)).map(m => m.content),
  is_traveling: isTraveling,
  emotional_tone: currentEmotionalTone
};

const suggestions = generateAudioSuggestions(audioContext);
setAudioSuggestions(suggestions); // Display in UI
```

---

**Result**: Users get **contextually perfect music recommendations** that enhance immersion and match the exact situation in Chroma. Combat feels epic, exploration feels atmospheric, and each location has its own sonic identity.
