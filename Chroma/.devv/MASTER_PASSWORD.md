# Master Password Bypass - Development Feature

## Overview
A development convenience feature that allows bypassing email OTP verification during testing.

## How to Use

### Step 1: Enter Any Email
On the login page, enter any email address (doesn't need to be real).

### Step 2: Use Master Password
When prompted for the verification code, enter:
```
Aufhebung24
```

### Step 3: Access Granted
You'll be logged in with a mock user session.

## What Works in Dev Mode

✅ **Frontend UI Testing**
- Navigate through all pages
- Test UI interactions and animations
- View component layouts and designs
- Test routing and navigation

✅ **State Management**
- Local state updates work normally
- Zustand stores function as expected
- Component re-renders work correctly

✅ **Mock User Session**
- User object is created from email
- Session persists in localStorage
- Logout functionality works

## What Doesn't Work in Dev Mode

❌ **Backend SDK Features**
All Devv SDK operations require a real authenticated session:
- Database operations (conversations, personalities)
- AI chat (DevvAI and OpenRouter)
- File uploads
- Web search
- Any API calls to Devv services

**Why:** The SDK validates session tokens server-side. A mock session created client-side will be rejected by the backend.

## Visual Indicators

When in dev mode, you'll see:
- 🔓 **DEV badge** next to your user info in the sidebar (with proper spacing)
- Toast notification: "🔓 Dev Mode Activated - UI testing only. Database, AI, and Chroma features require real email authentication."
- **Switch to Real Auth** button in sidebar footer
- **Orange warning banners** on pages requiring SDK operations
- Hint text on login page: "🔓 Dev tip: Use master password to bypass"

## When to Use Dev Mode

✅ **Perfect for:**
- Quick UI/UX testing
- Component layout development
- Design iteration
- Navigation flow testing
- Frontend-only features

❌ **Not suitable for:**
- Testing AI responses
- Database integration testing
- File upload functionality
- Any feature requiring backend services

## Getting Real Authentication

For full functionality testing, use real email OTP:
1. Enter your real email address
2. Check your inbox for verification code
3. Enter the 6-digit code
4. Full SDK access enabled ✨

## Security Notes

⚠️ **Development Only**
- This feature is for development convenience only
- The master password is visible in source code
- Mock sessions are clearly marked and tracked
- Real data cannot be accessed via mock sessions
- Backend services validate all requests server-side

## Implementation Details

**Files Modified:**
- `src/pages/LoginPage.tsx` - Master password check
- `src/store/auth-store.ts` - Dev mode tracking
- `src/pages/HomePage.tsx` - Dev mode badge display

**Master Password:** `Aufhebung24`

**Session Storage:**
- Mock session stored in localStorage with prefix: `mock_session_`
- Dev mode flag persisted in Zustand auth store
- Real session tokens use different format and validation

## Troubleshooting

**"SDK features not working"**
→ This is expected in dev mode. Use real authentication for SDK features.

**"Can't save conversations"**
→ Database operations require real authentication. Use OTP login.

**"AI not responding"**
→ AI services require valid session tokens. Switch to real login.

**Want to exit dev mode?**
→ Click logout and log in again with real OTP verification.
