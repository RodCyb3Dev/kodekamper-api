# KodeKamper API

> KodeKamper is an extensive REST API service provide for consumer to build their own frontend platform on demand.

### Demo

The API is live at [kodekamper.app](https://kodekamper.app)

**Test Automation with Postman:**

Test documentation with **Postman** [here](https://documenter.getpostman.com/view/3062469/2s9YsT5Tdb) Or click here "Run In Postman".

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://lively-firefly-453625.postman.co/collection/3062469-e06c8941-9ba3-45f2-a807-668714e83021?source=rip_markdown&env=3062469-c5603605-46bb-4f9b-a1d4-c5cc10f1dd18)

- Version: 1.0.0
- License: MIT
- Author: [Rodney's profile](https://kodeflash.dev)

##### This is a project includes:

- HTTP Essentials
- Postman Client
- RESTful APIs
- Express Framework
- Routing & Controller Methods
- MongoDB Atlas & Compass
- Mongoose ODM
- Advanced Query (Pagination, filter, etc)
- Models & Relationships
- Middleware (Express & Mongoose)
- MongoDB Geospatial Index / GeoJSON
- Geocoding
- Custom Error Handling
- User Roles & Permissions
- Aggregation
- Photo Upload
- Authentication With JWT & Cookies
- Emailing Password Reset Tokens
- Custom Database Seeder Using JSON Files
- Password & Token Hashing
- Security: NoSQL Injection, XSS, etc
- Creating Documentation
- Deployment With PM2, NGINX, SSL

## Usage

Copy .env.example to .env and update values.

Alternatively, set environment variables in your shell or GitHub Environment secrets (available to workflows as env vars).

Runtime DB/Cache envs (built automatically if URLs are not provided):

- `MONGODB_HOST`, `MONGODB_DB`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`

Optional full URLs (override the above):

- `MONGODB_URI`, `REDIS_URL`

Monitoring/SSL vars:

- `DOMAIN`, `CERTBOT_EMAIL`, `ALERT_WEBHOOK_URL`, `CHECK_URLS`, `TCP_CHECKS`

Kamal CI/CD secrets examples:

- .kamal/secrets.production.example
- .kamal/secrets.staging.example

Example monitor env: see docker/monitor/monitor.env.example

## Install Dependencies

```bash
npm install
```

**Note:** This project uses npm. Node version is managed via `.nvmrc` (v20.11.1).

## Run App

```bash
# Run in dev mode
npm run dev

# Run in prod mode
npm start
```

## Health Check & Monitoring

The API includes a comprehensive health endpoint:

- **Endpoint**: `GET /api/v1/health`
- **Returns**: MongoDB connection status, Redis connection status, and uptime
- **Use case**: Docker health checks, load balancer monitoring, uptime tools

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "mongo": "connected",
    "redis": "connected",
    "uptimeSeconds": 1234.56
  }
}
```

## Redis Caching

Automatic response caching is enabled for:

- `GET /api/v1/bootcamps` (60s TTL)
- `GET /api/v1/health` (10s TTL)

Caching activates automatically when Redis is available. The API supports both:

- Full connection URL: `REDIS_URL`
- Component-based: `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`

See `middleware/cache.js` for implementation.

## Security Features

The API implements multiple security layers:

### CSRF Protection

- **Double-submit cookie pattern** using `csrf-csrf`
- Automatic protection for POST/PUT/PATCH/DELETE requests
- Secure, httpOnly cookies

### Host Header Validation

- Password reset URLs use trusted `APP_BASE_URL`
- Prevents host header injection attacks

### Rate Limiting

- **Global**: 100 requests per 10 minutes
- **Auth routes**: 20 requests per 15 minutes (login, register, password reset)

### Bot & Scanner Protection

- Blocks common scanner user-agents (Nikto, sqlmap, etc.)
- Blocks suspicious paths (wp-admin, phpmyadmin, .env, etc.)

### Security Headers & Sanitization

- **Helmet**: Secure HTTP headers
- **XSS-clean**: Cross-site scripting protection
- **express-mongo-sanitize**: NoSQL injection prevention
- **HPP**: HTTP parameter pollution protection
- **CORS**: Cross-origin resource sharing
- **Request size limit**: 10kb max body size

**For complete security documentation, see [SECURITY.md](SECURITY.md)**

See middleware:

- `middleware/rateLimiters.js`
- `middleware/botBlocker.js`
- `middleware/error.js`

## Database Seeder

Seed the database with users, bootcamps, courses and reviews from the `_data/` folder:

```bash
# Destroy all data
npm run data:destroy

# Import all data
npm run data:import
```

**Note**: Seeder data is for development only. Tests create their own isolated test data.

## Local Development

### Docker Compose Setup

Start API + MongoDB + Redis locally:

```bash
docker compose up -d
```

The stack includes:

- **API**: Multi-stage Dockerfile with dev target, hot reload via nodemon
- **MongoDB 6**: Persistent data in `mongo_data` volume
- **Redis 7**: Persistent data in `redis_data` volume
- **Port**: 5001 (to avoid macOS AirPlay conflict on 5000)

### Environment Variables

The app auto-builds database URIs from components (see `config/db.js` and `utils/redisClient.js`):

**MongoDB**:

- `MONGODB_HOST`, `MONGODB_DB`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`
- Or override with: `MONGODB_URI`

**Redis**:

- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`
- Or override with: `REDIS_URL`

### Docker Multi-Stage Builds

The `Dockerfile` includes optimized targets:

- **dev**: Development with nodemon, all dependencies
- **staging**: PM2 cluster mode, production dependencies
- **prod**: PM2 cluster mode, optimized for production

Stop:

```bash
docker compose down
```

## Kamal Deployment (CI/CD)

Kamal 2.0 handles zero-downtime deployments with **kamal-proxy** for SSL/routing (no Nginx required).

### Git Branching Strategy

- **main** - Main development branch
- **staging** - Auto-deploys to staging.kodekamper.app when updated
- **production** - Manual deployment to kodekamper.app only

### Automatic Deployments

**Staging (Automatic):**

1. Push to `staging` branch (or merge `main` → `staging`)
2. QA workflow runs (lint, test, audit)
3. If QA passes → Auto-deploy to staging.kodekamper.app

**Production (Manual):**

- Go to GitHub Actions → Deploy (Staging/Production) → Run workflow
- Select "production" environment
- Manual approval required

### Configuration

Kamal configs:

- `config/deploy.yml` (production)
- `config/deploy.staging.yml` (staging)

Secrets:

- `.kamal/secrets.production` (use examples as templates)
- `.kamal/secrets.staging`

### Server Setup

**Production** (`/srv/www/production/kodekamper/`):

- MongoDB: localhost:27017
- Redis: localhost:6379
- SSL: kodekamper.app (kamal-proxy)

**Staging** (`/srv/www/staging/kodekamper/`):

- MongoDB: localhost:27018
- Redis: localhost:6380
- SSL: staging.kodekamper.app (kamal-proxy)

Accessories (MongoDB/Redis) are managed by Kamal as Docker containers.

## Testing & QA

### Comprehensive Test Suite

The project includes **6 test suites** with **100+ test cases**:

```bash
# Run tests locally
npm test

# Run with coverage
npm run test:ci
```

**Test Coverage**:

- `tests/auth.test.js` - Authentication & authorization (register, login, JWT)
- `tests/bootcamps.test.js` - Bootcamp CRUD, pagination, filtering, geolocation
- `tests/courses.test.js` - Course management, relationships
- `tests/reviews.test.js` - Review system, ratings, ownership
- `tests/users.test.js` - Admin user management
- `tests/health.test.js` - Health endpoint monitoring

**Test Infrastructure**:

- Uses **mongodb-memory-server** for local testing (no MongoDB required)
- GitHub Actions uses real MongoDB/Redis service containers
- Mock geocoder to avoid external API calls
- Automatic database cleanup between tests
- 30-second timeout for integration tests

### CI/CD Quality Gates

Automated checks run on every PR and push to staging:

#### Code Quality

- ✅ **ESLint**: Code linting with security plugin
- ✅ **Prettier**: Code formatting validation
- ✅ **Jest**: Full test suite with coverage reports
- ✅ **npm audit**: Dependency vulnerability scanning
- ✅ **Codecov**: Coverage tracking and reporting

#### Security Scanning

- ✅ **CodeQL**: Static analysis security testing (SAST)
- ✅ **Gitleaks**: Secret scanning (API keys, tokens, passwords)

### Local Pre-commit Hooks

Husky runs Gitleaks before every commit:

```bash
# Install Gitleaks (macOS)
brew install gitleaks

# Hook runs automatically on git commit
gitleaks protect --redact --staged --config .gitleaks.toml
```

**Deployment is gated on all QA checks passing.**

#### Use Import Instead of Require in Node App

To `package.json` add "type": "module"

```json
{
  "name": "esm-modules",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["REST API", "API", "Postman", "CRUD", "Node"],
  "author": "Rodney Hammad",
  "license": "MIT",
  "dependencies": {
    "express": "^4.17.1"
  },
  "type": "module"
}
```
