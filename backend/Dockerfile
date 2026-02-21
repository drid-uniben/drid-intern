# syntax=docker/dockerfile:1.7

##############################
# Base image with Node + pnpm
##############################
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

##############################
# Dependencies (dev + prod)
##############################
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

##############################
# Build stage (TypeScript + Prisma)
##############################
FROM deps AS build
WORKDIR /app
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and build TypeScript
RUN pnpm prisma generate && pnpm run build

##############################
# Production dependencies
##############################
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy Prisma client from build stage
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

##############################
# Final runner image
##############################
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production deps + build outputs
COPY --from=prod-deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=build --chown=appuser:appgroup /app/package.json ./package.json

EXPOSE 4000
USER appuser

CMD ["node", "dist/index.js"]