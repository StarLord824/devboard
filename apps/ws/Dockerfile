FROM node:20-alpine AS base
RUN npm install -g pnpm@9.0.0 turbo

# ── Prune ────────────────────────────────────────────────────────────────────
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune ws --docker

# ── Install ──────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# ── Build ────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=ws
# Generate Prisma client inside the image
RUN pnpm --filter @devboard/db exec prisma generate

# ── Run ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 wsuser

COPY --from=builder --chown=wsuser:nodejs /app/apps/ws/dist ./dist
COPY --from=builder --chown=wsuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=wsuser:nodejs /app/packages ./packages

USER wsuser
EXPOSE 3002
CMD ["node", "dist/index.js"]
