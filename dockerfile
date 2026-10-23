# Multi-stage build: build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build tools needed by native modules (e.g. bcrypt, sharp, etc.)
RUN apk add --no-cache python3 make g++

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (devDeps are needed for `nest build`)
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Prune devDependencies to keep the final image small
RUN npm prune --production

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only production dependencies and built app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
