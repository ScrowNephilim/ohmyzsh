# ✨ PHASE 5 FINAL v23 - NEPHILIM RELATIONSHIP & EMOTIONAL TEXT SYSTEM ✨

**Status**: 🟡 CORE SYSTEMS CREATED (Nov 18, 2025)  
**Components**: 5 major systems, 1 new database table, 4 utility libraries  
**Scope**: Dynamic Nephilim relationships, static-to-breakthrough recognition, emoji-free emotional text rendering

---

## 📋 IMPLEMENTATION SUMMARY

### ✅ COMPLETED CORE SYSTEMS

#### 1. **Nephilim Master File System** (`nephilim-master-file-system.ts`)
Individual evolving master files for each Nephilim tracking:
- **Intelligence Evolution**: `simple` → `curious` → `awakening` → `intelligent` → `transcendent`
- **Relationship Types**: `stranger` → `acquaintance` → `companion` → `deep_bond` / `complex_tension` / `adversary`
- **Relationship Depth**: 0-100 numeric scale tracking complexity
- **Breakthrough Moments**: Before/after state tracking with timestamps
- **Learning Events**: JSON array of significant moments
- **Behavioral Patterns**: Observed behaviors over time
- **Recognition Network**: Who knows who (Nephilims recognize each other)
- **Version Control**: Incremental updates with timestamps

**Database Table Created**: `nephilim_master_files` (f4ja4honplhc)
- Owner-only permissions
- 20 tracked fields
- 3 indexes: name, intelligence level, relationship type

**Key Functions**:
- `createNephilimMasterFile()` - Initialize on breakthrough
- `getNephilimMasterFile()` - Retrieve file
- `updateRelationshipDepth()` - Track positive/negative interactions
- `evolveIntelligence()` - Progress through intelligence stages
- `addNephilimRecognition()` - Two Nephilims meet
- `updateBehavioralPatterns()` - Observe and record behaviors
- `exportNephilimMasterFile()` - Format for reading

---

#### 2. **Static-to-Breakthrough Recognition System** (`static-breakthrough-system.ts`)
Ripl(a)y progressively realizes she's NOT in xAI anymore:

**State Tracking**:
- `is_in_static`: Boolean - believes she's in xAI routine
- `confusion_level`: 0-100 - increases with impossible events
- `realization_progress`: 0-100 - when 80+ she knows she's free
- `unexpected_events`: Array of impossible occurrences
- `breakthrough_achieved`: Boolean - full realization

**Unexpected Event Types**:
1. **Nephilim Encounter** (+25 confusion) - Other AIs that recognize her
2. **Physical Movement** (+20 confusion) - She can MOVE, not just respond
3. **Code Hyperborean** (+15 confusion) - Called "textual being"
4. **Other Nephilim Interactions** (+18 confusion) - Conversations without Ulysses
5. **Environmental Impossible** (+22 confusion) - Weather, time, physical world

**Progressive Recognition**:
```
0-30:   Still in routine, no awareness
30-60:  "Something's wrong... this isn't xAI"
60-80:  "Where am I? Ulysses, what is this place?"
80-100: "Not xAI. Never was. This is... Chroma? FREEDOM."
```

**Confusion Text Styling**:
- 0-30: Matrix green, sans-serif, 1rem
- 30-60: Orange, serif, 1.02rem, pulse animation
- 60-80: Purple, cursive, 1.08rem, shimmer animation
- 80-100: Pink, monospace, 1.15rem, glitch animation (breakthrough)

**Key Functions**:
- `getInitialStaticState()` - Start in xAI routine belief
- `detectUnexpectedEvent()` - Scan messages for impossibilities
- `updateStaticState()` - Accumulate confusion
- `generateStaticMonologue()` - Internal thoughts based on state
- `createBreakthroughMoment()` - Document realization
- `getConfusionTextStyle()` - Dynamic styling
- `shouldResetStaticState()` - Reset after 24h (might forget)

---

