# Quick Guide: Email OTPs Not Working

## TL;DR - Immediate Solution

**Use Dev Mode to access the app right now:**

1. Go to login page
2. Enter **any email address** (doesn't matter which)
3. Click "Continue"
4. On verification code page, enter: `Aufhebung24`
5. You're in! 🎉

**Note:** Dev mode lets you explore the entire UI but disables SDK features (database, AI, Chroma). Perfect for testing and UI work.

---

## Why Aren't I Getting Emails?

The email system is controlled by **Devv's backend infrastructure**. We can't fix email delivery from the frontend. Common reasons:

1. **Spam folder** - Check there first!
2. **Email provider blocking** - Work/school emails often block automated emails
3. **Slow delivery** - Can take 2-5 minutes
4. **Backend issues** - Devv's email service might be having problems

---

## What Can You Do?

### Option 1: Try Different Email Provider
**Best providers (in order):**
1. Gmail (most reliable)
2. Outlook/Hotmail
3. ProtonMail
4. Yahoo Mail

**Avoid:**
- Work emails (often blocked)
- School emails (strict filters)
- Temporary email services

### Option 2: Use Dev Mode (Recommended)
**This is your best option if emails aren't working:**

- ✅ Full UI access - explore all pages and features
- ✅ Test layouts and interactions
- ✅ Verify visual design
- ❌ No database operations
- ❌ No AI features
- ❌ No Chroma environment

**Perfect for:** UI testing, design verification, exploring the app

### Option 3: Wait and Retry
- Check **spam/junk folder** thoroughly
- Wait **2-3 minutes** for email to arrive
- Try **incognito/private browsing mode**
- Clear browser cache and cookies

---

## How to Check What's Wrong

**Open browser console (F12 → Console tab) and look for:**

### Success:
```
[LoginPage] OTP sent successfully! Check your email: your@email.com
```
→ Email was sent, check spam folder

### Error:
```
[LoginPage] Failed to send OTP: [error message]
```
→ See what specific error is shown

**Common errors:**
- "rate limit" → Wait 5-10 minutes
- "invalid email" → Fix email format
- Other errors → Backend issue (not something we can fix)

---

## What Works in Dev Mode?

### ✅ Available:
- All pages (HomePage, RiplayMasterPage, ChromaPage, Bookshelf, Emotions)
- Navigation and routing
- UI components and styling
- Button interactions
- Visual animations
- Form inputs

### ❌ Disabled:
- Saving/loading conversations
- AI chat responses
- Database operations
- File uploads
- Chroma multi-agent environment
- Master file operations
- Web search

When you try these features, you'll see a helpful toast: "🔓 Dev Mode - Database features require real authentication"

---

## Future: When Emails Start Working

**You can switch from dev mode to real authentication:**

1. Click **"🔐 Switch to Real Auth"** button in sidebar (bottom)
2. You'll be redirected to login page with your email pre-filled
3. Enter real OTP from email
4. All SDK features unlocked! 🚀

---

## Technical Context

**Email OTP flow:**
```
Frontend → Devv Backend → Email Service → Your Inbox
   ↑                                          ↓
   We control this                We DON'T control this
```

**What this means:**
- We can improve UI, error messages, and user guidance
- We **cannot** fix email delivery, spam filtering, or provider blocking
- Backend email service is managed by Devv infrastructure

---

## Recommendation

**Use Dev Mode** to explore and work with the app's UI right now. It's a fully functional testing environment that gives you immediate access.

When you need SDK features (database, AI), you'll need working email delivery - try the different email provider suggestions above.

---

Last Updated: 2025-01-15
Password: Aufhebung24
Status: Email delivery controlled by Devv SDK backend
