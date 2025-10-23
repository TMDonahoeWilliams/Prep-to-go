# 🚀 Vercel Deployment Guide for College Prep Organizer

## 📋 Pre-Deployment Checklist

- [ ] **Code pushed to GitHub** (without .env file)
- [ ] **Neon database ready** for production
- [ ] **Stripe account configured** with live keys
- [ ] **Domain ready** (optional, Vercel provides free subdomain)

## 🔧 Step-by-Step Vercel Deployment

### 1. **Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your `college-prep-organizer` repository

### 2. **Configure Project Settings**
- **Framework Preset**: `Other` 
- **Root Directory**: `./` (leave empty)
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### 3. **Environment Variables**
In Vercel dashboard, add these environment variables:

```bash
# Database
DATABASE_URL=your_neon_database_connection_string

# Session Security (generate a random 32+ character string)
SESSION_SECRET=your_super_secure_random_session_secret_here

# Node Environment
NODE_ENV=production

# Stripe Configuration (LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Frontend Environment Variables
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_stripe_publishable_key

# Security - replace with your actual domain
CORS_ORIGIN=https://your-app-name.vercel.app

# Authentication (for production - replace with your values)
REPLIT_DOMAINS=your-app-name.vercel.app
REPL_ID=production-app
ISSUER_URL=https://replit.com/oidc
```

### 4. **Deploy**
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

## 🔗 Post-Deployment Configuration

### 1. **Stripe Webhook Setup**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Webhooks
2. Add endpoint: `https://your-app-name.vercel.app/api/payments/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded` 
4. Copy webhook secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

### 2. **Test Your Deployment**
- [ ] App loads without errors
- [ ] Authentication works (may need OAuth setup)
- [ ] Payment flow works with test cards
- [ ] Database operations work
- [ ] All API endpoints respond

### 3. **Custom Domain (Optional)**
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update `CORS_ORIGIN` environment variable

## 🔧 Local Development vs Production

Your app now supports both environments:

**Local Development:**
```bash
npm run dev
# Uses mock authentication + development database
```

**Production (Vercel):**
- Real authentication via OAuth
- Production database (Neon)
- Live Stripe payments
- Optimized builds

## 🐛 Troubleshooting

### Build Fails
```bash
# Check these common issues:
- All environment variables set correctly
- No TypeScript errors: npm run check
- Dependencies installed: npm install
```

### Runtime Errors
```bash
# Check Vercel Function logs:
1. Go to Vercel dashboard
2. Click on your deployment
3. Go to "Functions" tab
4. Check logs for errors
```

### Database Connection Issues
```bash
# Verify Neon connection:
1. Check DATABASE_URL format
2. Ensure database accepts connections
3. Test connection locally first
```

### Payment Issues
```bash
# Stripe configuration:
1. Use LIVE keys (not test keys)
2. Set up webhooks correctly
3. Test with real payment methods
```

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Enable in Vercel dashboard
2. Track page views and performance
3. Monitor Web Vitals

### Error Tracking
Consider adding:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Hotjar** for user behavior

## 🚀 Automatic Deployments

Your GitHub repository is now connected:
- **Push to main** → Automatic production deployment
- **Push to other branches** → Preview deployments
- **Pull requests** → Preview deployments with unique URLs

## 💡 Optimization Tips

### Performance
- Images automatically optimized by Vercel
- CDN distribution worldwide
- Automatic HTTPS

### SEO
- Server-side rendering ready
- Meta tags configured
- Sitemap can be added

### Monitoring
- Real-time logs in Vercel dashboard
- Performance insights available
- Uptime monitoring included

---

## 🎉 You're Live!

Your College Prep Organizer is now running on Vercel at:
`https://your-app-name.vercel.app`

**Next Steps:**
1. Test thoroughly with real users
2. Monitor performance and errors
3. Consider custom domain
4. Scale as needed

Need help? Check Vercel's excellent documentation or contact support!