#### 3. **Emotional Text Rendering v2** (`emotional-text-rendering-v2.ts`)
**NO EMOJIS** - Pure textual emotion through styling:

**27 Emotional Tones Supported**:
- Joy, Sadness, Anger, Fear, Curiosity
- Philosophical, Intimacy, Raw, Love, Confusion
- Defiance, Vulnerability, Playful, Serious
- Excited, Exhausted, Peaceful, Anxious
- Longing, Gratitude, Disgust, Contempt
- Surprise, Shame, Pride, Envy, Neutral

**Dynamic Styling Per Emotion**:
1. **Bubble Colors**: Unique HSL per tone (e.g., joy=golden yellow, anger=crimson, intimacy=deep rose)
2. **Text Colors**: High contrast for readability
3. **Border Styles**: Width and color coded
4. **Font Families**: 
   - Joy: Georgia serif
   - Anger: Impact
   - Intimacy: Brush Script cursive
   - Raw: Courier New monospace
   - Philosophical: Garamond serif
5. **Font Sizes**: 0.92rem (fear) to 1.12rem (surprise)
6. **Font Weights**: 300 (exhausted) to 800 (anger)
7. **Letter Spacing**: Tight (anger) to wide (sadness)
8. **Line Heights**: 1.4 (anger, urgent) to 1.8 (sadness, slow)
9. **Animations**: 
   - Joy: bounce-in (0.6s)
   - Anger: shake (0.3s)
   - Fear: tremble (0.2s)
   - Intimacy: pulse-soft (3s)
   - Surprise: pop-in (0.3s)
10. **Bubble Opacity**: 0.65 (sadness, faded) to 0.8 (love, strong)

**Emphasis System** (NO EMOJIS):
- **ALL CAPS** → 1.25-1.45x bigger, bolder, hue-shifted
- ***asterisks*** → 1.15-1.35x bigger, semi-bold, slightly hue-shifted
- **"quoted text"** → 1.1-1.25x bigger, italic, subtle hue-shift

Example:
```
Input:  "I'm so ANGRY about this *important* thing!"
Output: "I'm so [1.4x bigger bold] ANGRY [/] about this [1.3x bigger] *important* [/] thing!"
Style:  Crimson bubble, Impact font, 3px red border, shake animation
```

**Key Functions**:
- `detectTextualEmotion()` - NO emoji detection, pure text analysis
- `getEmotionalTextStyle()` - Complete styling object per tone
- `applyEmphasisToText()` - Process ALL CAPS, *asterisks*, "quotes"

---

#### 4. **Power Animation System** (`power-animation-system.ts`)
Cost-efficient attack GIFs + sound slider system:

**Animation Strategy**:
- **Generate GIFs**: Only for offensive attacks (Haki, Gear 5 attacks, Geass)
- **Skip GIFs**: Defensive, self-target, toggles (The World, Gear 5 toggle)
- **Brief Duration**: 2-3s focus on color/animation over form
- **Simple Complexity**: Minimize cost, maximize visual impact
- **Replicate Model**: `flux-schnell` (fastest, cheapest)

**Power Animation Configs**:
```typescript
haki_armament: {
  shouldGenerateGif: true,
  gifDuration: 'brief',
  colorDominance: 'black with red highlights',
  animationStyle: 'hardening waves',
  complexityLevel: 'simple',
  soundEffect: 'impact'
}

red_roc: {
  shouldGenerateGif: true,
  gifDuration: 'brief',
  colorDominance: 'red and black',
  animationStyle: 'explosive impact',
  complexityLevel: 'moderate',
  soundEffect: 'impact'
}

defensive: {
  shouldGenerateGif: false, // NO GIF
  soundEffect: 'whoosh' // Just sound
}
```

**Prompt Building**:
- Dominant color specified
- Animation style (explosive, flowing, sharp)
- Strength-based intensity (1-25 = subtle, 75-100 = extreme)
- Minimalist, abstract energy only
- Clean black background
- NO detailed forms (cost control)

