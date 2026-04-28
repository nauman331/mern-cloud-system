# STAGE 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace configs
COPY package*.json ./
COPY turbo.json ./

# Copy source code
COPY packages/common ./packages/common
COPY apps/auth-service ./apps/auth-service

# Install all dependencies and build
RUN npm install
RUN npx turbo run build --filter=auth-service...

# STAGE 2: Runner (Production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 1. Copy the root package.json so npm knows this is a workspace
COPY package*.json ./

# 2. Copy the compiled common package and its package.json
COPY --from=builder /app/packages/common/package.json ./packages/common/
COPY --from=builder /app/packages/common/dist ./packages/common/dist

# 3. Copy the compiled auth service and its package.json
COPY --from=builder /app/apps/auth-service/package.json ./apps/auth-service/
COPY --from=builder /app/apps/auth-service/dist ./apps/auth-service/dist

# 4. Install production dependencies. 
# Because the root package.json is here, npm will automatically link @cloud-system/common!
RUN npm install --omit=dev

EXPOSE 3001

# 5. Set the working directory to the auth service and run
WORKDIR /app/apps/auth-service
CMD ["node", "dist/index.js"]