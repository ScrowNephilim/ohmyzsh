# Dev Mode to Real Authentication Switch

## Overview
This feature allows users to seamlessly transition from dev mode (master password bypass) to real authentication when they're ready to use full SDK features.

## Problem Solved
**User Issue**: "I don't receive email codes ever"
**Original Solution**: Master password bypass for dev mode UI testing
**New Enhancement**: Ability to switch from dev mode to real authentication to enable SDK features

## Implementation

### 1. Auth Store Enhancement (`auth-store.ts`)
```typescript
interface AuthState {
  // ... existing fields
  switchToRealAuth: () => Promise<void>; // NEW: Switch from dev to real auth
}

// NEW function implementation:
switchToRealAuth: async () => {
  const state = get();
  // Store email for convenience when switching
  if (state.user?.email) {
    localStorage.setItem('dev_mode_email', state.user.email);
  }
  // Clear dev mode session
  localStorage.removeItem('DEVV_CODE_SID');
  set({ user: null, isAuthenticated: false, isDevMode: false });
}
```

**What it does**:
- Stores the user's email (from dev mode) in localStorage
- Clears the mock dev session
- Resets auth state
- User will be redirected to login page with email pre-filled

### 2. HomePage Switch Button
```tsx
{isDevMode && (
  <Button
    variant="outline"
    size="sm"
    className="w-full text-xs border-orange-500 text-orange-500 hover:bg-orange-500/10"
    onClick={handleSwitchToRealAuth}
  >
    🔐 Switch to Real Auth
  </Button>
)}
```

**Location**: Sidebar user footer (above user info)
**Visual**: Orange-themed button matching dev mode color scheme
**Action**: Shows toast, navigates to `/login`, then clears auth state

**Important Implementation Detail**:
```tsx
const handleSwitchToRealAuth = async () => {
  // Show toast BEFORE clearing auth state
  toast({ /* ... */ });
  
  // Navigate IMMEDIATELY (while still authenticated)
  navigate('/login');
  
  // Clear auth state AFTER navigation starts (small delay)
  setTimeout(async () => {
    await switchToRealAuth();
  }, 100);
};
```

**Why this order matters**:
1. If we clear auth state first, ProtectedRoute immediately redirects
2. The navigation and toast get interrupted/lost
3. By navigating first (to unprotected `/login` route), we avoid ProtectedRoute interference
4. The 100ms delay ensures navigation completes before state clears

### 3. LoginPage Email Pre-fill
```tsx
useEffect(() => {
  const storedEmail = localStorage.getItem('dev_mode_email');
  if (storedEmail) {
    setEmail(storedEmail);
    localStorage.removeItem('dev_mode_email'); // Clear after using
  }
}, []);
```

**What it does**:
- Checks for stored email from dev mode switch
- Pre-fills the email field
- Clears the stored email to prevent re-use

## User Flow

### Scenario: User in Dev Mode Wants SDK Features

1. **Current State**: User logged in with master password (dev mode)
   - UI works perfectly
   - SDK features (database, AI, Chroma) show warnings/blocked

2. **User Action**: Clicks "🔐 Switch to Real Auth" button in sidebar

3. **System Response**:
   - Toast notification: "🔐 Switching to Real Authentication"
   - Description: "Enter your email to enable full SDK features (database, AI, Chroma)"
   - Redirects to login page
   - Email field pre-filled with dev mode email

4. **Next Steps**:
   - User clicks "Continue" (email already filled)
   - Receives OTP email (assuming email delivery works)
   - Enters OTP code
   - Logs in with real authentication
   - **Full SDK access enabled**

### Fallback: Email Still Doesn't Work

If user still can't receive emails:
1. They can use master password again for UI testing
2. Or request email delivery troubleshooting (check spam, email provider, etc.)

## Technical Details

### State Management
- `isDevMode` flag tracks current auth mode
- `switchToRealAuth()` cleanly transitions state
- Email stored temporarily in localStorage (not persisted in Zustand)

### Session Handling
- Dev mode: `localStorage.setItem('DEVV_CODE_SID', 'mock_session_...')`
- Real auth: SDK-managed session ID
- Switch clears mock session, allowing real session creation

