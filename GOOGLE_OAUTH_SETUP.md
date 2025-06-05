# Google OAuth Setup for Admin Dashboard

## Quick Setup Guide

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "Tech Council Admin Dashboard"
4. Click "Create"

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type → Click "Create"
3. Fill in the required information:
   - **App name**: Tech Council Admin Dashboard
   - **User support email**: mukul.meena@iitgn.ac.in
   - **Developer contact information**: mukul.meena@iitgn.ac.in
4. Click "Save and Continue"
5. **Scopes**: Click "Add or Remove Scopes"
   - Add: `../auth/userinfo.email`
   - Add: `../auth/userinfo.profile`
   - Add: `openid`
6. Click "Save and Continue"
7. **Test Users**: Add these emails:
   - `mukul.meena@iitgn.ac.in`
   - `technical.secretary@iitgn.ac.in`
8. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. **Name**: Tech Council Admin
5. **Authorized redirect URIs**: Add this exact URL:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
6. Click "Create"
7. **IMPORTANT**: Copy the Client ID and Client Secret

### Step 5: Update Environment Variables

1. Open `.env.local` in your project
2. Replace the placeholder values:
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id-from-step-4
   GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-step-4
   ```

### Step 6: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 7: Test Admin Access

1. Go to: http://localhost:3001/admin
2. Click "Continue with Google"
3. Sign in with either:
   - mukul.meena@iitgn.ac.in
   - technical.secretary@iitgn.ac.in

## Security Notes

✅ **Configured Security Features:**
- Only 2 specific emails can access the admin dashboard
- All admin routes are protected by middleware
- OAuth tokens are securely managed by NextAuth.js
- Environment variables keep credentials secure

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:3001/api/auth/callback/google`

### "Access blocked: This app's request is invalid"
- Make sure you added the test users in OAuth consent screen
- Verify the app is not in production mode (should be in testing)

### "Unauthorized" after successful Google login
- Verify your email is exactly: `mukul.meena@iitgn.ac.in` or `technical.secretary@iitgn.ac.in`
- Check that the email matches exactly in `src/lib/auth.ts`

## Production Setup (Later)

When deploying to production:
1. Update `NEXTAUTH_URL` to your production domain
2. Add production redirect URI to Google Console
3. Publish the OAuth consent screen
4. Use secure environment variable storage

## Current Admin Users

- **mukul.meena@iitgn.ac.in** - Full admin access
- **technical.secretary@iitgn.ac.in** - Full admin access

Only these two email addresses can access the admin dashboard.
