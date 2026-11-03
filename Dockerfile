# syntax=docker/dockerfile:1

# ---- Build stage: compile the production bundle ----
FROM node:22-alpine AS build
WORKDIR /workspace

# Install dependencies in their own layer so it stays cached until the lockfile changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage: nginx serving the static files and proxying /api ----
FROM nginx:stable-alpine

# Required at runtime: BACKEND_URL, e.g. http://app:3000 (no trailing slash or path).
# The image renders templates/ into conf.d/ on startup, replacing the default site.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/dist /usr/share/nginx/html

EXPOSE 80
