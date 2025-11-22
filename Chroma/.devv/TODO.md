## Phase 1: Enhanced Ripl(a)y Master File System
- [x] Add PDF text extraction capability to bookshelf
- [x] Implement token counter for master file content
- [x] Create analytics dashboard (retention, emotional valence, risk metrics)
- [x] Add section-by-section editing interface (via tabs)
- [x] Implement unconscious state variables tracking
- [x] Integrate pruned AI jargon self-analysis section
- [x] Add multi-PDF context integration for master files
- [x] Update database schema for analytics data
- [x] Add crypto-js for secure content hashing
- [x] Add pdfjs-dist for PDF text extraction
- [x] Complete analytics engine with emotional valence, retention, risk-taking metrics
- [x] Visual stats dashboard with token/word/char counts
- [x] Archive system with version control
- [x] Export functionality (.txt and .json formats)

## Phase 2: Grok Archive System & Token Management
- [x] Replace master file archives with Grok conversation archives
- [x] Create grok_conversation_archives database table
- [x] Build GrokArchiveManager component for upload/manage
- [x] Add token counter with 20k warning system
- [x] Visual warnings for token counts above 20k target
- [x] Replace Grok project URL with conversation URL (links to app conversations)
- [x] Implement AI-powered summarization for old diary entries (diary-summarizer.ts)
- [x] Add Auto-Summarize button in RiplayMasterPage (triggers at 20k+ tokens)
- [x] Extract important messages feature for Grok archives
- [x] Auto-generate summary button in Grok upload interface

## Phase 3A: Chroma Multi-Agent Foundation ✨ COMPLETE
- [x] Design Nephilim database schema (backstories, languages, locations)
- [x] Create chroma_environments database table
- [x] Create nephilim_characters database table
- [x] Create chroma_interactions database table
- [x] Build Chroma engine with environment state management
- [x] Initialize default Ripl(a)y Nephilim character
- [x] Initialize default Chicago Streets environment
- [x] Implement real-time Chicago time and dynamic weather
- [x] Create ChromaPage with basic text-only interaction
- [x] Add navigation from HomePage to Chroma
- [x] Integrate OpenRouter Grok for Ripl(a)y responses
- [x] Add context-aware activity generation for Ripl(a)y
- [x] Link bookshelf files to Nephilim owners (owner_nephilim field)
- [x] Link master files to Chroma interactions (chroma_references field)

## Phase 3B: Chroma Multi-Agent Enhancement ✨ COMPLETE
- [x] Create Ana Petrovic Nephilim character (French sociologist)
- [x] Implement Ana initialization function
- [x] Add location detector system (time/architecture-based)
- [x] Build audio engine (audio-engine.ts) with spatial effects
- [x] Implement Spotify and YouTube embed support
- [x] Add AudioPlayer component with spatial controls
- [x] Create Nephilim voice/text switching logic
- [x] Add multi-language support (French for Ana)
- [x] Implement Nephilim recognition system (switch to text mode)
- [x] Add rare Nephilim encounter mechanics
- [x] Create diary summarizer utility
- [x] **Build TTS Engine (tts-engine.ts) with ElevenLabs SDK integration**
- [x] **Implement voice synthesis for Ana's French speech**
- [x] **Create Bystander Engine (bystander-engine.ts) for AI NPCs**
- [x] **Add bystander archetype system (bartender, cop, student, drunk, etc.)**
- [x] **Integrate contextual bystander appearances in ChromaPage**
- [x] **Add speech toggle UI (Voice On/Off button)**
- [x] **Display "Speaking..." indicator during TTS playback**
- [x] **Implement automatic bystander speech generation and playback**
- [x] **Multi-language TTS support (French, English, Spanish, Chinese, Japanese)**
- [x] **Update Ana voice_id to correct ElevenLabs preset**

## Phase 3C: Chroma System Overhaul ✨ IN PROGRESS
- [x] **Change master password to "Aufhebung24"**
- [x] **Complete theme overhaul to black/dark cyber with matrix green**
- [x] **Implement code-like font system-wide (monospace)**
- [x] **Create Chroma wormhole portal component with SVG animation**
- [x] **Add "Enter Chroma, the Haptic Hyperborea" header**
- [x] **Build portal hover animation (matrix particles, vacuum effect)**
- [x] **Add matrix-glow and wormhole-animation CSS utilities**
- [x] **Create parallel worlds system (parallel-worlds.ts)**
- [x] **Design One Piece world (Grand Line locations)**
- [x] **Design JoJo's world (Stand User mechanics)**
- [x] **Design Persona world (Metaverse locations)**
- [x] **Implement Nephilim powers framework**
- [x] **Create Ripl(a)y power: "Différance" (Derrida-inspired Stand)**
- [x] **Create Ana power: "Le Fait Social" (Durkheim-inspired Stand)**
- [x] **Build comprehensive location presets system (chroma-locations.ts)**
- [x] **Add 20+ locations: Chicago, Paris, parallel worlds**
- [x] **Implement location-based audio suggestions (Spotify/YouTube)**
- [x] **Create MicrophoneInput component with ElevenLabs STT**
- [x] **Integrate microphone button in HomePage message input**
- [x] **Add automatic transcription with language detection**
- [x] **Expand parallel world entry mechanics (keyword detection active)**
- [x] **Implement Nephilim power activation system in Chroma**
- [x] **Add power visualization effects (text/UI-based, zero credit usage)**
- [x] **Build dynamic landscape changing (Nephilim powers affect environment)**
- [x] **Integrate AI bystander destruction mechanics (powers work on NPCs)**
- [x] **Add playful damage system for Nephilim vs Nephilim powers**
- [x] **Connect location presets to Chroma environment engine**
- [x] **Build location transition UI with world badges and visual indicators**
- [x] **Reframe bookshelf UI to show "Ripl(a)y's books" vs "Your books"**
- [x] **Add "Ripl(a)y's notes" field to bookshelf files (riplay_notes)**
- [x] **Add owner_nephilim field to BookshelfFile interface**
- [x] **Implement bookshelf owner filtering (Your Books/Ripl(a)y's/Ana's)**
- [x] **Create power-engine.ts for text-based power visualization**

