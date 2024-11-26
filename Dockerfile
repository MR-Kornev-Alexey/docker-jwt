FROM node:22 AS builder

WORKDIR /app

COPY .env ./
COPY .env /app/telegamBot/

RUN ls -la /app/
RUN ls -la /app/telegamBot/

COPY package*.json ./
COPY prisma ./prisma/
# Установка Prisma CLI глобально
RUN npm install -g prisma
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:22

RUN mkdir -p /app/
WORKDIR /app/

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/telegamBot /app/telegamBot
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/prisma /app/prisma

EXPOSE 8000
CMD [ "npm", "run", "start:prod" ]
