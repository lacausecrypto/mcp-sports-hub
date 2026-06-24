# syntax=docker/dockerfile:1
# Container image for Sports Hub MCP Server.
# Primary target: Smithery custom-container hosting (see smithery.yaml), but the
# image is generic — it defaults to stdio so it also works with the Docker MCP
# Gateway / any `docker run -i` consumer. Smithery enables HTTP via env vars.

# ---- build stage: compile TypeScript -> dist/ ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime stage: production deps + compiled output only ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

# Smithery provides the listening port via the PORT env var (e.g. 8081) and
# enables HTTP mode through smithery.yaml `env`. We map PORT -> SPORTS_HUB_PORT
# at start; the image still defaults to stdio when neither PORT nor HTTP is set.
EXPOSE 8081
CMD ["sh", "-c", "SPORTS_HUB_PORT=\"${PORT:-${SPORTS_HUB_PORT:-3000}}\" exec node dist/index.js"]
