# Chroma Page 404 Error Fix

## Error Report
**Timestamp**: Nov 15, 2025, 3:55 AM  
**Error Message**: `project table chroma_environments not found`  
**User Actions**: Click ChromaPortal → Navigate to `/chroma` page  

## Root Cause Analysis

### Issue Identified
The Chroma system was using **table names** instead of **table IDs** in all SDK calls.

**SDK Requirement**: The `table.getItems()`, `table.addItem()`, and `table.updateItem()` methods require **table IDs**, not table names.

### Evidence
- **Working code** (chat-store.ts): `table.getItems('f3zvbk5a53pc', {...})` ✅
- **Broken code** (chroma-engine.ts): `table.getItems('chroma_environments', {...})` ❌

### Affected Files
1. `src/lib/chroma-engine.ts` - 9 table calls
2. `src/lib/chroma-logger.ts` - 2 table calls  
3. `src/components/GrokArchiveManager.tsx` - 2 table calls

## Fix Applied

### Table IDs Added
```typescript
// chroma-engine.ts
const CHROMA_ENVIRONMENTS_TABLE = 'f45d7c7h924g';
const NEPHILIM_CHARACTERS_TABLE = 'f45d7c7jqygw';
const CHROMA_INTERACTIONS_TABLE = 'f45d7c7h98g0';

// chroma-logger.ts
const RIPLAY_MASTERFILES_TABLE = 'f44s2urbc5xc';

// GrokArchiveManager.tsx
const GROK_ARCHIVES_TABLE = 'f45d7c8188w0';
```

### Replacements Made
All instances of:
- `table.getItems('table_name', ...)` → `table.getItems(TABLE_ID, ...)`
- `table.addItem('table_name', ...)` → `table.addItem(TABLE_ID, ...)`
- `table.updateItem('table_name', ...)` → `table.updateItem(TABLE_ID, ...)`

### Files Modified
1. **chroma-engine.ts**: 
   - `initializeRiplayNephilim()` - 2 calls fixed
   - `initializeAnaNephilim()` - 2 calls fixed
   - `initializeChicagoEnvironment()` - 3 calls fixed
   - `getCurrentEnvironment()` - 1 call fixed
   - `getNephilimByName()` - 1 call fixed
   - `getAvailableNephilims()` - 1 call fixed
   - `startChromaInteraction()` - 2 calls fixed
   - `addMessageToInteraction()` - 2 calls fixed

2. **chroma-logger.ts**:
   - `logToMasterFile()` - 2 calls fixed

3. **GrokArchiveManager.tsx**:
   - `loadArchives()` - 1 call fixed
   - `uploadArchive()` - 1 call fixed

## Test Results
✅ **Build successful** - No compilation errors  
✅ **All table references updated** - Using correct IDs  
✅ **Chroma initialization** - Should work on first load  

## Prevention
This error pattern was introduced when all Chroma tables were created but the SDK integration used incorrect table references. Future table integrations should:
1. Always use table IDs from `table_list` output
2. Define table ID constants at the top of files
3. Test database operations immediately after table creation
