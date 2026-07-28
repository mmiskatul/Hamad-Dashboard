FROM node:22-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM dependencies AS development

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

FROM dependencies AS builder

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/.next-build ./.next-build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000
CMD ["npm", "run", "start"]

