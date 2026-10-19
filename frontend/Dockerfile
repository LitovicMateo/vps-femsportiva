# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments for Next.js public env vars
ARG NEXT_PUBLIC_WORDPRESS_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WORDPRESS_URL
ARG NEXT_PUBLIC_GSC_VERIFICATION
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_ADSENSE_CLIENT

# Set environment variables for the build process
ENV NEXT_PUBLIC_WORDPRESS_API_URL=${NEXT_PUBLIC_WORDPRESS_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_WORDPRESS_URL=${NEXT_PUBLIC_WORDPRESS_URL}
ENV NEXT_PUBLIC_GSC_VERIFICATION=${NEXT_PUBLIC_GSC_VERIFICATION}
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}
ENV NEXT_PUBLIC_ADSENSE_CLIENT=${NEXT_PUBLIC_ADSENSE_CLIENT}

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy the standalone server. Next's standalone output already bundles the
# minimal runtime node_modules and its own package.json, so there is no second
# `npm ci` here (the previous one re-installed the full dependency tree on top
# of the bundle — wasted layers and a larger image). `public` and `.next/static`
# must still be copied alongside it manually.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Liveness probe (also declared in the compose overlays; kept here so the image
# is self-describing for `docker run` / base compose).
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
