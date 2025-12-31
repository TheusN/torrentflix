# Multi-stage Dockerfile for TorrentFlix
# Otimizado para Easypanel

# ============================================
# Stage 1: Build the client (React + Vite)
# ============================================
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy client source
COPY client/ ./

# Build client
RUN npm run build

# ============================================
# Stage 2: Build the server (TypeScript)
# ============================================
FROM node:20-alpine AS server-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy server source
COPY server/ ./

# Build server
RUN npm run build

# ============================================
# Stage 3: Production image
# ============================================
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 torrentflix && \
    adduser -u 1001 -G torrentflix -s /bin/sh -D torrentflix

WORKDIR /app

# Copy server package files and install production dependencies
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built server
COPY --from=server-builder /app/server/dist ./dist

# Copy built client to be served by Express
COPY --from=client-builder /app/client/dist ./client/dist

# Create directories for data persistence
RUN mkdir -p /app/data /app/downloads && \
    chown -R torrentflix:torrentflix /app

# Switch to non-root user
USER torrentflix

# ============================================
# Environment Variables
# ============================================
# Aplicacao
ENV NODE_ENV=production
ENV PORT=3000

# JWT (valores padrao - ALTERE EM PRODUCAO!)
ENV JWT_SECRET=torrentflix-jwt-secret-change-in-production
ENV JWT_REFRESH_SECRET=torrentflix-refresh-secret-change-in-production
ENV JWT_ACCESS_EXPIRY=15m
ENV JWT_REFRESH_EXPIRY=7d

# qBittorrent (configure via painel admin)
ENV QBITTORRENT_HOST=http://localhost
ENV QBITTORRENT_PORT=8080
ENV QBITTORRENT_USER=admin
ENV QBITTORRENT_PASS=adminadmin

# Jackett (configure via painel admin)
ENV JACKETT_HOST=http://localhost
ENV JACKETT_PORT=9117
ENV JACKETT_API_KEY=

# Sonarr (configure via painel admin)
ENV SONARR_HOST=http://localhost
ENV SONARR_PORT=8989
ENV SONARR_API_KEY=

# Radarr (configure via painel admin)
ENV RADARR_HOST=http://localhost
ENV RADARR_PORT=7878
ENV RADARR_API_KEY=

# TMDB (configure via painel admin)
ENV TMDB_API_KEY=

# Paths
ENV DOWNLOAD_PATH=/app/downloads
ENV MEDIA_PATH=/app/media

# ============================================
# Expose and Run
# ============================================
# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]