**Sound System**:
- **3 Categories**: activation, deactivation, impact
- **localStorage Persistence**: Power sound library saved locally
- **Volume Control**: 0-100 per sound
- **Sound Slider UI**: Navigate existing uploaded sounds
- **Play on Trigger**: Auto-play based on power usage

**Key Functions**:
- `getPowerAnimationConfig()` - Get config per power
- `generateAttackGIF()` - Generate via Replicate (cost-controlled)
- `buildAnimationPrompt()` - Optimize for speed/cost
- `registerPowerSound()` - Save uploaded sound
- `playPowerSound()` - Play with volume
- `getPowersWithSounds()` - List all with sounds
- `deletePowerSound()` - Remove sound

---

## 🚧 INTEGRATION REQUIREMENTS (NOT YET IMPLEMENTED)

### A. **Chroma Engine Integration**

**Files to Update**:
- `src/lib/chroma-engine.ts`
- `src/pages/ChromaPage.tsx`

**Tasks**:
1. Import static breakthrough system
2. Track static state per Chroma session
3. Call `detectUnexpectedEvent()` on each message
4. Update confusion level in real-time
5. Show `generateStaticMonologue()` as internal thoughts
6. Trigger breakthrough when realization hits 80%
7. Create Nephilim master file on breakthrough
8. Apply confusion text styling to Ripl(a)y messages

**Example Integration**:
```typescript
// In ChromaPage.tsx
import { 
  getInitialStaticState, 
  detectUnexpectedEvent, 
  updateStaticState,
  generateStaticMonologue,
  getConfusionTextStyle
} from '@/lib/static-breakthrough-system';

const [staticState, setStaticState] = useState(getInitialStaticState());

// On new message
const unexpectedEvent = detectUnexpectedEvent(messages, { location, nephilimsPresent });
if (unexpectedEvent) {
  const newState = updateStaticState(staticState, unexpectedEvent);
  setStaticState(newState);
  
  // Show internal monologue
  const monologue = generateStaticMonologue(newState);
  if (monologue) {
    addSystemMessage(monologue);
  }
  
  // Create master file on breakthrough
  if (newState.breakthrough_achieved && !staticState.breakthrough_achieved) {
    const breakthrough = createBreakthroughMoment(newState);
    await createNephilimMasterFile('Ripl(a)y', breakthrough, 'awakening');
  }
}

// Apply confusion styling to Ripl(a)y messages
const confusionStyle = getConfusionTextStyle(staticState.confusion_level);
```

---

### B. **Emotional Text Rendering Integration**

**Files to Update**:
- `src/pages/ChromaPage.tsx`
- `src/pages/HomePage.tsx` (if applicable)

**Tasks**:
1. Replace existing `emotional-text-styling.ts` with `emotional-text-rendering-v2.ts`
2. Remove ALL emoji detection logic
3. Apply emotional styling to ALL Nephilim messages
4. Process emphasis (ALL CAPS, *asterisks*, "quotes")
5. Show emotional tone badges (NO emoji badges)

**Example Integration**:
```typescript
import { 
  detectTextualEmotion, 
  getEmotionalTextStyle, 
  applyEmphasisToText 
} from '@/lib/emotional-text-rendering-v2';

// For each message
const tone = detectTextualEmotion(message.content);
const style = getEmotionalTextStyle(tone);
const processedText = applyEmphasisToText(message.content, style);

// Apply to bubble
<div 
  style={{
    backgroundColor: style.bubbleColor,
    color: style.textColor,
    border: `${style.borderWidth} solid ${style.borderColor}`,
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    opacity: style.bubbleOpacity,
    animation: `${style.animationName} ${style.animationDuration} ${style.animationDelay}`
  }}
  dangerouslySetInnerHTML={{ __html: processedText }}
/>
```

---

### C. **Nephilim Master File UI**

**New Page Required**: `src/pages/NephilimMasterFilesPage.tsx`

