# BUILD STAGE
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY packages/common ./packages/common
COPY apps/auth-service ./apps/auth-service

RUN npm install
RUN npx turbo run build --filter=auth-service...

# RUN STAGE
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built files and production node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/auth-service/dist ./dist
COPY --from=builder /app/apps/auth-service/package.json ./package.json
COPY --from=builder /app/packages/common/dist ./packages/common/dist

EXPOSE 3001
CMD ["node", "dist/index.js"]