# multi-stage target: dev

FROM node:lts-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json tools/ ./
RUN npm install && \
  sh fixup-wmks.sh
COPY . .
RUN if [ -e "wmks.tar" ]; then tar xf wmks.tar -C node_modules/vmware-wmks; fi
RUN $(npm root)/.bin/ng build gameboard-ui -c production
CMD ["npm", "start"]

# multi-stage target: prod
FROM nginx:1.27.4-alpine-slim@sha256:b05aceb5ec1844435cae920267ff9949887df5b88f70e11d8b2871651a596612
WORKDIR /var/www
COPY --from=dev /app/dist/gameboard-ui/browser .
COPY --from=dev /app/dist/gameboard-ui/browser/assets/oidc-silent.html .
COPY --from=dev /app/LICENSE.md ./LICENSE.md
COPY --from=dev /app/nginx-static.conf /etc/nginx/conf.d/default.conf
COPY --from=dev /app/nginx-basehref.sh /docker-entrypoint.d/90-basehref.sh
RUN chmod +x /docker-entrypoint.d/90-basehref.sh
EXPOSE 80
