# ==============================================================================
# Builder Stage
# ==============================================================================
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies using clean install
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy workspace source files
COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable telemetry and build static assets
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ==============================================================================
# Runtime Stage
# ==============================================================================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy next built assets and production node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/server-https.js ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000 3443

# Set healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-check-certificate --no-verbose --tries=1 --spider ${HEALTHCHECK_URL:-http://localhost:3000/} || exit 1

CMD ["npm", "run", "start"]