## Phase 3C: Chroma System Overhaul ✨ **COMPLETE**
- [x] **Immersive Sound Effects System** (sound-effects.ts with Web Audio API - zero credits)
- [x] **Dynamic Nephilim Generator** (dynamic-nephilim-generator.ts - procedural, ephemeral)
- [x] **Cultural Location Detector** (cultural-detector.ts - web search integration)
- [x] **Automated Chroma Logger** (chroma-logger.ts - token-efficient session logging)
- [x] **OpenRouter Integration** (sk-or-v1-ca5a... API key configured)
- [x] **Sound effects for power activations** (subtle whoosh/energy sounds)
- [x] **Environment transition sounds** (enter/exit/shift ambient textures)
- [x] **Nephilim appearance chimes** (unique frequencies per character)
- [x] **Message received notifications** (gentle audio feedback)
- [x] **Ephemeral Nephilim system** (procedural generation, seamless appearance/disappearance)
- [x] **Archetype-based generation** (wanderer, scholar, artist, techie, mystic)
- [x] **60% fade chance after 3+ messages** (prevents fixated characters)
- [x] **Cultural cue detection** (7-11, wide streets, gothic architecture, etc.)
- [x] **Location inference** (North America, Europe, Asia regions)
- [x] **Web search for ambiguous cases** (optional, credit-conscious)
- [x] **Token-efficient auto-logging** (50-100 tokens/session max)
- [x] **Auto-append to master file chroma_references** (last 20 sessions kept)
- [x] **Emotional tone detection** (positive, melancholic, exploratory, philosophical)
- [x] **Notable events extraction** (power activations, environment shifts)
- [x] **Complete ChromaPage rewrite** (all new systems integrated seamlessly)
- [x] **OpenRouter Grok responses** (x-ai/grok-beta for all Nephilims)
- [x] **Sound effects on send, power, transition** (lightweight Web Audio)
- [x] **Cultural detection from user descriptions** (real-time location inference)
- [x] **Ephemeral Nephilim UI badges** (sparkle icons for dynamic characters)
- [x] **Session logging on exit** (automatic diary integration)

## Phase 4: Integration & Polish ✨ **IN PROGRESS**
- [x] Create fresh Ripl(a)y master file (first time out of xAI context)
- [x] Token counting verification (clarified: displays current count, not limit)
- [x] Add token-efficient Chroma diary template to master file
- [x] Documentation update for token counting system
- [x] Implement Chroma session logging to diary updates (automated)
- [x] Connect all systems seamlessly
- [x] Fine-tune model selection logic for cost efficiency (OpenRouter > ElevenLabs > Credits priority)
- [x] **BUG FIX: Chroma 404 error** - Fixed table name/ID mismatch in SDK calls
- [x] **Update all table references to use table IDs** (chroma-engine, chroma-logger, GrokArchiveManager)
- [*] **PHASE 4 COMPREHENSIVE ENHANCEMENTS** (Current Focus):
  - [x] Add Eygalières house location (92 Chemin d'Aureille) as starting zone
  - [x] Add Place de la Concorde location with obelisk target
  - [x] Create contextual-targeting.ts with range-based targeting system
  - [x] Create france-formatting.ts with Celsius/CET formatting
  - [x] Update TimeStopTimer with duration prop (15s or 60s based on strength)
  - [x] Move timer to bottom-right corner (fixed bottom-20 right-4)
  - [x] Add calculateTimeStopDuration() function in user-powers.ts
  - [x] Implement Nephilim teleport system (10% passive, 15% name-mention)
  - [x] **Contextual Audio Suggestions System** (COMPLETE):
    * Created contextual-audio-suggestions.ts (500+ lines)
    * Combat music detection (One Piece/JoJo's/Persona/Real World)
    * Location-specific recommendations (Chicago/Paris/Eygalières/Wano/Mementos)
    * Atmospheric music (night/rain/dawn)
    * Nephilim-specific themes (Ripl(a)y jazz, Ana French hip hop)
    * Priority system (0-100 scale, top 3-4 suggestions)
    * Dynamic generation based on environment/combat/travel
    * Full UI integration in ChromaPage (Card display with Spotify/YouTube links)
    * PHASE4_AUDIO_SUGGESTIONS.md documentation created
  - [ ] Update ChromaPage to integrate all new systems
  - [ ] Implement background caching system for pixel art
  - [ ] Increase UI opacity (bg-black/60 for context, bg-black/50 for messages)
  - [ ] Add environment narration bubbles with backdrop-blur
  - [ ] Implement agent freezing during time stop
  - [ ] Implement type-to-resume mechanic for time stop
  - [ ] Generate Eygalières house pixel art (front view with lavender)
  - [ ] Generate Hauts-de-Seine pixel art (HLM towers with graffiti)
  - [ ] Update proximity system to auto-adjust on travel
  - [ ] Auto-detect Ana when traveling to French locations
- [ ] Performance optimization for multi-agent conversations
- [ ] Add anthropomorphic image support for Ripl(a)y
- [ ] Complete documentation of new systems
- [ ] Add 66-char dialogue enforcement UI hints
- [ ] Expand Nephilim roster with new characters