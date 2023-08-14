FROM node:18
LABEL authors="Tim"

WORKDIR /app
RUN git clone https://github.com/timzolleis/slack-alert.git .
WORKDIR /
COPY .env /app/.env
WORKDIR /app


RUN npm ci --omit=dev

ENTRYPOINT ["npx", "ts-node", "src/index.ts"]