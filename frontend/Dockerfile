# syntax=docker/dockerfile:1

# =============================
# 1️⃣ Build Stage (Angular)
# =============================
FROM node:22.13.1-slim AS builder
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
RUN yarn global add @angular/cli

# Copy source and build Angular app
COPY . .
RUN npx ng build --configuration production

# =============================
# 2️⃣ Production Stage (NGINX)
# =============================
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Clean default Nginx static files
RUN rm -rf ./*

# Copy Angular build output
COPY --from=builder /app/dist/frontend/browser/ ./

# Copy Nginx config template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Set Cloud Run default port
ENV PORT 8080

# Expose port
EXPOSE 8080

CMD ["sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -t && exec nginx -g 'daemon off;'"]