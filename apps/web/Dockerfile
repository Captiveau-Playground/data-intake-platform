# Football Intel Web - Standalone
FROM node:22-alpine AS builder

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY apps/web/package.json apps/web/package-lock.json* ./
RUN npm ci

COPY apps/web/ ./
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV HOSTNAME="0.0.0.0"
ENV PORT="3000"

EXPOSE 3000

CMD ["node", "server.js"]
