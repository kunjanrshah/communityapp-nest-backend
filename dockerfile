# Multi-stage build: build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build tools needed by native modules (e.g. bcrypt, sharp, etc.)
RUN apk add --no-cache python3 make g++

# Enable pnpm via corepack
RUN corepack enable

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (devDeps are needed for `nest build` and `prisma generate`)
RUN pnpm install

# Copy source code (including prisma schema)
COPY . .

# Generate Prisma Client types from schema.prisma before building.
# `prisma generate` does NOT connect to the database, but it requires
# DATABASE_URL to be defined to resolve the datasource. A dummy value is
# sufficient at build time; the real URL is injected at runtime via .env.
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    npx prisma generate --schema prisma/schema.prisma

# Build the NestJS application (Prisma Client types now exist)
RUN pnpm run build

# Prune devDependencies to keep the final image small.
# --ignore-scripts prevents the `prepare` lifecycle (husky install) from
# running; husky is a devDependency removed by prune and isn't needed in prod.
RUN pnpm prune --production --ignore-scripts

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
CMD ["node", "dist/src/main"]
