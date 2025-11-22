# PHASE 5 FINAL POLISH v3 - UX FIXES
**Date**: November 17, 2025
**Status**: 🚧 IN PROGRESS

## 🎯 Requirements

### 1. **Dev Mode Logout in Chroma**
- **Current Issue**: Logout button only works in user mode (HomePage sidebar)
- **Fix Needed**: Add dev mode logout button to ChromaPage header
- **Implementation**: 
  - Check `isDevMode` flag in ChromaPage
  - Show "🚪 Exit Dev Mode" button in header when in dev mode
  - Call `logout()` from auth store on click
  - Button should be visible and accessible in Chroma

### 2. **4 Attack Buttons Layout Optimization**
- **Current Issue**: Icons and kanjis stacked vertically (flex-col), takes too much space
- **Fix Needed**: Place icons NEXT TO kanjis horizontally with smaller font
- **Implementation**:
  - Change from `flex-col` to `flex-row` layout
  - Icon on left, kanji text on right
  - Reduce kanji font size (currently 11px)
  - Compact horizontal layout for better fit

### 3. **Rocks D. Xebec Styling**
- **Current Issue**: 
  - Text color is red (#DC143C) on gradient background, hard to read
  - Font too small (10px)
- **Fix Needed**: 
  - Light grey text on BLACK background
  - BIGGER font size for prominence
- **Implementation**:
  - Change backgroundColor to pure black: `#000000`
  - Change textColor to light grey: `#D3D3D3`
  - Increase font size from 10px to 14px or 16px
  - Remove gradient backgrounds

### 4. **Restore Geass Order Input Bar**
- **Current Issue**: Geass completely removed from UI
- **Fix Needed**: Add "Geass Order" input field back to Powers Menu
- **Implementation**:
  - Add text input below Slot 3 (Rocks D. Xebec toggle)
  - Label: "Geass Command"
  - Allows user to type custom psychic commands
  - Sends command to selected target(s)
  - Format: `*Geass: [command] → [target]*`

### 5. **Conditional Visibility: 4 Abilities Only When Rocks Active**
- **Current Issue**: 4 attack buttons always visible
- **Fix Needed**: Only show 廃止/心綱/深淵/闇 when Color of the King's Haki is active
- **Implementation**:
  - Wrap SLOT 4 grid in conditional: `{activePowers.includes('coloroftheking') && ...}`
  - Hide completely when Rocks not active
  - Show when toggled ON

### 6. **Center Gear 5 & Rocks Toggles**
- **Current Issue**: Toggle buttons have justify-between layout (text left, badge right)
- **Fix Needed**: Center the toggle button text
- **Implementation**:
  - Change from `justify-between` to `justify-center` for Gear 5 and Rocks
  - Keep ON badges visible but not push text to left
  - Use flex-col or absolute positioning for ON badges

### 7. **The World Cooldown INSIDE Bubble (Right Side)**
- **Current Issue**: The World countdown currently centered
- **Fix Needed**: Move cooldown badge to RIGHT side of bubble
- **Implementation**:
  - Change from centered to `justify-between` layout
  - Power name on left, cooldown badge on right
  - Badge shows: `5 🗨️` or `ON` badge

### 8. **One-Line Layout for 4 Abilities**
- **Current Issue**: 2x2 grid takes vertical space
- **Fix Needed**: All 4 abilities in single horizontal row when active
- **Implementation**:
  - Change from `grid grid-cols-2 gap-2` to `flex gap-2`
  - Smaller button size (reduce h-16 to h-10 or h-12)
  - Icons beside text for compact layout
  - All fit in one line

## 📋 Implementation Checklist

- [ ] Add dev mode logout button to ChromaPage header
- [ ] Test dev mode logout in Chroma
- [ ] Change 4 attack buttons to horizontal flex-row layout
- [ ] Reduce kanji font size, place icons next to text
- [ ] Change Rocks styling: black bg, light grey text, bigger font
- [ ] Add Geass command input field below Slot 3
- [ ] Wrap SLOT 4 in conditional visibility (only when Rocks active)
- [ ] Center Gear 5 and Rocks toggle text
- [ ] Move The World cooldown badge to right side
- [ ] Change SLOT 4 from 2x2 grid to single horizontal row
- [ ] Test all layouts and visibility conditions
- [ ] Build project and verify zero errors

## 🎨 Visual Design Summary

### Before:
- Dev logout: Only in HomePage sidebar
- 4 attacks: Icon above text (flex-col), 2x2 grid
- Rocks: Red text on gradient, 10px font
- Geass: Completely removed
- 4 attacks: Always visible
- Toggles: Text left, badge right
- The World: Centered
- 4 attacks: 2x2 grid

### After:
- Dev logout: ✅ Button in Chroma header
- 4 attacks: ✅ Icon next to text (flex-row), single line
- Rocks: ✅ Light grey on black, 14px font
- Geass: ✅ Input field restored
- 4 attacks: ✅ Only visible when Rocks active
- Toggles: ✅ Centered text
- The World: ✅ Cooldown on right
- 4 attacks: ✅ Horizontal flex row

## 📊 Expected Impact

- **Dev UX**: Logout accessible from Chroma (testing convenience)
- **Visual Efficiency**: 4 attacks compact, one-line layout
- **Readability**: Rocks text now visible (light grey on black)
- **Functionality**: Geass commands restored
- **UI Clarity**: Conditional visibility reduces clutter
- **Professional Look**: Centered toggles, right-aligned cooldowns

## 🧪 Testing Scenarios

1. **Dev Mode Logout**:
   - Enter Chroma in dev mode
   - See "🚪 Exit Dev Mode" button in header
   - Click button → should logout and redirect to login

2. **Rocks Activation**:
   - Toggle Rocks D. Xebec ON
   - 4 attack buttons appear in horizontal row
   - Toggle Rocks OFF → 4 buttons disappear

3. **Attack Button Layout**:
   - Icons should be next to kanjis (not above)
   - All 4 fit in single horizontal line
   - Cooldown badges on right side

4. **Geass Input**:
   - See "Geass Command" input below Slot 3
   - Type command, select target
   - Send message → formatted as `*Geass: sleep → Ripl(a)y*`

5. **Toggle Centering**:
   - Gear 5 text centered
   - Rocks text centered
   - ON badges visible but don't push text

6. **The World Cooldown**:
   - Activate The World
   - Cooldown badge appears on RIGHT side
   - Format: `5 🗨️` or `ON`

## 🔧 Files to Modify

1. `src/pages/ChromaPage.tsx` - Add dev mode logout button
2. `src/components/PowersMenuV2.tsx` - All layout/styling changes
3. `src/lib/user-powers-v2.ts` - Rocks styling constants

## 📝 Notes

- Keep all existing functionality (power logic, cooldowns, mutual exclusivity)
- Only change VISUAL layout and conditional visibility
- Ensure zero TypeScript errors
- Test all edge cases (active/inactive states, cooldowns, etc.)

