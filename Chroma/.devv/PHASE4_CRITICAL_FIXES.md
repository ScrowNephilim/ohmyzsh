# Phase 4 Critical Fixes - November 17, 2025

## Issues Identified

### 1. **Text Probe Special Prompts Use Emojis** (DOCUMENTATION ERROR)
- **Issue**: `.devv/PHASE4_CRITICAL_FIXES.md` says "Text Probe Scoped - ONLY for special prompts (✅, 📱, 📞, *silence*)"
- **Problem**: Special prompts are NOT emojis, they are text-only: `*silence*`, `*return*`, `*call*`
- **Root Cause**: Documentation used emoji placeholders instead of actual text prompts
- **Fix**: Update all documentation to show text-only prompts (NO emojis)

### 2. **Environment Context Text Not Readable** (NO BUBBLE)
- **Issue**: Environment context shows "*Paris, France - late night...*" with NO bubble/background
- **Problem**: White/light text on pixel art background = invisible
- **Fix**: Wrap environment context in readable bubble (backdrop-blur + dark bg + border)

### 3. **Travel Function Not Working** (10-STEP PROCESS BROKEN)
- **Issue**: Travel completes but environment doesn't update correctly
- **Problems**:
   - Location shows "Chicago Streets" when traveled to Lake Michigan
   - Background shows city when should show lake
   - Environment state (weather/temp/lighting) not updating from destination data
   - 10-step process has bugs:
     - STEP 2: getDestinationByKey/getDestinationByName lookup fails (lake_michigan vs lake_michigan_shore mismatch)
     - STEP 4: newEnvState uses destination data BUT environment state not persisting correctly
     - STEP 5: displayName correct but updatedEnv.location_name reverts to old value
     - STEP 6: getLocationById uses wrong key (destinationKey vs destination.id mismatch)
     - STEP 7: background generation succeeds but doesn't apply to UI
- **Root Cause**: Multiple bugs in travel handler (ChromaPage line 269-447)

### 4. **Proximity Slider Doesn't Auto-Adjust** (GEOGRAPHIC LOGIC MISSING)
- **Issue**: Traveling Chicago → Paris keeps Ripl(a)y at "close" (8) and Ana at "far" (60)
- **Expected**: Chicago → Paris should set Ripl(a)y to 95 (far), Ana to 10 (close)
- **Fix**: calculateProximityAfterTravel already implemented, but NOT WORKING (step 9-10 in travel)

### 5. **Proximity Slider Doesn't Match Parallel Worlds**
- **Issue**: Parallel world travel should set ALL Nephilims to 100 (another dimension)
- **Problem**: Slider shows "*another dimension*" text BUT allows adjustment
- **Fix**: Disable slider when in parallel world (show text only)

### 6. **Action Suggestions Still Show Emojis in Labels** (PHASE 4 INCOMPLETE)
- **Issue**: Action suggestions show "🌍 Lake Michigan" with emoji
- **Problem**: Immersive textual world = NO EMOJIS
- **Fix**: Remove emojis from action suggestion labels (text-only)

### 7. **Location Suggestions Show Description Overlapping**
- **Issue**: Location suggestion cards show both name AND description, causing UI overflow
- **Fix**: Simplify cards to show name + distance only (description in hover tooltip)

### 8. **Eygalières Preset Missing** (PHASE 4 REQUEST)
- **Issue**: User spawns in Eygalières, France (not in presets)
- **Fix**: Add Eygalières location preset to chroma-locations.ts

### 9. **Background Generation Not Cost-Efficient** (MULTIPLE PER LOCATION)
- **Issue**: Chicago Streets generates multiple backgrounds (daylight/night/rain/etc.)
- **Problem**: 1 location = 5+ backgrounds = EXPENSIVE
- **Solution**: 1 base background per location, THEN derive variants from weather/time/destruction
- **Cost Optimization**: 
   - Base: Generate once per location (store URL in environment table)
   - Variants: Use CSS filters/overlays (brightness, hue-rotate, saturation) for time/weather
   - Destroyed: Generate new background ONLY when environment attacked with power 50+

### 10. **Pixel Art Not Front View for Bystanders** (COST VS QUALITY)
- **Issue**: 8-bit backgrounds don't show bystanders clearly (too distant/abstract)
- **Solution**: Generate front-view prompts with "8-bit pixel art people visible in foreground"
- **Cost Check**: Only implement AFTER travel system is 100% working (priority fix first)

### 11. **No Animated Weather Effects** (PIXEL ART RAIN/THUNDER)
- **Issue**: Canvas particles work but not 8-bit style
- **Solution**: Generate pixelated animated GIFs for weather (rain drops, lightning bolts, sun rays)
- **Implementation**: 
   - Use generateWeatherGIF (already exists in immersive-visuals.ts)
   - Overlay as CSS background-image with repeat/animation
   - ONLY after travel system fixed

## Fix Priority

1. **CRITICAL** - Fix travel system (environment state updates correctly)
2. **CRITICAL** - Environment context bubble (text readability)
3. **CRITICAL** - Auto-proximity adjustment (Chicago ↔ Paris logic)
4. **HIGH** - Remove emojis from action suggestions
5. **HIGH** - Add Eygalières preset
6. **MEDIUM** - Background generation cost optimization
7. **LOW** - Front-view bystanders (ONLY after travel works)
8. **LOW** - Animated weather GIFs (ONLY after travel works)

## Testing Scenarios

### Travel System Test
1. Start in Chicago Streets
2. Click location badge → "Location Suggestions" appears
3. Click "Lake Michigan Shore"
4. **Expected**:
   - Environment context: "Lake Michigan Shore - [time]. [weather description]. [temp]. [lighting]. You notice Ripl(a)y [activity]."
   - Background: Lake/water scene (8-bit pixel art)
   - Proximity: Ripl(a)y still 8 (same city)
5. Now travel to "Hauts-de-Seine (92)"
6. **Expected**:
   - Environment context: "Hauts-de-Seine (92) - [time]. [weather]. [temp]. [lighting]. You notice Ana [activity]."
   - Background: Paris suburbs (concrete HLM towers, graffiti)
   - Proximity: Ripl(a)y → 95 (cross-continental), Ana → 10 (her territory)
   - Proximity narration: "*Ripl(a)y's presence fades as you cross the ocean...*"

### Parallel World Test
1. Travel to "Thousand Sunny"
2. **Expected**:
   - All Nephilim proximities → 100
   - Proximity sliders show "*another dimension*" (not adjustable)
   - Narration: "*Ripl(a)y fades into another dimension... completely unreachable*"

### Environment Destruction Test
1. Use power with strength 60+ on environment
2. **Expected**:
   - Environment narration: "*The environment SHATTERS—buildings collapse, ground cracks...*"
   - Background regenerates with "destroyed" in prompt (rubble, cracked ground, fire)

## Implementation Notes

- All emoji references in documentation → text-only (`*silence*`, `*return*`, `*call*`)
- Environment context bubble: `backdrop-blur-md bg-black/50 border border-white/20 p-3 rounded-lg`
- Travel system: Debug console logs at each step to verify data flow
- Proximity auto-adjust: Verify calculateProximityAfterTravel called with correct params
- Cost optimization: Store base background URLs in environment table (avoid regenerating)
