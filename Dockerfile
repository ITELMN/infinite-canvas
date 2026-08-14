# 构建前端
FROM oven/bun:1.3.13 AS web-build

WORKDIR /app/web
COPY web/package.json web/bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --cache-dir=/root/.bun/install/cache
COPY VERSION /app/VERSION
COPY CHANGELOG.md /app/CHANGELOG.md
COPY web ./
RUN bun run build

# 运行镜像：Express 托管静态文件 + 共享配置 API
FROM node:22-alpine

WORKDIR /app
RUN npm install express

COPY server.js ./
COPY --from=web-build /app/web/dist ./web/dist
COPY --from=web-build /app/VERSION ./
COPY --from=web-build /app/CHANGELOG.md ./

# 配置数据持久化目录
RUN mkdir -p /data

ENV PORT=3000
ENV DATA_DIR=/data
EXPOSE 3000

CMD ["node", "server.js"]
