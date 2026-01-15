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

`yarn` or `npm i`

## Run App

```
# Run in dev mode
yarn run dev

# Run in prod mode
yarn start
```

## Health Check

The API exposes a health endpoint for monitoring:

- `GET /api/v1/health` returns Mongo + Redis status and uptime.

## Redis Caching

Caching is enabled for:

- `GET /api/v1/bootcamps`
- `GET /api/v1/health`

Caching is automatic when `REDIS_URL` is set.

## Security Notes

The server enables:

- Request size limit (10kb)
- Global rate limiting + stricter auth rate limits
- Bot/scanner user-agent and path blocking
- Helmet, XSS clean, Mongo sanitize, HPP, CORS

See middleware:

- `middleware/rateLimiters.js`
- `middleware/botBlocker.js`
- `middleware/error.js`

## Database Seeder

To seed the database with users, bootcamps, courses and reviews with data from the "\_data" folder, run

```
# Destroy all data
yarn run data:destroy

# Import all data
yarn run data:import
```

## Local Development

Start API + Mongo + Redis locally (uses docker-compose.yml + docker-compose.override.yml automatically):

```bash
docker compose up -d
```

The app reads from `.env` and builds MongoDB/Redis URIs from individual components:

- `MONGODB_HOST`, `MONGODB_DB`, `MONGODB_USERNAME`, `MONGODB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`

Stop:

```bash
docker compose down
```

## Kamal Deploy (CI/CD)

Kamal uses **kamal-proxy** (already running on your server) for SSL/routing—no separate Nginx needed.

GitHub Actions auto-deploys via Kamal:

- `main` → production (kodekamper.app)
- `staging` → staging (staging.kodekamper.app)

Kamal configs:

- `config/deploy.yml` (production)
- `config/deploy.staging.yml` (staging)

Server directories:

- Production: `/srv/www/production/kodekamper/`
- Staging: `/srv/www/staging/kodekamper/`

Accessories (Mongo/Redis) are managed by Kamal on ports:

- Production: Mongo 27017, Redis 6379
- Staging: Mongo 27018, Redis 6380

## QA + Security (CI)

Automated checks run on PRs and staging pushes:

- ESLint + Prettier
- Jest tests with coverage (Codecov upload)
- npm audit
- CodeQL SAST (scheduled + PRs)
- Gitleaks secret scanning (PRs + main/staging)

### Local pre-commit secret scan

This repo installs a Husky pre-commit hook that runs:

`gitleaks protect --redact --staged --config .gitleaks.toml`

Install Gitleaks locally (macOS):

`brew install gitleaks`

Deploy workflow is gated on QA passing.

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
