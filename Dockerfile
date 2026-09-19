FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/vue/package.json ./packages/vue/package.json
COPY packages/elements/package.json ./packages/elements/package.json
RUN npm ci
COPY . .
ENV SITE_BASE=/
RUN npm run build && npm run build:site

FROM caddy:2-alpine
RUN mkdir -p /srv /data/caddy /config/caddy \
    && chown -R 10001:10001 /srv /data /config
COPY --from=build /app/site-dist/ /srv/
COPY deploy/docs.Caddyfile /etc/caddy/Caddyfile
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["caddy"]
CMD ["run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
