# Multi-stage build for production

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client ./
RUN npm run build

# Stage 2: Backend + serve static files
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY server ./server
COPY public-site ./public-site

# Copy built frontend from stage 1
COPY --from=frontend-build /app/client/build ./client/build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start server
CMD ["node", "server/index.js"]
