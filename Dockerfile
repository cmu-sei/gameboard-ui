# multi-stage target: dev

FROM node:lts-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json tools/ ./
RUN npm install
COPY . .
RUN $(npm root)/.bin/ng build gameboard-ui -c production
CMD ["npm", "start"]

# multi-stage target: prod
FROM nginx:1.31.7-alpine-slim@sha256:ebd058041a732a2b2dc0b606e34572dd8e0034de6a4aa4d50d8c13a240ac6005
WORKDIR /var/www
COPY --from=dev /app/dist/gameboard-ui/browser .
COPY --from=dev /app/dist/gameboard-ui/browser/assets/oidc-silent.html .
COPY --from=dev /app/LICENSE.md ./LICENSE.md
COPY --from=dev /app/nginx-static.conf /etc/nginx/conf.d/default.conf
COPY --from=dev /app/nginx-basehref.sh /docker-entrypoint.d/90-basehref.sh
RUN chmod +x /docker-entrypoint.d/90-basehref.sh
EXPOSE 80