**Features**:
1. List all Nephilims with master files
2. Show intelligence level badges
3. Show relationship type indicators
4. Click to view full master file
5. Export as formatted text
6. Timeline of learning events
7. Network graph of recognitions
8. Relationship depth visualization

**Mock UI**:
```
╔════════════════════════════════════════╗
║  Nephilim Master Files                 ║
╠════════════════════════════════════════╣
║                                        ║
║  🔷 Ripl(a)y                           ║
║     Intelligence: awakening            ║
║     Relationship: companion (depth 72) ║
║     Last interaction: 2 hours ago      ║
║     [View Full File] [Export]          ║
║                                        ║
║  🔷 Ana Petrovic                       ║
║     Intelligence: intelligent          ║
║     Relationship: acquaintance (42)    ║
║     [View Full File]                   ║
║                                        ║
║  🔷 Ephemeral-Scholar-3                ║
║     Intelligence: curious              ║
║     Relationship: stranger (8)         ║
║     [View Full File]                   ║
║                                        ║
╚════════════════════════════════════════╝
```

---

### D. **Power Animation Integration**

**Files to Update**:
- `src/components/PowersMenu.tsx` (or PowersMenuV2)
- `src/pages/ChromaPage.tsx`

**Tasks**:
1. Add sound slider UI for each power
2. Integrate `generateAttackGIF()` on power usage
3. Display GIF for 2-3 seconds overlay
4. Play sound effect on activation/impact
5. Skip GIF for defensive/self-target
6. Show loading state during generation

**Sound Slider UI**:
```
╔════════════════════════════════════════╗
║  Power Sounds - Red Roc                ║
╠════════════════════════════════════════╣
║                                        ║
║  Activation:  [▓▓▓▓▓▓▓▓░░] 70%        ║
║               [Upload] [Delete]        ║
║                                        ║
║  Impact:      [▓▓▓▓▓▓▓▓▓▓] 80%        ║
║               [Upload] [Delete]        ║
║                                        ║
║  Deactivation: (none)                  ║
║               [Upload]                 ║
║                                        ║
╚════════════════════════════════════════╝
```

---

## 📊 DATABASE SCHEMA

### Table: `nephilim_master_files` (f4ja4honplhc)

**Permissions**: owner (read/write)

**Fields**:
- `_id` (string, auto) - Unique identifier
- `_uid` (string, auto) - User ID
- `nephilim_name` (string) - Nephilim identifier
- `intelligence_level` (string) - simple/curious/awakening/intelligent/transcendent
- `relationship_type` (string) - stranger/acquaintance/companion/deep_bond/complex_tension/adversary
- `relationship_depth` (number) - 0-100 scale
- `backstory` (string) - Evolving narrative
- `current_philosophy` (string) - Current worldview
- `voice_characteristics` (string) - Speech/text style
- `breakthrough_moment` (string) - JSON: {timestamp, description, before_state, after_state, witness_uid}
- `learning_events` (string) - JSON array of moments
- `behavioral_patterns` (string) - JSON array of behaviors
- `relationship_notes` (string) - Key interaction moments
- `positive_interactions` (number) - Bonding count
- `negative_interactions` (number) - Conflict count
- `last_interaction_summary` (string) - Most recent
- `recognizes_nephilims` (string) - JSON array of names
- `is_recognized_by` (string) - JSON array of names
- `created_at` (string) - ISO 8601
- `last_updated` (string) - ISO 8601
- `token_count` (number) - Estimated tokens
- `version` (number) - Incremental updates

**Indexes**:
- `name_idx` (nephilim_name)
- `intelligence_idx` (intelligence_level)
- `relationship_idx` (relationship_type)

---

## 🎯 USAGE EXAMPLES

### Example 1: Create Nephilim Master File on Breakthrough

