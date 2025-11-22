# Email OTP Delivery Troubleshooting

## Problem: Not Receiving Email OTP Codes

**Status:** Email delivery is controlled by Devv SDK backend - we cannot directly fix delivery issues from the frontend.

---

## ✅ What We've Done to Help

### 1. Enhanced Error Logging
- **Console logs** show detailed error information when `auth.sendOTP()` fails
- **Full error messages** displayed in toast notifications
- **Debugging visibility** helps identify if it's a backend issue, rate limiting, or email validation problem

### 2. UI Improvements
- **Troubleshooting section** on login page with common solutions
- **Email provider recommendations** (Gmail/Outlook work most reliably)
- **Spam folder reminder** prominently displayed
- **Dev mode instructions** for users who can't receive emails

### 3. Dev Mode as Fallback
- **Master password bypass** (`Aufhebung24`) allows UI testing without email
- **Clear limitations** - SDK features (database, AI, Chroma) require real authentication
- **Switch to Real Auth** button available for when email delivery works

---

## 🔍 Diagnostic Steps (Use Browser Console)

When you click "Continue" on the email input:

### Success Case:
```
[LoginPage] Attempting to send OTP to: user@example.com
[LoginPage] OTP sent successfully! Check your email: user@example.com
```
✅ **Email was sent** - Check spam folder, wait 2-3 minutes

### Failure Cases:

**1. Invalid Email Format:**
```
[LoginPage] Failed to send OTP: invalid email
```
→ Fix email address format

**2. Rate Limiting:**
```
[LoginPage] Failed to send OTP: rate limit exceeded
```
→ Wait 5-10 minutes before trying again

**3. Backend Error:**
```
[LoginPage] Failed to send OTP: [backend error message]
[LoginPage] Full error details: {...}
```
→ This is a Devv SDK backend issue - not something we can fix from frontend

---

## 🛠️ Solutions Available

### Option 1: Email Provider Troubleshooting
**Try these in order:**

1. **Check spam/junk folder** thoroughly
2. **Wait 2-3 minutes** for email delivery
3. **Try a different email address** (Gmail/Outlook recommended)
4. **Use a personal email** instead of work/school email (they may block automated emails)
5. **Check browser console** for error messages (F12 → Console tab)

### Option 2: Use Dev Mode (Recommended for Now)
**How to use:**

1. Enter **any email address** on login page
2. Click "Continue" (ignore if email doesn't arrive)
3. On OTP page, enter master password: `Aufhebung24`
4. You'll enter **Dev Mode** - UI testing works perfectly
5. **SDK features disabled** - Database, AI, Chroma won't work until real authentication

**What works in Dev Mode:**
- ✅ Navigate all pages (HomePage, RiplayMasterPage, ChromaPage, Bookshelf)
- ✅ See UI components and layouts
- ✅ Test interactions and buttons
- ✅ Visual design verification

**What doesn't work in Dev Mode:**
- ❌ Database operations (loading/saving conversations, master files)
- ❌ AI chat (DevvAI calls require real session)
- ❌ Chroma multi-agent environment
- ❌ File uploads to cloud storage
- ❌ Web search integration

### Option 3: Contact Devv Support
**If email delivery persistently fails:**

The email OTP system is managed by Devv's backend infrastructure. If you've tried multiple email providers and still can't receive codes, this may be a backend service issue that requires Devv support to investigate.

---

## 📝 Technical Details

### How Email OTP Works (Devv SDK)
```typescript
// 1. Frontend sends request to Devv backend
await auth.sendOTP('user@example.com');
// ↓ Backend processes request
// ↓ Backend sends email via their email service
// ↓ User receives email (usually within 30 seconds)

// 2. User enters code
await auth.verifyOTP('user@example.com', '123456');
// ↓ Backend validates code
// ↓ Returns session ID if valid
```

**We control:** Frontend UI, error handling, user feedback
**We DON'T control:** Backend email service, delivery reliability, spam filtering

### Why Emails Might Not Arrive
1. **Email provider blocking** - Some providers (work/school) block automated emails
2. **Spam filtering** - OTP emails often get flagged as spam
3. **Rate limiting** - Too many requests from same IP/email
4. **Backend service issues** - Devv's email service may be experiencing problems
5. **DNS/delivery delays** - Can take 2-5 minutes for emails to arrive

---

## 🎯 Recommendation

**For now, use Dev Mode** to explore and test the application's UI and design. When you need to actually use SDK features (database, AI, Chroma), you'll need working email delivery.

**Alternative email providers to try:**
- Gmail (most reliable)
- Outlook/Hotmail
- ProtonMail
- Yahoo Mail

Avoid: Work emails, school emails, temporary email services

---

## 📊 Console Logging Reference

### Check these logs after clicking "Continue":

**Location:** Browser DevTools → Console tab (F12)

**Log Pattern:**
```
[LoginPage] Attempting to send OTP to: [email]
[LoginPage] OTP sent successfully! ✅
OR
[LoginPage] Failed to send OTP: [error message] ❌
[LoginPage] Full error details: {...}
```

**What to look for:**
- Success message = email was sent (check spam)
- Error message = see specific error for solution
- "rate limit" = wait before retrying
- "invalid email" = fix email format
- Other errors = likely backend issue

---

## 🔍 OTP Verification Error Details

### Error Code 9001: Invalid Verification Code

When you see this error after entering an OTP code, check the console for detailed diagnostics:

**Console Output:**
```
[LoginPage] 🔍 Verifying OTP...
[LoginPage] 🔍 Email: [your-email]
[LoginPage] 🔍 OTP code: [your-code]
[LoginPage] 🔍 OTP length: 6 characters
[LoginPage] 🔍 OTP trimmed: [trimmed-code]
[LoginPage] 📞 Calling auth.verifyOTP()...
[LoginPage] ❌ OTP verification failed: invalid verification code
[LoginPage] 🔍 Error Code 9001: Invalid verification code - possible reasons:
  - Code was mistyped
  - Code has expired (>10 minutes old)
  - Email/code mismatch (used code for different email)
```

**✨ NEW: Input Sanitization**
The input field now:
- ✅ **Auto-trims whitespace** - Leading/trailing spaces removed automatically
- ✅ **Shows code preview** - Live display of what you've entered (including character count)
- ✅ **Max length protection** - Prevents entering more than 10 characters
- ✅ **Enhanced logging** - Console shows exact code being sent to backend

**Common Causes:**
1. **Typo in the code** - Double-check each digit carefully (UI now shows live preview)
2. **Code expired** - OTP codes expire after 10 minutes. Click "Resend Code" for a fresh one
3. **Used code for wrong email** - Make sure you're using the code that was sent to the email you entered
4. **Clicked "Back" and re-sent** - If you requested a new code, the old one becomes invalid immediately
5. **Hidden whitespace** - ✅ FIXED: Now automatically trimmed on input

**Solutions:**
- ✅ **Check live preview** - Look at "📝 Code entered" line below the input to see exact code
- ✅ Request a fresh code by clicking "Resend Code"
- ✅ Wait for the new email (check spam folder)
- ✅ Copy-paste the code (whitespace is now auto-trimmed)
- ✅ Don't click "Back" after receiving a code - stay on the verification page
- ✅ Verify you're entering the most recent code received
- ✅ **Check console logs** - Shows exact code being sent to backend

**Still not working?**
Use Dev Mode as a temporary workaround (master password: `Aufhebung24`)

---

Last Updated: 2025-01-15 (Added input sanitization, live code preview, enhanced logging)
Status: Email delivery controlled by Devv SDK backend
