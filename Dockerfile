# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable


FROM base AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM backend-deps AS backend-build
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/prisma ./prisma
COPY backend/src ./src
RUN pnpm prisma generate && pnpm run build

FROM base AS backend-prod-deps
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM node:22-alpine AS backend-runner
ENV NODE_ENV=production
WORKDIR /app/backend
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=backend-prod-deps --chown=appuser:appgroup /app/backend/node_modules ./node_modules
COPY --from=backend-build --chown=appuser:appgroup /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-build --chown=appuser:appgroup /app/backend/dist ./dist
COPY --from=backend-build --chown=appuser:appgroup /app/backend/prisma ./prisma
COPY --from=backend-build --chown=appuser:appgroup /app/backend/package.json ./package.json
EXPOSE 4000
USER appuser
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/index.js"]


FROM base AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM frontend-deps AS frontend-build
COPY frontend/ ./
RUN pnpm run build

FROM base AS frontend-prod-deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM node:22-alpine AS frontend-runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app/frontend
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=frontend-prod-deps --chown=appuser:appgroup /app/frontend/node_modules ./node_modules
COPY --from=frontend-build --chown=appuser:appgroup /app/frontend/.next ./.next
COPY --from=frontend-build --chown=appuser:appgroup /app/frontend/public ./public
COPY --from=frontend-build --chown=appuser:appgroup /app/frontend/package.json ./package.json
COPY --from=frontend-build --chown=appuser:appgroup /app/frontend/next.config.ts ./next.config.ts
EXPOSE 3000
USER appuser
CMD ["sh", "-c", "node_modules/.bin/next start -H 0.0.0.0 -p ${PORT:-3000}"]
