FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY apps/gps-server/package.json apps/gps-server/

RUN npm install --workspaces --include-workspace-root

COPY packages/ packages/
COPY apps/gps-server/ apps/gps-server/
COPY tsconfig.base.json ./

RUN cd packages/types && npm run build
RUN cd packages/utils && npm run build
RUN cd apps/gps-server && npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types/dist packages/types/dist
COPY --from=builder /app/packages/types/package.json packages/types/
COPY --from=builder /app/packages/utils/dist packages/utils/dist
COPY --from=builder /app/packages/utils/package.json packages/utils/
COPY --from=builder /app/apps/gps-server/dist apps/gps-server/dist
COPY --from=builder /app/apps/gps-server/package.json apps/gps-server/
COPY --from=builder /app/apps/gps-server/node_modules apps/gps-server/node_modules

EXPOSE 5000

CMD ["node", "apps/gps-server/dist/index.js"]
