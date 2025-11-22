# Dev Mode Transition Fix

## Problem
After clicking "Switch to Real Auth" button, users remain in dev mode even after navigating to the login page. This prevents access to SDK features (database, AI, Chroma).

## Root Causes

### 1. **Missing `setDevMode(false)` After Real OTP**
When users successfully verify with a **real email OTP**, the code was not explicitly calling `setDevMode(false)`. This meant if a user:
1. Logged in with master password (dev mode = true)
2. Clicked "Switch to Real Auth"
3. Entered real OTP
The dev mode flag would remain true in Zustand's persisted state.

### 2. **Persist Middleware Timing**
Zustand's persist middleware may not immediately flush state changes to localStorage. When `switchToRealAuth()` sets `isDevMode: false` and then navigation happens, there's a race condition where the old persisted state might be loaded.

### 3. **Accidental Re-entry to Dev Mode**
If users enter the master password (`Aufhebung24`) on the login page after clicking "Switch to Real Auth", they'll go right back into dev mode.

## Solution

### 1. **Explicit Dev Mode Disable on Real Auth**
```typescript
// LoginPage.tsx - After real OTP verification
const response = await auth.verifyOTP(email, otp);
setUser({
  uid: response.user.uid,
  email: response.user.email,
  name: response.user.name,
});
setDevMode(false); // ✅ NEW: Explicitly disable dev mode
toast({
  title: '✨ Welcome Back!',
  description: 'Great to see you!',
});
navigate('/');
```

### 2. **Persist Flush Delay**
```typescript
// auth-store.ts - switchToRealAuth
set({ user: null, isAuthenticated: false, isDevMode: false });

// Force a small delay to ensure persist middleware flushes
await new Promise(resolve => setTimeout(resolve, 50));
console.log('[switchToRealAuth] State persisted to storage');
```

### 3. **Comprehensive Logging**
Added detailed console logs to track the transition:
- `[handleSwitchToRealAuth]` - Button click handler
- `[switchToRealAuth]` - Auth store transition
- `[LoginPage]` - Email pre-fill and page load

## User Flow (Fixed)

### **Successful Transition: Dev Mode → Real Auth**

1. **User in Dev Mode**
   - Logged in with master password `Aufhebung24`
   - UI shows "🔓 DEV" badge in sidebar
   - SDK features blocked with toast warnings

2. **User Clicks "Switch to Real Auth"**
   - Toast appears: "🔐 Switching to Real Authentication"
   - Console: `[handleSwitchToRealAuth] User clicked switch button`
   - Navigate to `/login`
   - Console: `[handleSwitchToRealAuth] Navigating to /login`

3. **After 100ms Delay**
   - `switchToRealAuth()` called
   - Console: `[switchToRealAuth] Starting switch from dev mode to real auth`
   - Email stored: `dev_mode_email` in localStorage
   - Mock session cleared: `DEVV_CODE_SID` removed
   - State updated: `isDevMode: false`, `isAuthenticated: false`
   - 50ms delay for persist to flush
   - Console: `[switchToRealAuth] State persisted to storage`

4. **LoginPage Loads**
   - Console: `[LoginPage] Component mounted`
   - Console: `[LoginPage] Found stored email from dev mode switch: user@example.com`
   - Email field pre-filled
   - `dev_mode_email` removed from localStorage

5. **User Sends OTP**
   - Clicks "Send Code" button
   - Real OTP sent to email via Devv SDK

6. **User Enters Real OTP**
   - Enters 6-digit code from email
   - `auth.verifyOTP()` called (NOT master password)
   - Real session created by Devv SDK
   - `setDevMode(false)` called explicitly ✅ **NEW**
   - Toast: "✨ Welcome Back!"
   - Navigate to `/`

7. **User Now Has Full Access**
   - No "🔓 DEV" badge in sidebar
   - SDK features fully enabled
   - Database, AI, Chroma all work

## Common Issues & Troubleshooting

### Issue: "Still says dev mode after switch"

**Possible Causes:**
1. ✅ **You entered the master password again** - Don't use `Aufhebung24` after switching! Enter the **real 6-digit OTP** from your email.
2. ✅ **Browser cached old state** - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) and try again.
3. ✅ **Persist didn't flush** - Wait 1 second after clicking switch, then check console logs.

**Debug Steps:**
1. Open browser DevTools console (F12)
2. Click "Switch to Real Auth"
3. Look for these logs:
   ```
   [handleSwitchToRealAuth] User clicked switch button
   [handleSwitchToRealAuth] Navigating to /login
   [handleSwitchToRealAuth] Calling switchToRealAuth after delay
   [switchToRealAuth] Starting switch from dev mode to real auth
   [switchToRealAuth] Cleared auth state and disabled dev mode
   [switchToRealAuth] State persisted to storage
   [LoginPage] Component mounted
   [LoginPage] Found stored email from dev mode switch: ...
   ```
4. If logs stop partway, there's a timing issue
5. If you see "Dev Mode Activated" toast after entering OTP, you entered the master password by mistake

### Issue: "No email pre-filled on login page"

**Cause:** Either:
- You didn't have an email in dev mode session
- `dev_mode_email` was cleared before LoginPage loaded
- You manually navigated to `/login` instead of clicking the switch button

**Fix:** 
- Click the "🔐 Switch to Real Auth" button (don't manually navigate)
- If that doesn't work, manually enter your email on the login page

### Issue: "Can't receive email OTP"

This is a **separate issue** from dev mode. If you can't receive emails:
1. Check spam folder
2. Try a different email address
3. Wait 1-2 minutes and check again
4. Contact Devv support if emails never arrive

**Important:** If you can't receive emails, you'll need to stay in dev mode for now. The "Switch to Real Auth" feature won't help if the email delivery itself is broken.

## Implementation Files

### Modified Files
1. **`src/pages/LoginPage.tsx`**
   - Added `setDevMode(false)` after real OTP verification
   - Added console logs for email pre-fill debugging

2. **`src/store/auth-store.ts`**
   - Added 50ms delay in `switchToRealAuth()` to ensure persist flushes
   - Added comprehensive console logging

3. **`src/pages/HomePage.tsx`**
   - Added console logs to `handleSwitchToRealAuth()` for debugging

## Testing Checklist

- [ ] Login with master password `Aufhebung24`
- [ ] Verify "🔓 DEV" badge appears in sidebar
- [ ] Try to save master file → see "Dev mode active" toast
- [ ] Click "🔐 Switch to Real Auth" button
- [ ] See transition toast and navigate to `/login`
- [ ] Verify email is pre-filled
- [ ] Click "Send Code" and receive real OTP email
- [ ] Enter 6-digit OTP from email (NOT master password)
- [ ] See "✨ Welcome Back!" toast
- [ ] Verify "🔓 DEV" badge is GONE
- [ ] Navigate to Master File page
- [ ] Try to save → should work without "dev mode" toast
- [ ] Verify data persists after refresh

## Key Takeaway

**For users who can't receive email OTP**, this fix doesn't solve the email delivery problem. It only ensures that **IF** you successfully authenticate with a real email OTP, dev mode is properly disabled.

**The fix prevents getting "stuck" in dev mode** after transitioning, but you still need working email delivery to complete the transition.
