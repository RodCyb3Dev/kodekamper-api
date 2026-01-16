# syntax=docker/dockerfile:1.6
ARG NODE_VERSION=20.11.1

# Base stage - common setup
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user matching server 'deploy' user (UID 1000)
# Use existing node group (GID 1000) if present, or create deploy group
RUN deluser --remove-home node || true && \
    (addgroup -g 1000 deploy 2>/dev/null || true) && \
    adduser -D -u 1000 -G $(getent group 1000 | cut -d: -f1) deploy && \
    chown -R deploy:deploy /app

# Copy package files
COPY --chown=deploy:deploy package.json package-lock.json ./

# Development dependencies stage
FROM base AS deps
USER deploy
RUN npm ci

# Production dependencies stage
FROM base AS prod-deps
USER deploy
# Skip prepare scripts (like husky) in Docker builds
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Development stage
FROM base AS dev
ENV NODE_ENV=development
USER deploy
COPY --from=deps --chown=deploy:deploy /app/node_modules ./node_modules
COPY --chown=deploy:deploy . .
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev"]

# Production base stage
FROM base AS production-base
COPY --from=prod-deps --chown=deploy:deploy /app/node_modules ./node_modules
COPY --chown=deploy:deploy . .
# Install PM2 globally as root
USER root
RUN npm install -g pm2@5.3.0
USER deploy

# Production stage
FROM production-base AS prod
ENV NODE_ENV=production
EXPOSE 5000
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
ENTRYPOINT ["dumb-init", "--"]
CMD ["pm2-runtime", "ecosystem.config.js"]

# Staging stage (inherits from production-base)
FROM production-base AS staging
ENV NODE_ENV=staging
EXPOSE 5000
HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
ENTRYPOINT ["dumb-init", "--"]
CMD ["pm2-runtime", "ecosystem.config.js"]
