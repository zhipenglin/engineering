FROM node:8-alpine

WORKDIR /app

COPY . ./


RUN cat hosts.tmp >> /etc/hosts \
    && npm install --registry=http://npm.zhinanzhen.ai --production

EXPOSE 7100

ENV EGG_SERVER_ENV stage

CMD npm run docker-start


