# syntax=docker/dockerfile:1.6
ARG NODE_VERSION=20.11.1

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY package.json yarn.lock ./

FROM base AS deps
RUN yarn install --frozen-lockfile --production=false

FROM base AS prod-deps
RUN yarn install --frozen-lockfile --production=true

FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
USER nodejs
CMD ["yarn", "run", "dev"]

FROM base AS prod
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pm2@5.3.0 && yarn cache clean
EXPOSE 5000
USER nodejs
CMD ["pm2-runtime", "ecosystem.config.js"]
