# syntax=docker/dockerfile:1
# ビルドコンテキストはリポジトリルート: docker build -f frontend/Dockerfile .
#
# `output: "standalone"` の成果物(.next/standalone)は使わない。Turbopack のビルドでは、実行時に読み込むチャンクの
# 一部が standalone に含まれず、全リクエストが 500 になる。ビルドした .next と本番依存をそのまま置いて `next start` で動かす。

FROM node:24-slim AS build
WORKDIR /repo
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY frontend/package.json frontend/
RUN pnpm install --frozen-lockfile --filter @app/frontend...
COPY frontend frontend
RUN pnpm --filter @app/frontend build
RUN pnpm --filter @app/frontend deploy --prod /out
RUN cp -r frontend/.next /out/.next && rm -rf /out/.next/standalone /out/.next/cache

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/package.json /out/next.config.ts ./
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/public ./public
# Next.js の実行時キャッシュを非 root ユーザーが作成できるようにする。
COPY --chown=node:node --from=build /out/.next ./.next
USER node
EXPOSE 3000
ENV PORT=3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0"]