### UI Indicators
- Dev mode badge: `🔓 DEV` (orange, shown in sidebar)
- Switch button: Only visible when `isDevMode === true`
- Toast notifications guide user through transition

## Testing Scenarios

### Test 1: Successful Switch
1. Login with master password
2. Click "Switch to Real Auth"
3. Verify email pre-filled on login page
4. Enter OTP (if email works)
5. Verify full SDK access

### Test 2: Switch and Back to Dev
1. Login with master password
2. Click "Switch to Real Auth"
3. Use master password again instead of waiting for OTP
4. Verify back in dev mode

### Test 3: Email Pre-fill Cleanup
1. Login with master password using email A
2. Click "Switch to Real Auth"
3. Change email to B on login page
4. Complete login
5. Logout and login again
6. Verify email not auto-filled (cleaned up)

## Code Changes Summary

### Files Modified
1. **`src/store/auth-store.ts`**:
   - Added `switchToRealAuth()` function
   - Email storage in localStorage during switch

2. **`src/pages/HomePage.tsx`**:
   - Added `switchToRealAuth` from store
   - Added `handleSwitchToRealAuth()` handler
   - Added switch button in sidebar footer
   - Restructured footer with `space-y-2` for button

3. **`src/pages/LoginPage.tsx`**:
   - Added `useEffect` to check for stored email
   - Pre-fills email field from localStorage
   - Cleans up stored email after use

### No Breaking Changes
- Existing dev mode functionality unchanged
- Master password bypass still works
- SDK guards remain in place
- All UI warnings/indicators preserved

## User Benefits

1. **Flexible Authentication**:
   - Start with dev mode (no email needed)
   - Switch to real auth when ready
   - Smooth transition without data loss

2. **Clear Path to Full Features**:
   - Visual indicator when in dev mode
   - One-click switch to real auth
   - Helpful toast messages guide process

3. **Email Convenience**:
   - Email pre-filled after switch
   - Less typing, faster workflow
   - Cleaned up automatically

4. **Fail-Safe Design**:
   - Can always go back to dev mode
   - No forced authentication
   - User controls when to switch

## Future Enhancements (Optional)

1. **Email Delivery Troubleshooting**:
   - Add "Email not arriving?" help link
   - Suggest checking spam folder
   - Provide alternative contact method

2. **Partial SDK Access in Dev Mode**:
   - Allow read-only database operations
   - Enable local-only AI chat
   - Provide mock data for testing

3. **Switch Prompt**:
   - Show reminder after X days in dev mode
   - Suggest switching when trying SDK features
   - Gentle nudge towards full authentication

## Troubleshooting

### Issue: Button Click Disconnects/Logs Out
**Symptoms**: Clicking "Switch to Real Auth" immediately logs you out without navigating to login page

**Root Cause**: 
- If auth state is cleared before navigation, ProtectedRoute detects `isAuthenticated: false`
- ProtectedRoute immediately redirects to login, interrupting the navigation
- Toast notification doesn't show, user sees abrupt logout

**Fix Applied**:
- Navigate to `/login` FIRST (while still authenticated)
- Clear auth state AFTER with 100ms delay
- Since `/login` is unprotected, ProtectedRoute won't interfere
- Smooth transition with visible toast notification

### Issue: Email Not Pre-filled
**Possible Causes**:
1. Email wasn't set in dev mode session (mock user has no email)
2. localStorage cleared between switch and login page load
3. Browser privacy settings blocking localStorage

**Solution**: Manually enter email on login page

### Issue: Still Can't Receive Emails
**This feature doesn't fix email delivery** - it only makes switching easier. If emails still don't arrive:
1. Check spam/junk folder
2. Verify email provider isn't blocking automated emails
3. Try a different email address
4. Contact support for email delivery troubleshooting

## Related Documentation
- `.devv/DEV_MODE_FIX.md` - Dev mode SDK guards and session handling
- `.devv/MASTER_PASSWORD.md` - Master password bypass documentation
- `src/store/auth-store.ts` - Authentication state management
