# Build stage
FROM node:20-alpine AS builder

# Install npm and pnpm
RUN apk add --no-cache npm && npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the app using Docker-specific config
RUN pnpm vite build --config ./vite.config.docker.ts && pnpm tsc --noEmit

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]