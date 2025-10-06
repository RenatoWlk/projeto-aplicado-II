# syntax=docker/dockerfile:1

# ----------- Build Stage -----------
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Copy dependency files
COPY --link package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy all source files
COPY --link . .

# Build Angular app (production)
RUN yarn build

# ----------- Production Stage (Nginx) -----------
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Clean default Nginx content
RUN rm -rf ./*

# Copy Angular build output to Nginx root
COPY --from=builder /app/dist/frontend/* ./

# Copy custom Nginx config (to handle /api and routes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 2000

CMD ["nginx", "-g", "daemon off;"]
