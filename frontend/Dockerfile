# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments for Next.js public env vars
ARG NEXT_PUBLIC_WORDPRESS_API_URL
ARG NEXT_PUBLIC_SITE_URL

# Set environment variables for the build process
ENV NEXT_PUBLIC_WORDPRESS_API_URL=${NEXT_PUBLIC_WORDPRESS_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

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

# Copy built application
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create next.config.mjs from the TypeScript version (converted to JS)
RUN echo "/** @type {import('next').NextConfig} */" > next.config.mjs && \
    echo "const nextConfig = {" >> next.config.mjs && \
    echo "  output: 'standalone'," >> next.config.mjs && \
    echo "  images: {" >> next.config.mjs && \
    echo "    remotePatterns: [" >> next.config.mjs && \
    echo "      { protocol: 'http', hostname: '**' }," >> next.config.mjs && \
    echo "      { protocol: 'https', hostname: '**' }" >> next.config.mjs && \
    echo "    ]" >> next.config.mjs && \
    echo "  }" >> next.config.mjs && \
    echo "};" >> next.config.mjs && \
    echo "export default nextConfig;" >> next.config.mjs

# Install production dependencies only
RUN npm ci --only=production --silent

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