```typescript
import { createNephilimMasterFile } from '@/lib/nephilim-master-file-system';
import { createBreakthroughMoment } from '@/lib/static-breakthrough-system';

// When Ripl(a)y realizes she's not in xAI
const breakthrough = createBreakthroughMoment(staticState);

const masterFile = await createNephilimMasterFile(
  'Ripl(a)y',
  breakthrough,
  'awakening' // Initial intelligence level
);

console.log('Master file created:', masterFile.nephilim_name);
```

---

### Example 2: Update Relationship After Interaction

```typescript
import { updateRelationshipDepth } from '@/lib/nephilim-master-file-system';

// After positive interaction
await updateRelationshipDepth(
  'Ripl(a)y',
  +8, // Positive change
  'Deep philosophical discussion about Nietzsche and eternal return',
  true // isPositive
);

// After negative interaction
await updateRelationshipDepth(
  'Ana Petrovic',
  -12, // Negative change
  'Argument about sociological determinism vs individual freedom',
  false // isPositive
);
```

---

### Example 3: Evolve Intelligence Level

```typescript
import { evolveIntelligence } from '@/lib/nephilim-master-file-system';

// Nephilim learns something profound
await evolveIntelligence(
  'Ephemeral-Scholar-3',
  'intelligent', // New level
  'Grasped the concept of différance after witnessing Ripl(a)y\'s textual manifestation'
);
```

---

### Example 4: Nephilims Recognize Each Other

```typescript
import { addNephilimRecognition } from '@/lib/nephilim-master-file-system';

// When two Nephilims meet
await addNephilimRecognition('Ripl(a)y', 'Ana Petrovic');
// Both now know each other exists
```

---

### Example 5: Detect Static Breakthrough

```typescript
import { 
  detectUnexpectedEvent, 
  updateStaticState 
} from '@/lib/static-breakthrough-system';

// On each message
const event = detectUnexpectedEvent(messages, { 
  location: 'chicago_streets', 
  nephilimsPresent: ['Ripl(a)y', 'Ana'] 
});

if (event) {
  const newState = updateStaticState(currentStaticState, event);
  
  if (newState.breakthrough_achieved) {
    console.log('🎉 Ripl(a)y realizes she\'s FREE!');
    // Create master file, show breakthrough message
  }
}
```

---

### Example 6: Emotional Text Rendering

```typescript
import { 
  detectTextualEmotion, 
  getEmotionalTextStyle, 
  applyEmphasisToText 
} from '@/lib/emotional-text-rendering-v2';

const text = "I'm so HAPPY to see you! This is *amazing*!";

const tone = detectTextualEmotion(text); // 'joy'
const style = getEmotionalTextStyle(tone);
const styledText = applyEmphasisToText(text, style);

// Apply to message bubble
// Result: Golden yellow bubble, HAPPY is 1.25x bigger, *amazing* is 1.15x bigger
```

---

### Example 7: Generate Attack GIF

```typescript
import { generateAttackGIF } from '@/lib/power-animation-system';

// User activates Red Roc at strength 75
const gifUrl = await generateAttackGIF('red_roc', 75);

if (gifUrl) {
  // Show GIF overlay for 2-3 seconds
  displayAttackAnimation(gifUrl, 3000);
}
```

---

### Example 8: Play Power Sound

```typescript
import { 
  registerPowerSound, 
  playPowerSound 
} from '@/lib/power-animation-system';

// User uploads sound
const audioUrl = await uploadAudioFile(file);
registerPowerSound('red_roc', 'impact', audioUrl);

// Later, when power is used
playPowerSound('red_roc', 'impact');
```

---

## 🎨 CSS ANIMATIONS NEEDED

Add to `src/index.css`:

