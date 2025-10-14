FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (clean cache for smaller image)
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN PUBLIC_URL=/admin npm run build

# Install serve globally
RUN npm install -g serve

# Expose port
EXPOSE 3008

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3008/ || exit 1

# Start the application
CMD ["serve", "-s", "build", "-l", "3008"]
