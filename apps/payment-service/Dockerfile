# STAGE 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages/common ./packages/common
COPY apps/payment-service ./apps/payment-service

RUN npm install
RUN npx turbo run build --filter=payment-service...

# STAGE 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/packages/common/package.json ./packages/common/
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/apps/payment-service/package.json ./apps/payment-service/
COPY --from=builder /app/apps/payment-service/dist ./apps/payment-service/dist

RUN npm install --omit=dev

EXPOSE 3002

WORKDIR /app/apps/payment-service
CMD ["node", "dist/index.js"]