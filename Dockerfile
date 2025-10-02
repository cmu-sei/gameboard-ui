# multi-stage target: dev
FROM node:lts-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json tools/ ./
RUN npm ci
COPY . .
RUN $(npm root)/.bin/ng build gameboard-ui -c production

# multi-stage target: prod
FROM nginxinc/nginx-unprivileged:stable-alpine
USER root

# copy nginx configuration
COPY --from=dev /app/nginx-static.conf /etc/nginx/conf.d/default.conf
COPY --from=dev /app/nginx-basehref.sh /docker-entrypoint.d/90-basehref.sh

# flush contents 
WORKDIR /usr/share/nginx/html
RUN rm -rf .
COPY --from=dev /app/dist/gameboard-ui/browser .
COPY --from=dev /app/dist/gameboard-ui/browser/assets/oidc-silent.html .
RUN chown -R nginx:nginx .
RUN chmod +x /docker-entrypoint.d/90-basehref.sh

# give up privileges and run
USER nginx
EXPOSE 8080
