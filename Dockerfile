# multi-stage target: dev

FROM node:lts-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json tools/ ./
RUN npm install
COPY . .
RUN $(npm root)/.bin/ng build gameboard-ui -c production
CMD ["npm", "start"]

# multi-stage target: prod
FROM nginx:1.31.8-alpine-slim@sha256:f45171d36c76a8b2f5ef97108a3a8a2294248a6578a0a180edc2d78f7d2edc26
WORKDIR /var/www
COPY --from=dev /app/dist/gameboard-ui/browser .
COPY --from=dev /app/dist/gameboard-ui/browser/assets/oidc-silent.html .
COPY --from=dev /app/LICENSE.md ./LICENSE.md
COPY --from=dev /app/nginx-static.conf /etc/nginx/conf.d/default.conf
COPY --from=dev /app/nginx-basehref.sh /docker-entrypoint.d/90-basehref.sh
RUN chmod +x /docker-entrypoint.d/90-basehref.sh
EXPOSE 80
