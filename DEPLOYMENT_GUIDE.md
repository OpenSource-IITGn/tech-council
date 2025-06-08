# 🚀 Production Deployment Guide - Tech@IITGN Website

## 📋 Project Overview
- **Framework**: Next.js 15.3.2 with App Router
- **Authentication**: NextAuth.js with Google OAuth
- **Data Storage**: JSON files with atomic operations
- **File Storage**: Local uploads to `/public` directory
- **Admin System**: Role-based access control

---

## 1. 🌐 Frontend Hosting (Vercel - Recommended)

### Why Vercel?
- ✅ **Zero-config Next.js deployment**
- ✅ **Serverless functions for API routes**
- ✅ **Global CDN with automatic HTTPS**
- ✅ **Built-in environment variables management**
- ✅ **Automatic deployments from GitHub**

### Deployment Steps:

#### Step 1: Repository Setup
```bash
# Ensure clean repository
git add .
git commit -m "Production deployment setup"
git push origin main
```

#### Step 2: Vercel Deployment
1. **Sign up**: Go to [vercel.com](https://vercel.com) with GitHub
2. **Import Repository**: Select your tech-website repository
3. **Auto-Configuration**: Vercel detects Next.js automatically
4. **Deploy**: Click "Deploy" button

#### Step 3: Environment Variables
In Vercel Dashboard → Project → Settings → Environment Variables:

```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Step 4: Custom Domain (Optional)
1. **Add Domain**: In Vercel Dashboard → Domains
2. **DNS Configuration**: Point CNAME to `cname.vercel-dns.com`
3. **SSL**: Automatically provisioned

---

## 2. 🔧 Backend Configuration

### Serverless Functions (Automatic)
Your API routes in `/src/app/api/` automatically become serverless functions:
- ✅ **Authentication APIs**: `/api/auth/*`
- ✅ **Admin APIs**: `/api/admin/*`
- ✅ **Public APIs**: `/api/clubs/*`, `/api/hackathons/*`

### Performance Optimizations
The `vercel.json` configuration includes:
- **Function timeout**: 30 seconds for admin operations
- **Security headers**: CORS, XSS protection
- **Compression**: Enabled for faster loading

---

## 3. 💾 Database Migration Strategy

### Current: JSON File Storage
Your current setup uses JSON files in `/data/` directory with atomic operations.

### Production Recommendations:

#### Option A: Keep JSON Files (Simple)
**Pros**: No migration needed, works with current code
**Cons**: Limited scalability, no concurrent write protection

**Implementation**: 
- Files persist in Vercel's serverless environment
- Atomic writes prevent corruption
- Suitable for small-medium traffic

#### Option B: Migrate to Database (Recommended for Scale)
**Recommended**: **Vercel Postgres** or **PlanetScale**

**Migration Steps**:
1. **Choose Provider**: Vercel Postgres (integrated) or PlanetScale (MySQL)
2. **Schema Design**: Convert JSON structure to relational tables
3. **Data Migration**: Script to transfer existing JSON data
4. **Code Updates**: Replace file operations with database queries

---

## 4. 📁 File Storage Solutions

### Current: Local File Storage
Files uploaded to `/public/` directory work in development but have limitations in production.

### Production Solutions:

#### Option A: Vercel Blob Storage (Recommended)
```bash
npm install @vercel/blob
```

**Benefits**:
- ✅ **Integrated with Vercel**
- ✅ **Global CDN distribution**
- ✅ **Automatic optimization**
- ✅ **Simple migration**

#### Option B: AWS S3 + CloudFront
**Benefits**:
- ✅ **Highly scalable**
- ✅ **Cost-effective for large files**
- ✅ **Advanced features**

#### Option C: Cloudinary (Images)
**Benefits**:
- ✅ **Automatic image optimization**
- ✅ **On-the-fly transformations**
- ✅ **Built-in CDN**

---

## 5. 🔐 Authentication Production Setup

### Google OAuth Configuration

#### Step 1: Update OAuth Consent Screen
1. **Google Cloud Console** → OAuth consent screen
2. **Publishing status**: Change to "In production"
3. **Authorized domains**: Add your production domain

#### Step 2: Update Redirect URIs
Add production callback URL:
```
https://your-domain.com/api/auth/callback/google
```

#### Step 3: Environment Variables
Ensure production environment variables are set:
- `NEXTAUTH_URL`: Your production domain
- `NEXTAUTH_SECRET`: Secure random string (32+ characters)
- `GOOGLE_CLIENT_ID`: Production OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Production OAuth client secret

### Security Considerations
- ✅ **Admin email whitelist**: Already implemented
- ✅ **Route protection**: Middleware secures admin routes
- ✅ **CSRF protection**: NextAuth.js built-in
- ✅ **Secure headers**: Configured in `vercel.json`

---

## 6. 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Vercel Integration (Automatic)
Vercel automatically deploys on:
- ✅ **Main branch pushes**: Production deployment
- ✅ **Pull requests**: Preview deployments
- ✅ **Branch pushes**: Development deployments

---

## 7. 📊 Monitoring & Analytics

### Built-in Vercel Analytics
- **Performance monitoring**: Core Web Vitals
- **Function logs**: Serverless function execution
- **Error tracking**: Runtime error monitoring

### Recommended Additions:
- **Google Analytics**: User behavior tracking
- **Sentry**: Error monitoring and alerting
- **Uptime monitoring**: Service availability tracking

---

## 8. 🚀 Deployment Checklist

### Pre-Deployment
- [ ] **Environment variables**: Set in Vercel dashboard
- [ ] **Google OAuth**: Production credentials configured
- [ ] **Domain**: DNS configured (if using custom domain)
- [ ] **Admin emails**: Updated in `src/lib/auth.ts`
- [ ] **Build test**: `npm run build` succeeds locally

### Post-Deployment
- [ ] **Admin access**: Test login with admin email
- [ ] **File uploads**: Test image/file upload functionality
- [ ] **API endpoints**: Verify all admin operations work
- [ ] **Performance**: Check Core Web Vitals
- [ ] **Security**: Verify admin routes are protected

### Monitoring Setup
- [ ] **Error tracking**: Configure Sentry or similar
- [ ] **Analytics**: Set up Google Analytics
- [ ] **Uptime monitoring**: Configure alerts
- [ ] **Backup strategy**: Plan for data backup

---

## 9. 🔧 Alternative Hosting Options

### Netlify
**Pros**: Similar to Vercel, good Next.js support
**Cons**: Less optimized for Next.js than Vercel

### Railway
**Pros**: Full-stack hosting, database included
**Cons**: More complex setup, higher cost

### AWS Amplify
**Pros**: Full AWS ecosystem integration
**Cons**: More complex configuration

### Self-Hosted (VPS)
**Pros**: Full control, cost-effective for high traffic
**Cons**: Requires DevOps expertise, maintenance overhead

---

## 10. 📞 Support & Troubleshooting

### Common Issues:
1. **Build failures**: Check Node.js version compatibility
2. **Environment variables**: Ensure all required vars are set
3. **OAuth errors**: Verify redirect URIs and domain configuration
4. **File upload issues**: Check file size limits and permissions

### Getting Help:
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **NextAuth.js Documentation**: [next-auth.js.org](https://next-auth.js.org)

---

**🎉 Your tech website is ready for production deployment!**
