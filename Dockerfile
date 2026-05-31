# ── Stage 1: build the React app ──────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Turnstile test key — always passes, safe for local dev
ARG VITE_CF_TURNSTILE_SITE_KEY=1x00000000000000000000AA
ENV VITE_CF_TURNSTILE_SITE_KEY=$VITE_CF_TURNSTILE_SITE_KEY

# VITE_API_BASE_URL is intentionally empty — nginx proxies /api to the backend
RUN npm run build

# ── Stage 2: serve with nginx ──────────────────────────────────────────────────
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
