# syntax=docker/dockerfile:1

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
# Do not set PORT here. Railway injects it; listen.cjs defaults to 3000
# only when PORT is unset. Forcing 3000 while the proxy targets another
# port is a common 502.
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/data ./data
COPY --from=build --chown=nextjs:nodejs /app/scripts/listen.cjs ./listen.cjs
USER nextjs
EXPOSE 3000
CMD ["node", "listen.cjs"]
