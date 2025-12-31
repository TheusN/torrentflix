# Multi-stage Dockerfile for TorrentFlix
# Otimizado para Easypanel

# ============================================
# Stage 1: Build the client (React + Vite)
# ============================================
FROM node:20-alpine AS client-builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ============================================
# Stage 2: Build the server (TypeScript)
# ============================================
FROM node:20-alpine AS server-builder

WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# ============================================
# Stage 3: Production image
# ============================================
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 torrentflix && \
    adduser -u 1001 -G torrentflix -s /bin/sh -D torrentflix

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=server-builder /app/server/dist ./dist
COPY --from=client-builder /app/client/dist ./client/dist

RUN mkdir -p /app/data /app/downloads && \
    chown -R torrentflix:torrentflix /app

USER torrentflix

# ============================================
# Environment Variables (non-sensitive only)
# ============================================
ENV NODE_ENV=production
ENV PORT=3000
ENV JWT_ACCESS_EXPIRY=15m
ENV JWT_REFRESH_EXPIRY=7d
ENV DOWNLOAD_PATH=/app/downloads
ENV MEDIA_PATH=/app/media

# ============================================
# CONFIGURE ESTAS VARIAVEIS NO EASYPANEL:
# ============================================
# DATABASE_URL=postgres://user:pass@host:5432/db  (OBRIGATORIO)
# JWT_SECRET=seu-secret-aqui                      (OBRIGATORIO)
# JWT_REFRESH_SECRET=seu-refresh-secret           (OBRIGATORIO)
# ============================================

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]
