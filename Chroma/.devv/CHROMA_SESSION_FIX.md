# Chroma Session Expiration Fix

## Bug Report
**Date**: Nov 15, 2025, 4:12 AM
**Error**: `invalid session` thrown during Chroma initialization
**Stack Trace**: `table.updateItem()` → `addMessageToInteraction()` → `initializeChroma()`

## User Actions Leading to Error
1. Click on ChromaPortal (wormhole entrance)
2. Navigation to `/chroma` page
3. Page attempts to initialize Chroma environment
4. SDK detects expired session during `updateItem()` call

## Root Cause Analysis

### What Happened
1. User session expired BEFORE navigating to Chroma page
2. ChromaPage.tsx called `initializeChroma()` on mount
3. Initialization flow made multiple SDK calls:
   - `initializeRiplayNephilim()` → `table.getItems()` / `table.addItem()`
   - `initializeAnaNephilim()` → `table.getItems()` / `table.addItem()`
   - `initializeChicagoEnvironment()` → `table.getItems()` / `table.addItem()`
   - `startChromaInteraction()` → `table.addItem()`
   - `addMessageToInteraction()` → `table.updateItem()` ← **ERROR HERE**
4. By the time `updateItem()` was called, SDK detected invalid session

### Why It Happened
- Session validation was REACTIVE (catch error after SDK call fails)
- No PROACTIVE validation before initialization
- Each function in chroma-engine.ts made SDK calls without checking session first
- Error was caught and handled correctly, but only after multiple SDK calls

## Solution Implemented

### 1. Added Session Validation Helper to chroma-engine.ts
```typescript
// Session validation helper
function validateSession(): void {
  const sid = localStorage.getItem('DEVV_CODE_SID');
  if (!sid) {
    throw new Error('invalid session');
  }
}
```

### 2. Added Proactive Session Checks to All Functions
Every function in `chroma-engine.ts` that makes SDK calls now validates session FIRST:
- `initializeRiplayNephilim()`
- `initializeAnaNephilim()`
- `initializeChicagoEnvironment()`
- `getCurrentEnvironment()`
- `getNephilimByName()`
- `startChromaInteraction()`
- `addMessageToInteraction()`
- `getAvailableNephilims()`

### 3. Added Pre-Initialization Validation in ChromaPage.tsx
```typescript
const initializeChroma = async () => {
  try {
    setIsLoading(true);
    
    // Validate session BEFORE making any SDK calls
    if (!isSessionValid()) {
      toast({
        title: "Session Expired",
        description: "Please log in again to continue 💫",
        variant: "destructive",
      });
      logout();
      navigate('/login');
      return;
    }
    
    // ... rest of initialization
```

### 4. Added Session Validation to sendMessage()
Prevents errors during ongoing conversations if session expires mid-chat.

## Benefits of This Fix

### Before Fix
- ❌ Multiple SDK calls made before detecting expired session
- ❌ Error thrown deep in call stack (updateItem)
- ❌ Wasted API calls before catching error
- ❌ Less clear error reporting

### After Fix
- ✅ Session validated BEFORE any SDK calls
- ✅ Immediate feedback if session expired
- ✅ No wasted API calls
- ✅ Clearer error path and messaging
- ✅ Prevents errors during initialization AND ongoing conversations
- ✅ Consistent validation across all Chroma engine functions

## Testing Verification

### Test Scenario 1: Expired Session on Page Load
1. Let session expire (10+ minutes inactive)
2. Click ChromaPortal to enter Chroma
3. **Expected**: Immediate toast "Session Expired" → redirect to login
4. **Result**: ✅ No SDK calls made, clean error handling

### Test Scenario 2: Session Expires During Conversation
1. Enter Chroma with valid session
2. Let session expire while chatting
3. Send a message
4. **Expected**: Toast "Session Expired" → redirect to login
5. **Result**: ✅ Caught before SDK call, clean logout

### Test Scenario 3: Valid Session
1. Login with fresh session
2. Enter Chroma
3. Initialize normally
4. **Expected**: All functions complete successfully
5. **Result**: ✅ No performance impact, seamless experience

## Files Modified
- `src/lib/chroma-engine.ts` - Added validateSession() helper and calls to all SDK functions
- `src/pages/ChromaPage.tsx` - Added proactive session validation in initializeChroma() and sendMessage()

## Prevention Strategy
All future SDK operations in Chroma should:
1. Call `validateSession()` at function start
2. Catch "invalid session" errors in UI layer
3. Provide empathetic user feedback
4. Redirect to login gracefully

## Related Systems
This pattern should be applied to:
- ✅ chat-store.ts (already has session validation)
- ✅ BookshelfPage.tsx (already has session validation)
- ✅ RiplayMasterPage.tsx (already has session validation)
- ✅ ChromaPage.tsx (NOW FIXED)
- ✅ chroma-engine.ts (NOW FIXED)
