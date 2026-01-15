# Deployment Guide

## Server Preparation Status ✅

### Infrastructure Ready
- **Server**: 37.27.186.68
- **User**: deploy (UID: 1001, GID: 1001)
- **Docker**: v28.5.1 ✅
- **Docker Group**: deploy user has docker permissions ✅
- **kamal-proxy**: Running (Up 2 months) ✅
- **Kamal Network**: Created ✅

### Directory Structure
```bash
/home/deploy/kodekamper/
├── production/    # For production deployment
└── staging/       # For staging deployment
```

### Ports
- **HTTP**: 80 (kamal-proxy)
- **HTTPS**: 443 (kamal-proxy with SSL)
- **MongoDB Production**: 27017 (managed by Kamal)
- **MongoDB Staging**: 27018 (managed by Kamal)
- **Redis Production**: 6379 (managed by Kamal)
- **Redis Staging**: 6380 (managed by Kamal)

## Pre-Deployment Checklist

### 1. GitHub Container Registry
- [ ] GitHub Personal Access Token (PAT) created with `write:packages` permission
- [ ] PAT added to `.kamal/secrets.production` as `REGISTRY_PASSWORD`
- [ ] PAT added to `.kamal/secrets.staging` as `REGISTRY_PASSWORD`
- [ ] Registry username matches `RodCyb3Dev` in both configs

### 2. Secrets Configuration
- [x] `.kamal/secrets.production` file exists and is populated
- [x] `.kamal/secrets.staging` file exists and is populated
- [x] All required environment variables are set (see below)

### 3. Required Environment Variables

**Production** (`.kamal/secrets.production`):
```bash
# Registry
REGISTRY_USERNAME=RodCyb3Dev
REGISTRY_PASSWORD=<GitHub PAT>

# MongoDB
MONGODB_HOST=mongodb-production
MONGODB_DB=kodekamper
MONGODB_USERNAME=<username>
MONGODB_PASSWORD=<password>

# Redis
REDIS_HOST=redis-production
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=<password>

# JWT
JWT_SECRET=<secret>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# SMTP (email)
SMTP_HOST=<host>
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=<user>
SMTP_PASSWORD=<password>
FROM_EMAIL=noreply@kodekamper.app
FROM_NAME=KodeKamper

# Geocoding
GEOCODER_PROVIDER=mapquest
GEOCODER_API_KEY=<key>

# App Config
APP_NAME=KodeKamper
APP_ENV=production
APP_PORT=5000
```

**Staging** uses similar variables but with staging-specific values.

### 4. GitHub Actions Secrets
Add these to GitHub repository secrets (Settings → Secrets and variables → Actions):

- `REGISTRY_PASSWORD` - GitHub PAT for container registry
- `SSH_PRIVATE_KEY` - SSH key for deploy@37.27.186.68
- `KAMAL_SECRETS_PRODUCTION` - Content of `.kamal/secrets.production`
- `KAMAL_SECRETS_STAGING` - Content of `.kamal/secrets.staging`

## Deployment Process

### Git Branching Strategy

**Branches:**
- `main` - Main development branch
- `staging` - Staging environment (auto-deploys when main is merged)
- `production` - Production releases (manual deployment only)

**Workflow:**
1. Develop features on `main` branch
2. Merge `main` → `staging` to auto-deploy to staging.kodekamper.app
3. After testing on staging, manually deploy to production via GitHub Actions

### Automated CI/CD

**Staging (Automatic):**
- Trigger: Push to `staging` branch (or merge from `main`)
- QA workflow runs first (lint, test, audit)
- If QA passes → Auto-deploy to staging.kodekamper.app

**Production (Manual Only):**
- Trigger: Manual workflow dispatch in GitHub Actions
- Go to: Actions → Deploy (Staging/Production) → Run workflow
- Select "production" environment
- Requires QA to pass first

### First-Time Setup

1. **Install Kamal locally** (if not already installed):
```bash
gem install kamal
```

2. **Verify Kamal configuration**:
```bash
# Check production config
kamal config

# Check staging config
kamal config -d staging
```

3. **Setup accessories** (MongoDB & Redis):
```bash
# Production
kamal accessory boot all

# Staging
kamal accessory boot all -d staging
```

4. **First deployment**:
```bash
# Production (from main branch)
kamal deploy

# Staging (from staging branch)
kamal deploy -d staging
```

### Automated CI/CD

**Staging (Automatic):**
- Trigger: Push to `staging` branch (or merge from `main`)
- QA workflow runs first (lint, test, audit)
- If QA passes → Auto-deploy to staging.kodekamper.app

