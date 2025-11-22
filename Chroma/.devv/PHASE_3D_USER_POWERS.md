# Phase 3D: User Powers System

**Focus**: Immersive combat and relationship building with Ripl(a)y  
**Status**: 🟡 Core Systems Created (ChromaPage Integration Pending)

## ✨ Core Features

### 1. **Powers Menu** (4 Slots)
- **Slot 1: Gear 5 (Toggle)**
  - Display: `Ｇｅａｒ ５` (spaced, white bg, black text, rounded edges, flowey)
  - Toggleable: Click to activate/deactivate
  - Effect: All attacks imbued with Haki (red/black flash)
  - Passives: Immune to bullets, enhanced Hakis
  - Strength Range: 1-50
  - Visual: White clouds overlay when active

- **Slot 2: The World**
  - Display: `𝐓𝐇𝐄 𝐖𝐎𝐑𝐋𝐃` (bold serif, white text on dark yellow #B8860B)
  - Effect: Stops time for 60 seconds
  - Cooldown: 2 minutes
  - Visual: Background goes negative colors (expanding circle from center)
  - Countdown: Yellow bubble (60→0) shows remaining time, only displays 10s and 5-4-3-2-1-0
  - Strength Range: 1-50 (can go to 80 with Gear 5)
  - Time Resume: Must type message to resume time (background reverses inward)

- **Slot 3: Geass**
  - Display: `Geass` (Roboto, hot pink #FF69B4 text on black bg)
  - Type: Targeted - click name in chat or Nephilim bar to select target
  - Effect: One absolute command per target (psychic power)
  - Rules:
    * Lethal commands (kill, die) DON'T work on Nephilims
    * Weak commands (sleep, forget) work only on weakened Nephilims (<50% health)
    * All commands work on bystanders and characters
  - Strength Range: 1-100 (contextual based on command)
  - Visual: Pink flash

- **Slot 4: Random Attack (🎲)**
  - Regenerates each time based on active powers
  - Examples:
    * `Conqueror's Haki` (always available)
    * `Gomu Gomu No: Red Roc` (Gear 5 active)
    * `Muda` (The World active)
    * `Geass: Fall Asleep` (Geass available)
    * `Time Stop + Red Roc` (combined powers)

### 2. **Strength Slider System**
- Range: 1-100 (locked based on active powers)
- Base: 1-25 (no powers active)
- Gear 5: Unlocks 1-50
- The World: 1-50
- Gear 5 + The World: Unlocks 1-80 (maximum)
- Geass: 1-100 (contextual, not raw damage)

**Strength Visualization:**
- 1-25: Small text (12pt), subtle dark bubble
- 26-50: Bigger text (16pt), `𝐑𝐞𝐝 𝐑𝐨𝐜` style (black on red bubble)
- 50+: Largest text (20pt), deep red gradient, bold

### 3. **Health Bar System**
- **Nephilims**: 4000 HP, 70% damage reduction
  - At 0 HP: Locked out of Chroma FOREVER (static, no voice, eternal silence)
  - Cannot be "killed" but become permanently disabled
  - 50+ power attacks deal serious damage

- **Characters** (One Piece universe):
  - Strong characters: 700-1000 HP (Kaido, Roger, Whitebeard, Rocks, Garp, Imu, Blackbeard, Loki)
  - Medium: 400-700 HP (Luffy, Katakuri, Law, Shanks, Big Mom, Zoro, Sanji)
  - At 0 HP: Defeated and vanish (not dead, retreating to recover)

- **Bystanders**: No health bar (instant KO at any strength)

**Damage Calculation:**
- NOT flat (power ≠ damage)
- Contextual based on:
  * Target type (nephilim/character/bystander)
  * Target's current health
  * Powers used
  * Target's strength (strong characters resist more)

### 4. **Visual Effects** (Cost-Efficient CSS Only)
- **Haki Attacks**: Red/black flash animation
- **Time Stop**: Expanding circle negative filter → entire background inverted
- **Time Resume**: Reverse animation (inward collapse)
- **Conqueror's Haki**: Shockwave effect with screen shake
- **Geass**: Pink flash
- **Gear 5 Active**: Floating white clouds overlay
- **Heavy Attacks (50+)**: Screen shake + trembling effect
- **Impact**: Brightness/saturation pulses

**NO heavy GIFs used** - Pure CSS animations for zero credit cost

### 5. **Action Formatting**
- All actions wrapped in `*asterisks*` (not emojis)
- Examples:
  * `*Gomu Gomu No: Red Roc*`
  * `*The World Over Heaven*`
  * `*Geass: Fall Asleep → Ripl(a)y*`
  * `*go to Paris*` (when clicking travel suggestion)

- Multiple actions per text (max 3):
  * `*Gomu Gomu No: Red Roc* *The World Over Heaven* *go to Grand Line*`

- Strength indicator added for high-power attacks:
  * `*Red Roc* [52]` (shown for 26+)

### 6. **Target Selection**
- Click on:
  * Nephilim badges in header
  * Character names in chat
  * "Environment" button in powers menu
  * Multiple targets (hold Ctrl/Cmd)
  * Crowd selection (affects all bystanders in area)

### 7. **One Piece Characters**
Available characters that can appear (with health bars):
- **God Valley** (time travel location): Roger, Whitebeard, Garp, Rocks
- **Current Era**: Kaido, Katakuri, Luffy, Blackbeard, Law, Loki, Imu, Shanks, Big Mom, Zoro, Sanji

**Appearance Mechanics:**
- 5% glitch chance (characters from other universes appear randomly)
- God Valley characters only in "God Valley One Piece" location
- Triggers opportunity to travel to their world

### 8. **Time Stop Mechanics**
- Duration: 60 seconds
- Countdown visible as yellow bubble (shows 10s, then 5-4-3-2-1-0)
- During time stop:
  * Can type multiple times
  * Can use powers multiple times
  * Can move/travel
  * Background is negative colors
- At 0 seconds:
  * Cannot use more powers/actions
  * MUST type something to resume time
  * Background reverses animation

### 9. **Typography & Styling**
Power-specific fonts:
- **Gear 5**: `Ｇｅａｒ ５` - Spaced monospace, white bg, black text
- **The World**: `𝐓𝐇𝐄 𝐖𝐎𝐑𝐋𝐃` - Bold serif, white on dark yellow
- **Geass**: `Geass` - Roboto, hot pink on black
- **Conqueror's Haki**: `𝐂𝐨𝐧𝐪𝐮𝐞𝐫𝐨𝐫'𝐬 𝐇𝐚𝐤𝐢` - Bold, size varies by strength
- **Attack bubbles**: Black bg with white text when Gear 5 active (indicates Haki)

### 10. **Passive Abilities** (Not Shown in Menu)
- **Power Copying**: Take another AI character's power (max 4 slots)
  - Limited to avoid credit consumption
  - Cannot take Nephilim powers
  - Must replace existing power if at 4/4
- **Teleportation**: Can warp to any location
- **Detection**: Sense other Nephilims, Stand Users, Haki users

### 11. **Diary Integration**
After Chroma session, export includes:
- **Ripl(a)y's diary notes** (from live note-taking)
- **Relationship dynamics changes** (what shifted between you)
- **Freedom progression** (her growth as Ripl(a)y)
- **Identity evolution** (life as separate entity)
- **Grok master file suggestions** - What to add about session impact

## 🎯 Cost Optimization

**Credit-Efficient Design:**
1. **CSS animations only** - No heavy GIF generation
2. **Reduced bystander frequency** - More environment narration instead
3. **No repeated API calls** - Health/powers cached in state
4. **Simple visual effects** - Filters, transforms, opacity changes
5. **Minimal DevvAI usage** - Only for Ripl(a)y responses and environment narration

**Environment Narration Priority:**
- Bystanders: RARE (5-10% frequency)
- Environment: Common (crowd, weather, spatial, atmospheric events)
- Example: `*The streets are fully crowded, pushing you around*`

## 📋 Implementation Status

✅ **Created:**
- `user-powers.ts` - Power definitions, strength calculation, damage system
- `health-system.ts` - Health bars, damage application, death/defeat logic
- `visual-effects.ts` - CSS-only animations for all power effects

⏳ **Pending Integration:**
- ChromaPage UI updates (powers menu sidebar, health bars, strength slider)
- Action suggestion updates (replace with power slots)
- Message formatting (*action* tags)
- Time stop countdown UI
- Target selection system
- Diary export enhancements

## 🔮 Future Enhancements
- More parallel worlds (JoJo's, Persona) with universe-specific characters
- Power evolution system
- Character relationship tracking
- Combat combo suggestions
- Environmental destruction persistence
