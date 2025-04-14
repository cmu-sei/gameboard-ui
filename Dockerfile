# multi-stage target: dev

FROM node:slim@sha256:dfb18d8011c0b3a112214a32e772d9c6752131ffee512e974e59367e46fcee52 AS dev
WORKDIR /app
COPY package.json package-lock.json tools/ ./
RUN npm install && \
  sh fixup-wmks.sh
COPY . .
RUN if [ -e "wmks.tar" ]; then tar xf wmks.tar -C node_modules/vmware-wmks; fi
RUN $(npm root)/.bin/ng build gameboard-consoles --prod --output-path /app/dist
RUN $(npm root)/.bin/ng build gameboard-ui --prod --output-path /app/dist
CMD ["npm", "start"]

# multi-stage target: prod
FROM nginx:1.27.4-alpine-slim@sha256:b05aceb5ec1844435cae920267ff9949887df5b88f70e11d8b2871651a596612
WORKDIR /var/www
COPY --from=dev /app/dist .
COPY --from=dev /app/dist/assets/oidc-silent.html .
COPY --from=dev /app/LICENSE.md ./LICENSE.md
COPY --from=dev /app/nginx-static.conf /etc/nginx/conf.d/default.conf
COPY --from=dev /app/nginx-basehref.sh /docker-entrypoint.d/90-basehref.sh
RUN chmod +x /docker-entrypoint.d/90-basehref.sh
EXPOSE 80
