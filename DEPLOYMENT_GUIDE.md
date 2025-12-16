# Online-Jflap Full-Stack Deployment Guide

## Project Overview
This is a full-stack JFLAP (Java Formal Languages and Automata Package) web application built with:
- **Frontend**: React + TypeScript + Vite (client/)
- **Backend**: Node.js + Express + Drizzle ORM (server/)
- **Database**: PostgreSQL

## 🚀 Complete Free Hosting Stack

Your application is now deployed on a **completely free tier** stack:

| Component | Service | Plan | Cost |
|-----------|---------|------|------|
| Frontend (Static) | GitHub Pages | Free | $0 |
| Backend API | Render | Free (512MB RAM, 0.1 CPU) | $0 |
| Database | Neon PostgreSQL | Free (0.5GB Storage) | $0 |
| **Total Monthly Cost** | - | - | **$0** |

---

## 📋 What's Been Done

### ✅ Backend Deployment (Render)
- Web Service created on Render
- Repository: `https://github.com/Itsaddu/Online-Jflap-thingi`
- Root Directory: `server/`
- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: Free (512MB RAM)

**Backend Service URL**: Will be available at `https://online-jflap-thingi.onrender.com` once deployment completes

### ✅ Database Setup (Neon)
- PostgreSQL database created on Neon
- Project: "Online-Jflap"
- Free tier benefits:
  - 0.5 GB storage
  - Scales to zero when inactive (saves resources)
  - Autoscales up to 2 CUs

---

## 🔄 Next Steps

### Step 1: Get Your Neon Database URL
1. Go to https://console.neon.tech
2. Login with your GitHub account (Itsaddu)
3. Navigate to Project: "Online-Jflap"
4. Click "Connect" button
5. Copy the connection string (it looks like: `postgresql://...`)

### Step 2: Add DATABASE_URL to Render
1. Go to https://dashboard.render.com
2. Click on "Online-Jflap-thingi" service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Set:
   - Name: `DATABASE_URL`
   - Value: (Paste the Neon connection string from Step 1)
6. Click "Save"
7. Render will automatically redeploy

### Step 3: Run Database Migrations
Once the backend is deployed:
```bash
# In your local terminal, from the server/ directory:
cd server
npm run migrate
```

Or add migration to your build process in Render's Advanced settings.

### Step 4: Configure Frontend (GitHub Pages)
1. Update `.env` files in `client/` folder with your backend URL:
   ```
   VITE_API_URL=https://online-jflap-thingi.onrender.com
   ```

2. Create `.github/workflows/deploy.yml` to auto-deploy frontend:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: cd client && npm install && npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./client/dist
             cname: yourdomain.com (optional)
   ```

3. Push changes to trigger deployment

---

## 🎯 Architecture

```
User Browser
    ↓
    ├→ GitHub Pages (Static Frontend)
    │  └→ React App
    │     └→ API Calls
    │
    └→ Render Web Service (Backend API)
       └→ Node.js/Express
          └→ Drizzle ORM
             └→ Neon PostgreSQL
```

---

## 🔐 Environment Variables

### Server (.env in server/ folder)
```
DATABASE_URL=postgresql://user:password@host/dbname
PORT=3000
NODE_ENV=production
```

### Client (.env in client/ folder)
```
VITE_API_URL=https://online-jflap-thingi.onrender.com
```

---

## 📊 Service Status

### Render Dashboard
- **URL**: https://dashboard.render.com/web/srv-d50kp9f5r7bs739h5bn0
- Service: "Online-Jflap-thingi"
- Monitor deployment logs, crashes, and environment variables

### Neon Console
- **URL**: https://console.neon.tech/app/projects/long-fire-72571878
- Project: "Online-Jflap"
- Monitor database usage, connection pools, and backups

### GitHub Actions
- Configure auto-deployment on `push` to `main` branch
- Automatically builds and deploys frontend to GitHub Pages

---

## ⚙️ Configuration Files to Update

### 1. server/package.json
Ensure these scripts exist:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "migrate": "drizzle-kit migrate"
  }
}
```

### 2. server/.env.example
```
DATABASE_URL=postgresql://user:password@host/dbname
PORT=3000
NODE_ENV=production
```

### 3. client/.env.example
```
VITE_API_URL=https://online-jflap-thingi.onrender.com
```

---

## 🐛 Troubleshooting

### Backend not connecting to database
- Verify DATABASE_URL in Render Environment variables
- Check Neon database is running (not spun down)
- View logs in Render dashboard

### Frontend API calls failing
- Verify VITE_API_URL is correct
- Check CORS settings on backend
- Add CORS headers in Express middleware

### Render service keeps crashing
- View logs: Dashboard → Logs tab
- Check if migrations need to run
- Ensure package.json has correct start command

### Neon database spun down
- Free tier spins down after inactivity
- Just make a request to wake it up
- Takes ~5-10 seconds to spin back up

---

## 📈 Scaling (Future)

When you're ready to upgrade:

**Frontend**: Keep GitHub Pages free, or upgrade to Vercel/Netlify Pro ($10-20/mo)

**Backend**: Upgrade Render to Starter ($7/mo) for guaranteed uptime

**Database**: Upgrade Neon to paid plan ($0.135 per GB + compute)

---

## 💡 Tips

1. **Local Development**: Run `npm run dev` in both `client/` and `server/` directories
2. **Database Debugging**: Use Neon's SQL Editor to run queries directly
3. **Log Monitoring**: Set up Render alerts for crashes
4. **Performance**: Monitor Neon's compute usage in free tier
5. **Backups**: Neon free tier includes daily backups (14-day retention)

---

## 🚨 Important Notes

⚠️ **Free Tier Limitations**:
- Render services spin down after 15 minutes of inactivity (takes ~5-10s to wake up)
- Neon database spins down after 30 minutes (takes ~5-10s to wake up)
- Limited to 512MB RAM on Render
- Limited to 0.5GB storage on Neon

✅ **Suitable for**:
- Personal projects
- College assignments
- Prototyping
- Small-scale demos

---

## 📚 Additional Resources

- Render Docs: https://render.com/docs
- Neon Docs: https://neon.tech/docs
- GitHub Pages: https://pages.github.com
- Drizzle ORM: https://orm.drizzle.team
- Express.js: https://expressjs.com

---

**Last Updated**: December 2025
**Deployed By**: Comet (Perplexity Assistant)
**Status**: ✅ Ready to Deploy
