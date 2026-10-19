# NDF web. Multi-stage build, Next.js standalone output.
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/web ./
COPY corpus /corpus
ENV NEXT_TELEMETRY_DISABLED=1
ENV CORPUS_DIR=/corpus
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
RUN npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 CORPUS_DIR=/corpus UPLOAD_DIR=/data/uploads
RUN groupadd -r ndf && useradd -r -g ndf ndf && mkdir -p /data/uploads /app/.next/cache && chown -R ndf:ndf /data /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src/content ./src/content
COPY --from=build /app/node_modules/pg ./node_modules/pg
COPY --from=build /app/node_modules/pg-pool ./node_modules/pg-pool
COPY --from=build /app/node_modules/pg-protocol ./node_modules/pg-protocol
COPY --from=build /app/node_modules/pg-types ./node_modules/pg-types
COPY --from=build /app/node_modules/pg-connection-string ./node_modules/pg-connection-string
COPY --from=build /app/node_modules/pgpass ./node_modules/pgpass
COPY --from=build /app/node_modules/postgres-array ./node_modules/postgres-array
COPY --from=build /app/node_modules/postgres-bytea ./node_modules/postgres-bytea
COPY --from=build /app/node_modules/postgres-date ./node_modules/postgres-date
COPY --from=build /app/node_modules/postgres-interval ./node_modules/postgres-interval
COPY --from=build /app/node_modules/pg-int8 ./node_modules/pg-int8
COPY --from=build /app/node_modules/pg-cloudflare ./node_modules/pg-cloudflare
COPY --from=build /app/node_modules/split2 ./node_modules/split2
COPY --from=build /app/node_modules/xtend ./node_modules/xtend
COPY --from=build /corpus /corpus
COPY db/migrations /app/db/migrations
COPY scripts/smoke.mjs /app/scripts/smoke.mjs
ENV MIGRATIONS_DIR=/app/db/migrations
RUN mkdir -p /app/.next/cache && chown -R ndf:ndf /app/.next/cache
USER ndf
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