**Production (Manual Only):**
- Trigger: Manual workflow dispatch in GitHub Actions
- Go to: Actions → Deploy (Staging/Production) → Run workflow
- Select "production" environment
- Requires QA to pass first

**Workflow**: `.github/workflows/deploy.yml`

### Manual Deployment

```bash
# Deploy production
git checkout main
kamal deploy

# Deploy staging
git checkout staging
kamal deploy -d staging
```

## Useful Commands

### View Logs
```bash
# Production
kamal app logs -f

# Staging
kamal app logs -f -d staging
```

### Check Status
```bash
# Production
kamal details

# Staging
kamal details -d staging
```

### Restart App
```bash
# Production
kamal app restart

# Staging
kamal app restart -d staging
```

### Database Management
```bash
# View MongoDB logs
kamal accessory logs mongodb -f

# View Redis logs
kamal accessory logs redis -f

# Restart MongoDB
kamal accessory restart mongodb

# Restart Redis
kamal accessory restart redis
```

### SSH into Server
```bash
ssh deploy@37.27.186.68
```

### View Running Containers
```bash
ssh deploy@37.27.186.68 "docker ps"
```

## Health Check

After deployment, verify the health endpoint:

```bash
# Production
curl https://kodekamper.app/api/v1/health

# Staging
curl https://staging.kodekamper.app/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "mongo": "connected",
    "redis": "connected",
    "uptimeSeconds": 123.45
  }
}
```

## Troubleshooting

### Container Won't Start
```bash
# Check container logs
kamal app logs

# Check if ports are in use
ssh deploy@37.27.186.68 "docker ps -a"

# Remove old containers
kamal app remove
kamal deploy
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
kamal accessory logs mongodb

# Restart MongoDB
kamal accessory restart mongodb

# Verify MongoDB port
ssh deploy@37.27.186.68 "docker ps | grep mongo"
```

### Redis Connection Issues
```bash
# Check Redis status
kamal accessory logs redis

# Restart Redis
kamal accessory restart redis
```

### SSL Certificate Issues
```bash
# Check kamal-proxy logs
ssh deploy@37.27.186.68 "docker logs kamal-proxy --tail 100"

# kamal-proxy handles SSL automatically via Let's Encrypt
```

### Image Pull Errors
```bash
# Login to GitHub Container Registry on server
ssh deploy@37.27.186.68
echo $GITHUB_PAT | docker login ghcr.io -u RodCyb3Dev --password-stdin
```

## Rollback

If a deployment fails, rollback to previous version:

```bash
# List versions
kamal app images

# Rollback to previous version
kamal rollback <previous-version>
```

## Server Maintenance

### Update Docker Images
```bash
# Pull latest image
kamal app boot

# Or force rebuild
kamal deploy --skip-push=false
```

### Clean Up Old Images
```bash
ssh deploy@37.27.186.68 "docker system prune -a -f"
```

### Monitor Resources
```bash
ssh deploy@37.27.186.68 "docker stats"
```

## Security Notes

- kamal-proxy automatically handles SSL certificates via Let's Encrypt
- Firewall should allow ports 80, 443, and 22 only
- MongoDB and Redis are NOT exposed publicly (localhost only)
- All secrets are stored in `.kamal/secrets.*` files (gitignored)
- GitHub Actions uses encrypted secrets for deployment

## Next Steps

1. **Create staging and production branches:**
```bash
# Create staging branch from main
git checkout -b staging
git push -u origin staging

# Create production branch from main
git checkout -b production
git push -u origin production

# Return to main
git checkout main
```

2. **Commit and push configuration changes:**
```bash
git add config/deploy.yml config/deploy.staging.yml DEPLOYMENT.md .github/workflows/deploy.yml
git commit -m "chore: update deployment configs and branching strategy"
git push origin main
```

3. **Deploy to staging (automatic):**
```bash
# Merge main into staging
git checkout staging
git merge main
git push origin staging
# This triggers: QA → Deploy to staging
```

4. **Run QA tests locally before pushing:**
```bash
npm test
npm run lint
npm run format:check
```

5. **Monitor deployment in GitHub Actions:**
   - Go to repository → Actions tab
   - Watch QA workflow complete
   - Watch Deploy workflow execute (for staging)

6. **Deploy to production (manual):**
   - After verifying staging deployment
   - Go to GitHub Actions → Deploy (Staging/Production)
   - Click "Run workflow"
   - Select "production" environment
   - Click "Run workflow"

7. **Verify deployment:**
   - Check health endpoint
   - Test API endpoints
   - Review application logs