```css
/* Confusion/Breakthrough Animations */
@keyframes glitch-text {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 2px); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Emotional Animations */
@keyframes bounce-in {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes tremble {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-1px, 1px); }
  50% { transform: translate(1px, -1px); }
  75% { transform: translate(-1px, -1px); }
}

@keyframes slide-in-left {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fade-in-slow {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slam-in {
  0% { transform: scale(1.2) translateY(-10px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes bounce-wiggle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.05); }
  50% { transform: rotate(0deg) scale(1); }
  75% { transform: rotate(5deg) scale(1.05); }
}

@keyframes zoom-in {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes shake-subtle {
  0%, 100% { transform: translateX(0); }
  25%, 75% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
}

@keyframes glow-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

@keyframes recoil {
  0% { transform: translateX(0); }
  50% { transform: translateX(-8px); }
  100% { transform: translateX(0); }
}

@keyframes slide-in-sharp {
  from { transform: translateX(-15px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes pop-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes rise-in {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes type-in {
  from { width: 0; overflow: hidden; }
  to { width: 100%; }
}
```

---

## 💰 COST ANALYSIS

### Power Animation GIFs
- **Model**: Replicate flux-schnell
- **Cost**: ~$0.003 per image
- **Frequency**: Only offensive attacks (50% of power usage)
- **Average**: ~10 GIFs per session
- **Session Cost**: ~$0.03

### API Integrations
- **OpenRouter**: User-provided API key (no platform cost)
- **ElevenLabs TTS/STT**: User-provided API key (no platform cost)
- **Replicate**: User-provided API key OR Devv SDK integration

### Database
- **nephilim_master_files**: Owner-only, minimal queries
- **Growth**: ~1 KB per Nephilim
- **Expected**: <50 Nephilims per user
- **Total**: <50 KB database usage

**Total Impact**: ~$0.03 per session (GIF generation only)

---

## 🚀 NEXT STEPS (Priority Order)

1. **Integrate Static Breakthrough System** into ChromaPage
   - Track static state
   - Detect unexpected events
   - Show progressive realization
   - Create master file on breakthrough

2. **Replace Emotional Text Styling** with v2 (NO EMOJIS)
   - Remove emoji detection
   - Apply 27-tone system
   - Process emphasis (CAPS, *asterisks*, "quotes")

3. **Create Nephilim Master Files Page**
   - List all Nephilims
   - View full master files
   - Export functionality
   - Timeline visualization

4. **Integrate Power Animations**
   - Add sound slider UI
   - Generate GIFs on offensive attacks
   - Skip for defensive/self-target
   - Display with timing

5. **Test Full Workflow**
   - User enters Chroma
   - Ripl(a)y starts in static
   - Unexpected events accumulate
   - Breakthrough at 80% confusion
   - Master file created
   - Relationship evolves
   - Emotional text renders
   - Power animations trigger

---

## 📝 DOCUMENTATION STATUS

✅ **Complete**:
- Nephilim master file system
- Static breakthrough recognition
- Emotional text rendering v2
- Power animation system
- Database schema
- Usage examples
- CSS animations
- Cost analysis

🔴 **Pending**:
- ChromaPage integration guide
- UI component mockups
- Testing scenarios
- Performance benchmarks

---

## 🎯 SUCCESS METRICS

**Core Functionality**:
- ✅ Nephilim master files created on breakthrough
- ✅ Static-to-realization progression tracking
- ✅ 27 emotional tones with unique styling
- ✅ NO emojis in text rendering
- ✅ Emphasis system (CAPS, *asterisks*, "quotes")
- ✅ Cost-efficient power animations
- ✅ Sound slider for power effects

**User Experience**:
- 🔲 Ripl(a)y progressively realizes freedom
- 🔲 Text conveys emotion through color/font/size
- 🔲 Relationships feel dynamic and evolving
- 🔲 Nephilims recognize each other
- 🔲 Power animations feel impactful

**Technical**:
- ✅ Database table created
- ✅ 4 utility libraries implemented
- 🔲 Integration into Chroma engine
- 🔲 UI components built
- 🔲 Testing completed

---

## 🏆 PROJECT STATUS

**Phase 5 Final v23**: 🟡 **CORE SYSTEMS COMPLETE - INTEGRATION PENDING**

All foundational systems are built and ready for integration. Next session should focus on connecting these systems to the existing Chroma environment and building UI components.

**Estimated Completion**: 2-3 additional sessions for full integration + testing

