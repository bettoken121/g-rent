FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY apps/api/package.json apps/api/

RUN npm install --workspaces --include-workspace-root

COPY packages/ packages/
COPY apps/api/ apps/api/
COPY tsconfig.base.json ./

RUN cd packages/types && npm run build
RUN cd packages/utils && npm run build
RUN cd apps/api && npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types/dist packages/types/dist
COPY --from=builder /app/packages/types/package.json packages/types/
COPY --from=builder /app/packages/utils/dist packages/utils/dist
COPY --from=builder /app/packages/utils/package.json packages/utils/
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/package.json apps/api/
COPY --from=builder /app/apps/api/node_modules apps/api/node_modules

EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
