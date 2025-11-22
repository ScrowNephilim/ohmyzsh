# Master File Issues & Solutions

## Issues Identified

### 1. Token Vanishing (153 Token Limit)
**Problem**: Content saved to database disappears after page reload, showing only first 153 characters
**Root Cause**: The `content` field in `riplay_masterfiles` table is defined as type `string` without length specification
**Database Behavior**: DynamoDB string type has NO hard limit, but the issue is likely:
- Frontend state management bug where content isn't fully loaded
- Network timeout during save/load operations
- Character encoding issues with special characters

**Evidence**:
- Line 157 in RiplayMasterPage.tsx: `setCurrentContent(current.content || '')`
- If database only returns 153 chars, that's what gets loaded
- Need to add logging to see actual database response

### 2. No Separation Between Ripl(a)y and Ripley
**Problem**: Both diary modes (Ripley diary generator + ripl(a)y companion) share the same master file
**Confusion**:
- **Ripley** (diary mode) - Generates post-conversation diary entries (uses Grok temp 0.7)
- **ripl(a)y** (companion mode) - Real-time dialogue partner (uses Grok temp 0.9)
- Both need DIFFERENT master files with different contexts

**Current Implementation**:
- Only ONE "current" master file in `riplay_masterfiles` table
- Both modes would overwrite each other's context
- No way to distinguish which Nephilim owns which master file

## Solutions

### Solution 1: Add Nephilim Identifier Field
Add `nephilim_type` field to `riplay_masterfiles` table:
- Values: `'riplay'` (companion) or `'ripley'` (diary writer)
- Allow multiple "current" files (one per Nephilim type)
- Filter queries by `nephilim_type` field

### Solution 2: Add Debug Logging for Content Save/Load
Add comprehensive logging to track:
- Exact content length being saved
- Database response after save
- Content length on load
- Character encoding validation

### Solution 3: Content Chunking (if needed)
If DynamoDB has undocumented limits:
- Split large content into chunks
- Store as JSON array of strings
- Reconstruct on load

## Implementation Plan

1. Update table schema with `nephilim_type` field
2. Add selector UI to choose between Ripl(a)y and Ripley master files
3. Add comprehensive save/load logging
4. Test with content >20k tokens
5. Implement chunking if needed
