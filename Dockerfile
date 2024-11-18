# Use Node.js 18 slim image
FROM node:18-slim

# Install dumb-init for proper process handling
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user and group
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions and only production deps
RUN npm ci --only=production

# Copy source files and set proper ownership
COPY --chown=nodejs:nodejs . .

# Set environment variables
ENV NODE_ENV="production"
ENV PORT=3000

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { timeout: 2000 }; \
    const req = http.request('http://localhost:3000/health', options, (res) => { \
        if (res.statusCode === 200) { process.exit(0); } \
        else { process.exit(1); } \
    }); \
    req.on('error', () => { process.exit(1); }); \
    req.end();"

# Use dumb-init as entrypoint to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "index.js"]